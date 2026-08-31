import crypto from 'crypto';

export class QueueCapacityError extends Error {
  constructor(message = 'Execution queue is full. Please try again shortly.') {
    super(message);
    this.name = 'QueueCapacityError';
    this.statusCode = 429;
    this.code = 'QUEUE_FULL';
  }
}

class CompilerQueue {
  constructor() {
    this.queue = [];
    this.jobs = new Map();
    this.activeJobsCount = 0;
    
    // Explicit queue configuration
    this.MAX_RUNNING = Number(process.env.MAX_EXECUTION_WORKERS) || Number(process.env.MAX_RUNNING) || 1;
    this.MAX_QUEUE_SIZE = Number(process.env.MAX_QUEUE_SIZE) || 30; // Maximum WAITING jobs
    this.QUEUE_WAIT_TIMEOUT_MS = Number(process.env.QUEUE_WAIT_TIMEOUT_MS) || 45000; // 45s

    // Evict old jobs from jobs Map after 10 minutes to prevent memory leak
    setInterval(() => {
      const now = Date.now();
      for (const [jobId, job] of this.jobs.entries()) {
        if (job.finishedAt && now - job.finishedAt > 600000) {
          this.jobs.delete(jobId);
        }
      }
    }, 60000); // runs every 60 seconds
  }

  enqueue(runFn) {
    // Check queue capacity (maximum waiting jobs)
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      throw new QueueCapacityError(`Execution queue is full (${this.queue.length} jobs waiting). Please try again shortly.`);
    }

    const jobId = crypto.randomUUID();
    const job = {
      jobId,
      status: 'queued',
      result: null,
      error: null,
      queuedAt: Date.now(),
      startedAt: null,
      finishedAt: null,
      runFn
    };

    this.jobs.set(jobId, job);
    this.queue.push(job);
    
    // Process queue asynchronously
    process.nextTick(() => this.processQueue());

    return this.getJobStatus(jobId);
  }

  getJobStatus(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) {
      return null;
    }

    if (job.status === 'queued') {
      const position = this.queue.findIndex(j => j.jobId === jobId) + 1;
      const estimatedWait = Math.max(1, position * 2); // estimated 2s per position
      return {
        jobId,
        status: 'queued',
        position,
        estimatedWait
      };
    }

    if (job.status === 'running') {
      return {
        jobId,
        status: 'running',
        position: 0,
        estimatedWait: 2
      };
    }

    return {
      jobId,
      status: job.status,
      result: job.result,
      error: job.error
    };
  }

  async processQueue() {
    if (this.activeJobsCount >= this.MAX_RUNNING) {
      return;
    }

    if (this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    this.activeJobsCount++;
    job.status = 'running';
    job.startedAt = Date.now();

    // Check if job timed out while waiting in queue
    if (Date.now() - job.queuedAt > this.QUEUE_WAIT_TIMEOUT_MS) {
      job.status = 'failed';
      job.error = 'Queue wait timeout exceeded. The compiler server is under heavy load, please retry.';
      job.finishedAt = Date.now();
      this.activeJobsCount--;
      process.nextTick(() => this.processQueue());
      return;
    }

    try {
      const result = await job.runFn();
      job.status = 'completed';
      job.result = result;
    } catch (err) {
      job.status = 'failed';
      job.error = err.message || 'Job execution failed';
    } finally {
      job.finishedAt = Date.now();
      this.activeJobsCount--;
      // Process next job in the next tick
      process.nextTick(() => this.processQueue());
    }
  }

  // Returns live snapshot of queue for server load indicator
  getQueueLoad() {
    return {
      waiting: this.queue.length,
      running: this.activeJobsCount,
      total: this.queue.length + this.activeJobsCount,
      maxWorkers: this.MAX_RUNNING,
      maxQueueSize: this.MAX_QUEUE_SIZE
    };
  }
}

export const compilerQueue = new CompilerQueue();
