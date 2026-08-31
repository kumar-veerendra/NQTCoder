import { compilerQueue, QueueCapacityError } from '../utils/compilerQueue.js';
import { runLocalCodeMulti } from '../utils/localRunner.js';

const pyCode = 'import sys\ninput_data = sys.stdin.read().split()\nif input_data:\n    n, max_sum = int(input_data[0]), int(input_data[1])\n    costs = [int(x) for x in input_data[2:2+n]]\n    dp = [False] * (max_sum + 1)\n    dp[0] = True\n    for c in costs:\n        for j in range(max_sum, c - 1, -1):\n            if dp[j - c]:\n                dp[j] = True\n    for j in range(max_sum, -1, -1):\n        if dp[j]:\n            print(j)\n            break\n';
const cppCode = '#include <iostream>\n#include <vector>\nusing namespace std;\nint main() { int n; long long max_sum; if (!(cin >> n >> max_sum)) return 0; vector<long long> costs(n); for (int i = 0; i < n; i++) cin >> costs[i]; vector<bool> dp(max_sum + 1, false); dp[0] = true; for (int i = 0; i < n; i++) { long long c = costs[i]; for (long long j = max_sum; j >= c; j--) { if (dp[j - c]) dp[j] = true; } } for (long long j = max_sum; j >= 0; j--) { if (dp[j]) { cout << j << endl; break; } } return 0; }';

const sampleInputs = [
  '4 10\n2 3 5 7',
  '3 9\n4 8 6',
  '3 5\n1 2 3',
  '2 5\n2 4',
  '1 100\n50',
  '5 20\n1 2 3 4 5',
  '4 15\n5 5 5 5',
  '3 10\n10 20 30',
  '4 11\n2 4 6 8'
];

async function pollJob(jobId) {
  const t0 = performance.now();
  while (true) {
    const job = compilerQueue.getJobStatus(jobId);
    if (!job) throw new Error('Job not found');
    if (job.status === 'completed') {
      return { elapsed: performance.now() - t0, result: job.result, status: 'completed' };
    }
    if (job.status === 'failed') {
      return { elapsed: performance.now() - t0, error: job.error, status: 'failed' };
    }
    await new Promise(r => setTimeout(r, 100));
  }
}

async function runLoadTestScenario(name, submissionCount, lang = 'python') {
  console.log(`\n================================================================`);
  console.log(`  LOAD SCENARIO: ${name} (${submissionCount} Submissions, Lang: ${lang})`);
  console.log(`================================================================`);

  const initialMemory = process.memoryUsage().rss / (1024 * 1024);
  const codeToRun = lang === 'cpp' ? cppCode : pyCode;
  const submissions = [];
  const rejected = [];
  const tStartAll = performance.now();

  for (let i = 0; i < submissionCount; i++) {
    const submitStart = performance.now();
    try {
      const runFn = async () => {
        const tStartExec = performance.now();
        const res = await runLocalCodeMulti(codeToRun, lang, sampleInputs, 2);
        const execDuration = performance.now() - tStartExec;
        return { res, execDuration };
      };

      const jobStatus = compilerQueue.enqueue(runFn);
      submissions.push({
        index: i + 1,
        jobId: jobStatus.jobId,
        submitTime: submitStart
      });
    } catch (err) {
      if (err instanceof QueueCapacityError || err.statusCode === 429) {
        rejected.push({ index: i + 1, error: err.message });
      } else {
        throw err;
      }
    }
  }

  console.log(`  Enqueued: ${submissions.length} jobs | Rejected (HTTP 429): ${rejected.length} jobs`);

  // Wait for all enqueued submissions to complete
  const results = await Promise.all(
    submissions.map(async (s) => {
      const pollRes = await pollJob(s.jobId);
      const totalJobLatency = performance.now() - s.submitTime;
      return {
        index: s.index,
        totalLatency: totalJobLatency,
        backendDuration: pollRes.result?.execDuration || 0,
        status: pollRes.status
      };
    })
  );

  const totalTime = performance.now() - tStartAll;
  const finalMemory = process.memoryUsage().rss / (1024 * 1024);

  const latencies = results.map(r => r.totalLatency).sort((a, b) => a - b);
  const min = latencies[0] || 0;
  const max = latencies[latencies.length - 1] || 0;
  const avg = latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1);
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const throughputPerMin = ((results.length / totalTime) * 60000).toFixed(1);

  console.log(`  Completed: ${results.filter(r => r.status === 'completed').length}/${results.length}`);
  console.log(`  Total Scenario Time: ${(totalTime / 1000).toFixed(2)}s`);
  console.log(`  Throughput Rate:     ${throughputPerMin} submissions/minute`);
  console.log(`  Latency Metrics:     Min: ${min.toFixed(0)}ms | p50: ${p50.toFixed(0)}ms | Avg: ${avg.toFixed(0)}ms | p95: ${p95.toFixed(0)}ms | Max: ${max.toFixed(0)}ms`);
  console.log(`  Memory Impact (RSS): Initial: ${initialMemory.toFixed(1)}MB -> Final: ${finalMemory.toFixed(1)}MB (Delta: ${(finalMemory - initialMemory).toFixed(1)}MB)`);

  return {
    name,
    submissionCount,
    completed: results.length,
    rejected: rejected.length,
    throughputPerMin,
    min,
    p50,
    avg,
    p95,
    max,
    rssDelta: finalMemory - initialMemory
  };
}

async function runAllLoadTests() {
  console.log('================================================================');
  console.log('       NQTCoder Queue Load & Concurrency Benchmark Suite        ');
  console.log('================================================================');

  // Scenario 1: 1 Single User
  await runLoadTestScenario('Single User Baseline', 1, 'python');

  // Scenario 2: 2 Simultaneous Submissions
  await runLoadTestScenario('2 Concurrent Submissions', 2, 'python');

  // Scenario 3: 5 Queued Submissions Burst
  await runLoadTestScenario('5 Queued Burst (Python)', 5, 'python');

  // Scenario 4: 10 Queued Submissions Burst
  await runLoadTestScenario('10 Queued Burst (Python)', 10, 'python');

  // Scenario 5: 20 Queued Submissions Burst
  await runLoadTestScenario('20 Queued Burst (Python)', 20, 'python');

  // Scenario 6: Overload Capacity Test (35 Submissions with MAX_QUEUE_SIZE=30)
  await runLoadTestScenario('35 Overload Test (Capacity Limit Check)', 35, 'python');

  console.log('\n================================================================');
  console.log('                LOAD TESTING SUITE COMPLETE                     ');
  console.log('================================================================\n');
}

runAllLoadTests().catch(console.error);
