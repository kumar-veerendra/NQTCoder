import { runLocalCodeMulti } from '../utils/localRunner.js';
import User from '../models/User.js';

const questionData = {
  visibleTestCases: [
    { input: '4 10\n2 3 5 7', output: '10' },
    { input: '3 9\n4 8 6', output: '8' },
    { input: '3 5\n1 2 3', output: '5' }
  ],
  hiddenTestCases: [
    { input: '2 5\n2 4', output: '4' },
    { input: '1 100\n50', output: '50' },
    { input: '5 20\n1 2 3 4 5', output: '15' },
    { input: '4 15\n5 5 5 5', output: '15' },
    { input: '3 10\n10 20 30', output: '10' },
    { input: '4 11\n2 4 6 8', output: '10' }
  ]
};

const allTestCases = [...questionData.visibleTestCases, ...questionData.hiddenTestCases];
const inputs = allTestCases.map(tc => tc.input);

const cppCode = '#include <iostream>\n#include <vector>\nusing namespace std;\nint main() { int n; long long max_sum; if (!(cin >> n >> max_sum)) return 0; vector<long long> costs(n); for (int i = 0; i < n; i++) cin >> costs[i]; vector<bool> dp(max_sum + 1, false); dp[0] = true; for (int i = 0; i < n; i++) { long long c = costs[i]; for (long long j = max_sum; j >= c; j--) { if (dp[j - c]) dp[j] = true; } } for (long long j = max_sum; j >= 0; j--) { if (dp[j]) { cout << j << endl; break; } } return 0; }';

const javaCode = 'import java.util.Scanner;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (!sc.hasNextInt()) return;\n    int n = sc.nextInt();\n    int maxSum = sc.nextInt();\n    int[] costs = new int[n];\n    for (int i = 0; i < n; i++) costs[i] = sc.nextInt();\n    boolean[] dp = new boolean[maxSum + 1];\n    dp[0] = true;\n    for (int c : costs) {\n      for (int j = maxSum; j >= c; j--) {\n        if (dp[j - c]) dp[j] = true;\n      }\n    }\n    for (int j = maxSum; j >= 0; j--) {\n      if (dp[j]) { System.out.println(j); break; }\n    }\n  }\n}';

const pythonCode = 'import sys\ninput_data = sys.stdin.read().split()\nif input_data:\n    n, max_sum = int(input_data[0]), int(input_data[1])\n    costs = [int(x) for x in input_data[2:2+n]]\n    dp = [False] * (max_sum + 1)\n    dp[0] = True\n    for c in costs:\n        for j in range(max_sum, c - 1, -1):\n            if dp[j - c]:\n                dp[j] = True\n    for j in range(max_sum, -1, -1):\n        if dp[j]:\n            print(j)\n            break\n';

export async function runFullBenchmark(label = 'Baseline', customOptions = {}) {
  console.log(`\n================================================================`);
  console.log(`   NQTCoder Benchmark: ${label}`);
  console.log(`================================================================\n`);

  const mockUser = User.hydrate({
    _id: '507f1f77bcf86cd799439011',
    username: 'benchmark_student',
    email: 'student@nqtcoder.dev',
    password: '$2a$10$abcdefghijklmnopqrstuu',
    submissionsCount: 5,
    solvedQuestions: [],
    solvedCount: { easy: 2, medium: 2, hard: 1 }
  });

  const runLang = async (langName, code, langId) => {
    console.log(`--- Benchmarking 5 Full Runs for ${langName} (9 Test Cases) ---`);
    const runs = [];
    for (let r = 1; r <= 5; r++) {
      const tStart = performance.now();

      // 1. Request / Auth simulation
      const tAuth = 1.0;

      // 2. Queue scheduling simulation
      const tQueue = 0.5;

      // 3. Execution (Compile + 9 Test Cases)
      const tExecStart = performance.now();
      const execRes = await runLocalCodeMulti(code, langId, inputs, 2);
      const tExec = performance.now() - tExecStart;

      // 4. Result verdict check
      let passed = 0;
      for (let i = 0; i < allTestCases.length; i++) {
        if (execRes.results && execRes.results[i]?.stdout?.trim() === allTestCases[i].output.trim()) {
          passed++;
        }
      }

      // 5. DB Persistence simulation (User pre-save hook with fix)
      const tUserSaveStart = performance.now();
      mockUser.submissionsCount += 1;
      mockUser.solvedCount.medium += 1;
      await new Promise((resolve) => {
        mockUser.schema.s.hooks.execPre('save', mockUser, () => resolve());
      });
      const tUserSave = performance.now() - tUserSaveStart;
      const tDbTotal = tUserSave + 40.0; // ~40ms network write

      // 6. Polling simulation
      const pollingInterval = customOptions.pollingDelay || 1000;
      // Fixed 1000ms polling vs adaptive:
      let tPollingLag = 500.0; // average fixed 1000ms delay lag
      if (customOptions.adaptivePolling) {
        // Adaptive schedule: [0, 150, 250, 400, 600, 1000]
        // If execution finishes at tExec, the next poll tick triggers in ~75ms on average
        tPollingLag = 75.0;
      }

      const totalBackend = tAuth + tQueue + tExec + tDbTotal;
      const totalUserPerceived = totalBackend + tPollingLag;

      runs.push({
        run: r,
        backendTime: totalBackend,
        pollingLag: tPollingLag,
        userPerceivedTime: totalUserPerceived,
        execTime: tExec,
        dbTime: tDbTotal,
        passed
      });

      console.log(`  Run #${r}: Backend = ${totalBackend.toFixed(1)} ms | Polling Lag = ${tPollingLag.toFixed(1)} ms | User-Perceived = ${totalUserPerceived.toFixed(1)} ms (Passed: ${passed}/9)`);
    }

    const calcStats = (arr) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
      const med = sorted[Math.floor(sorted.length / 2)];
      const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))];
      return { min, max, avg, med, p95 };
    };

    const backendStats = calcStats(runs.map(r => r.backendTime));
    const userStats = calcStats(runs.map(r => r.userPerceivedTime));

    return {
      langName,
      backendStats,
      userStats,
      runs
    };
  };

  const pyResults = await runLang('Python', pythonCode, 'python');
  const cppResults = await runLang('C++', cppCode, 'cpp');
  const javaResults = await runLang('Java', javaCode, 'java');

  console.log(`\n================================================================`);
  console.log(`   ${label.toUpperCase()} SUMMARY RESULTS (AVERAGE OF 5 RUNS)   `);
  console.log(`================================================================`);
  console.log(`Python: Backend = ${pyResults.backendStats.avg.toFixed(1)} ms | Perceived = ${pyResults.userStats.avg.toFixed(1)} ms (Median: ${pyResults.userStats.med.toFixed(1)} ms)`);
  console.log(`C++:    Backend = ${cppResults.backendStats.avg.toFixed(1)} ms | Perceived = ${cppResults.userStats.avg.toFixed(1)} ms (Median: ${cppResults.userStats.med.toFixed(1)} ms)`);
  console.log(`Java:   Backend = ${javaResults.backendStats.avg.toFixed(1)} ms | Perceived = ${javaResults.userStats.avg.toFixed(1)} ms (Median: ${javaResults.userStats.med.toFixed(1)} ms)`);
  console.log(`================================================================\n`);

  return { pyResults, cppResults, javaResults };
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith('benchmark_pipeline_baseline.js')) {
  runFullBenchmark('Pre-Optimization Baseline').catch(console.error);
}
