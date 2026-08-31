import { spawn, execFile, execSync, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_DIR = path.join(__dirname, '..', 'temp');

const MAX_OUTPUT_BYTES = Number(process.env.MAX_OUTPUT_BYTES) || 65536; // 64 KB
const JAVA_MAX_HEAP = process.env.JAVA_MAX_HEAP || '128m';
const JAVA_INITIAL_HEAP = process.env.JAVA_INITIAL_HEAP || '16m';

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Prunes stale orphaned temporary execution directories older than maxAgeMs.
 */
export const pruneTempDirectory = (maxAgeMs = 10 * 60 * 1000) => {
  try {
    if (!fs.existsSync(TEMP_DIR)) return;
    const now = Date.now();
    const entries = fs.readdirSync(TEMP_DIR);
    for (const entry of entries) {
      const entryPath = path.join(TEMP_DIR, entry);
      try {
        const stats = fs.statSync(entryPath);
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.rmSync(entryPath, { recursive: true, force: true });
        }
      } catch (e) {}
    }
  } catch (e) {}
};

// Initial startup prune & 5-minute periodic prune
pruneTempDirectory();
setInterval(() => pruneTempDirectory(), 5 * 60 * 1000);

// Check if a compiler/executable is available on the system
const isCommandAvailable = (cmd) => {
  if (cmd.includes('/') || cmd.includes('\\')) {
    try {
      if (fs.existsSync(cmd)) return true;
      if (process.platform === 'win32') {
        if (fs.existsSync(cmd + '.exe')) return true;
        if (fs.existsSync(cmd + '.bat')) return true;
        if (fs.existsSync(cmd + '.cmd')) return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  try {
    const checkCmd = process.platform === 'win32' ? `where "${cmd}"` : `which "${cmd}"`;
    execSync(checkCmd, { stdio: 'ignore' });
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Terminates process and process group cleanly
 */
const killProcessTree = (proc) => {
  if (!proc || !proc.pid) return;
  try {
    if (process.platform === 'win32') {
      proc.kill();
    } else {
      try {
        process.kill(-proc.pid, 'SIGKILL');
      } catch (e) {
        proc.kill('SIGKILL');
      }
    }
  } catch (e) {}
};

/**
 * Executes a compiler command with explicit argument array and no shell interpolation
 */
const execCompilerAsync = (cmd, args, options = {}) => {
  return new Promise((resolve) => {
    execFile(cmd, args, { cwd: options.cwd || TEMP_DIR, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        resolve({
          success: false,
          stdout: stdout || '',
          stderr: (stderr || err.message || '').toString()
        });
      } else {
        resolve({
          success: true,
          stdout: stdout || '',
          stderr: stderr || ''
        });
      }
    });
  });
};

/**
 * Runs a command with a child process, feeds stdin, handles timeouts, and enforces streaming output limits
 */
const runProcess = (cmd, args, input, timeoutSec, options = {}) => {
  return new Promise((resolve) => {
    let processInstance;
    try {
      processInstance = spawn(cmd, args, {
        cwd: options.cwd || TEMP_DIR,
        detached: process.platform !== 'win32'
      });
    } catch (err) {
      return resolve({
        status: 'Runtime Error',
        stdout: '',
        error: err.message
      });
    }

    let stdout = '';
    let stderr = '';
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let timedOut = false;
    let outputLimitExceeded = false;
    let resolved = false;

    const safeResolve = (val) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      resolve(val);
    };

    const timeout = setTimeout(() => {
      timedOut = true;
      killProcessTree(processInstance);
      safeResolve({
        status: 'Time Limit Exceeded',
        stdout: stdout.substring(0, MAX_OUTPUT_BYTES),
        error: `Time limit of ${timeoutSec}s exceeded.`
      });
    }, timeoutSec * 1000);

    if (input) {
      try {
        processInstance.stdin.write(input);
        processInstance.stdin.end();
      } catch (e) {}
    } else {
      try {
        processInstance.stdin.end();
      } catch (e) {}
    }

    processInstance.stdout.on('data', (data) => {
      if (outputLimitExceeded || timedOut) return;
      stdoutBytes += data.length;
      if (stdoutBytes > MAX_OUTPUT_BYTES) {
        outputLimitExceeded = true;
        killProcessTree(processInstance);
        safeResolve({
          status: 'Output Limit Exceeded',
          stdout: stdout.substring(0, MAX_OUTPUT_BYTES),
          error: `Output limit of ${Math.round(MAX_OUTPUT_BYTES / 1024)}KB exceeded.`
        });
        return;
      }
      stdout += data.toString();
    });

    processInstance.stderr.on('data', (data) => {
      if (outputLimitExceeded || timedOut) return;
      stderrBytes += data.length;
      if (stderrBytes > MAX_OUTPUT_BYTES) {
        outputLimitExceeded = true;
        killProcessTree(processInstance);
        safeResolve({
          status: 'Output Limit Exceeded',
          stdout: stdout.substring(0, MAX_OUTPUT_BYTES),
          error: `Output limit of ${Math.round(MAX_OUTPUT_BYTES / 1024)}KB exceeded in stderr.`
        });
        return;
      }
      stderr += data.toString();
    });

    processInstance.on('close', (code) => {
      if (timedOut || outputLimitExceeded) return;
      if (code === 0) {
        safeResolve({
          status: 'Success',
          stdout,
          error: stderr
        });
      } else {
        safeResolve({
          status: 'Runtime Error',
          stdout,
          error: stderr || `Process exited with code ${code}`
        });
      }
    });

    processInstance.on('error', (err) => {
      if (timedOut || outputLimitExceeded) return;
      safeResolve({
        status: 'Runtime Error',
        stdout: '',
        error: err.message
      });
    });
  });
};

/**
 * Main execution runner for multiple test cases (Compile Once, Run Many)
 * Uses isolated ephemeral directory per job with guaranteed finally cleanup.
 */
export const runLocalCodeMulti = async (code, language, inputs, timeLimit = 2) => {
  const jobId = Math.random().toString(36).substring(7);
  const jobDir = path.join(TEMP_DIR, `job_${jobId}`);
  fs.mkdirSync(jobDir, { recursive: true });

  console.log(`\n--- [NQTCoder Compiler] Job ${jobId} initialized for language: ${language} ---`);
  console.time(`[Job ${jobId}] Total Time`);

  const inputsArray = Array.isArray(inputs) ? inputs : [inputs];
  const results = [];

  try {
    if (language === 'python') {
      const filename = `script_${jobId}.py`;
      const filepath = path.join(jobDir, filename);
      fs.writeFileSync(filepath, code);

      let pyCmd = 'python';
      if (!isCommandAvailable('python') && isCommandAvailable('python3')) {
        pyCmd = 'python3';
      }

      if (!isCommandAvailable(pyCmd)) {
        console.timeEnd(`[Job ${jobId}] Total Time`);
        return {
          status: 'Compilation Error',
          error: '[System Error] Python was not detected on this machine.\n\nTo run Python code, please install Python 3.x and add it to system PATH.'
        };
      }

      console.time(`[Job ${jobId}] Run ${inputsArray.length} test cases`);
      for (const input of inputsArray) {
        const runRes = await runProcess(pyCmd, [filename], input, timeLimit, { cwd: jobDir });
        results.push({
          status: runRes.status === 'Success' ? 'Accepted' : runRes.status,
          stdout: runRes.stdout,
          error: runRes.error
        });
      }
      console.timeEnd(`[Job ${jobId}] Run ${inputsArray.length} test cases`);

    } else if (language === 'cpp') {
      const filename = `code_${jobId}.cpp`;
      const filepath = path.join(jobDir, filename);
      const binaryName = `prog_${jobId}${process.platform === 'win32' ? '.exe' : '.out'}`;
      const binaryPath = path.join(jobDir, binaryName);

      fs.writeFileSync(filepath, code);

      if (!isCommandAvailable('g++')) {
        console.timeEnd(`[Job ${jobId}] Total Time`);
        return {
          status: 'Compilation Error',
          error: '[System Error] GCC C++ Compiler (g++) was not detected on this machine.\n\nTo run C++ code, please install MinGW/GCC and add it to system PATH.'
        };
      }

      // Compile once with explicit argument array
      console.time(`[Job ${jobId}] C++ Compilation`);
      const compRes = await execCompilerAsync('g++', ['-O1', filename, '-o', binaryName], { cwd: jobDir });
      console.timeEnd(`[Job ${jobId}] C++ Compilation`);

      if (!compRes.success) {
        console.timeEnd(`[Job ${jobId}] Total Time`);
        return {
          status: 'Compilation Error',
          error: compRes.stderr || 'C++ Compilation failed'
        };
      }

      // Run test cases
      console.time(`[Job ${jobId}] Run ${inputsArray.length} test cases`);
      for (const input of inputsArray) {
        const runRes = await runProcess(binaryPath, [], input, timeLimit, { cwd: jobDir });
        results.push({
          status: runRes.status === 'Success' ? 'Accepted' : runRes.status,
          stdout: runRes.stdout,
          error: runRes.error
        });
      }
      console.timeEnd(`[Job ${jobId}] Run ${inputsArray.length} test cases`);

    } else if (language === 'java') {
      const filename = 'Main.java';
      const filepath = path.join(jobDir, filename);
      fs.writeFileSync(filepath, code);

      const javaBin = process.env.JAVA_11_BIN || process.env.JAVA_8_BIN || '';
      const javacCmd = javaBin ? path.join(javaBin, 'javac') : 'javac';
      const javaCmd = javaBin ? path.join(javaBin, 'java') : 'java';

      if (!isCommandAvailable(javacCmd) || !isCommandAvailable(javaCmd)) {
        console.timeEnd(`[Job ${jobId}] Total Time`);
        return {
          status: 'Compilation Error',
          error: '[System Error] Java Compiler (javac/java) was not detected on this machine.\n\nTo run Java code, please install JDK 11+ and add it to system PATH.'
        };
      }

      // Compile with explicit argument array
      console.time(`[Job ${jobId}] Java Compilation`);
      let compRes = await execCompilerAsync(javacCmd, ['--release', '11', filename], { cwd: jobDir });
      if (!compRes.success) {
        // Fallback without --release
        compRes = await execCompilerAsync(javacCmd, [filename], { cwd: jobDir });
      }
      console.timeEnd(`[Job ${jobId}] Java Compilation`);

      if (!compRes.success) {
        console.timeEnd(`[Job ${jobId}] Total Time`);
        return {
          status: 'Compilation Error',
          error: compRes.stderr || 'Java Compilation failed'
        };
      }

      // Java execution arguments with configurable heap limits and C1 client compiler acceleration
      const javaArgs = [
        `-Xms${JAVA_INITIAL_HEAP}`,
        `-Xmx${JAVA_MAX_HEAP}`,
        '-XX:+TieredCompilation',
        '-XX:TieredStopAtLevel=1',
        'Main'
      ];

      // Run test cases
      console.time(`[Job ${jobId}] Run ${inputsArray.length} test cases`);
      for (const input of inputsArray) {
        const runRes = await runProcess(javaCmd, javaArgs, input, timeLimit, { cwd: jobDir });
        results.push({
          status: runRes.status === 'Success' ? 'Accepted' : runRes.status,
          stdout: runRes.stdout,
          error: runRes.error
        });
      }
      console.timeEnd(`[Job ${jobId}] Run ${inputsArray.length} test cases`);

    } else {
      console.timeEnd(`[Job ${jobId}] Total Time`);
      return {
        status: 'Compilation Error',
        error: `Unsupported language: ${language}`
      };
    }

    console.timeEnd(`[Job ${jobId}] Total Time`);
    return {
      status: 'Success',
      results
    };
  } finally {
    // Guaranteed cleanup of the entire ephemeral job directory
    try {
      fs.rmSync(jobDir, { recursive: true, force: true });
    } catch (e) {}
  }
};

/**
 * Backwards compatible single execution code runner
 */
export const runLocalCode = async (code, language, input, timeLimit = 2) => {
  const multiRes = await runLocalCodeMulti(code, language, [input], timeLimit);
  if (multiRes.status === 'Compilation Error') {
    return {
      status: 'Compilation Error',
      stdout: '',
      error: multiRes.error
    };
  }
  return multiRes.results[0];
};

/**
 * Simulated/Mock Runner if compilers are unavailable
 */
const runMockCode = (code, language, input) => {
  console.log(`[Local Runner] Compilers not installed. Running Mock Engine for ${language}...`);
  
  // A simple heuristic-based solver for mock debugging:
  // If the user inputs numbers, and code contains adding/sorting, we can try to guess or outputs mock values.
  // Generally, we output a standard stdout or simulate output matching simple questions.
  // To be robust, let's run the code if it's Python by doing a quick eval-based mock, 
  // or return the input as output, or if input is empty, return a default mock message.
  
  let stdout = '';
  // Try to inspect code for basic patterns to simulate actual responses for common problems:
  const codeLower = code.toLowerCase();
  
  if (codeLower.includes('sort')) {
    // Sort numbers in input
    const numbers = input.match(/-?\d+/g);
    if (numbers) {
      stdout = numbers.map(Number).sort((a,b)=>a-b).join(' ') + '\n';
    } else {
      stdout = input;
    }
  } else if (codeLower.includes('sum') || codeLower.includes('+')) {
    // Sum numbers in input
    const numbers = input.match(/-?\d+/g);
    if (numbers) {
      stdout = numbers.map(Number).reduce((a,b)=>a+b, 0).toString() + '\n';
    } else {
      stdout = input;
    }
  } else if (codeLower.includes('reverse') || codeLower.includes('palindrome')) {
    // Reverse lines/words
    stdout = input.split('').reverse().join('') + '\n';
  } else {
    // Echo input back as output
    stdout = input || "Demo Execution (Host is missing compilers. Install python/g++/java for full sandboxing).";
  }

  return {
    status: 'Accepted',
    stdout: stdout,
    error: '[System Notice] Running in Local Fallback Engine. System-level compilers (g++, javac) were not detected on this machine.'
  };
};

const execPromise = promisify(exec);

export const getCompilerVersions = async () => {
  const versions = {
    java: { available: false, version: '' },
    python: { available: false, version: '' },
    cpp: { available: false, version: '' }
  };

  // 1. Check Python
  try {
    let pyCmd = 'python';
    if (!isCommandAvailable('python') && isCommandAvailable('python3')) {
      pyCmd = 'python3';
    }
    if (isCommandAvailable(pyCmd)) {
      const { stdout, stderr } = await execPromise(`"${pyCmd}" --version`);
      versions.python.available = true;
      versions.python.version = (stdout || stderr || 'Python').trim().replace(/Python\s+/i, '');
    }
  } catch (e) {
    versions.python.version = '';
  }

  // 2. Check C++ (g++)
  try {
    if (isCommandAvailable('g++')) {
      const { stdout } = await execPromise('g++ --version');
      versions.cpp.available = true;
      // Extract g++ version name/number (e.g. g++ (GCC) 9.2.0 or similar)
      const firstLine = stdout.split('\n')[0].trim();
      const match = firstLine.match(/(?:g\+\+\s+|gcc\s+|g\+\+-\d+\s+|gcc-\d+\s+)?\(?[a-zA-Z\s\-]+\)?\s*([0-9\.\-]+)/i);
      versions.cpp.version = match ? `g++ ${match[1]}` : firstLine;
    }
  } catch (e) {
    versions.cpp.version = '';
  }

  // 3. Check Java (javac)
  try {
    const javaBin = process.env.JAVA_11_BIN || process.env.JAVA_8_BIN || '';
    const javacCmd = javaBin ? path.join(javaBin, 'javac') : 'javac';
    const javaCmd = javaBin ? path.join(javaBin, 'java') : 'java';

    if (isCommandAvailable(javacCmd) && isCommandAvailable(javaCmd)) {
      const { stdout, stderr } = await execPromise(`"${javacCmd}" -version`);
      versions.java.available = true;
      const verOutput = (stdout || stderr || '').trim();
      // Match the version number (e.g., javac 1.8.0_202)
      const match = verOutput.match(/javac\s+([0-9\.\_\-]+)/i);
      versions.java.version = match ? `Java ${match[1]}` : verOutput || 'Java 11';
    }
  } catch (e) {
    versions.java.version = '';
  }

  return versions;
};
