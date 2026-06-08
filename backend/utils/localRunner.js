import { spawn, execSync, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_DIR = path.join(__dirname, '..', 'temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Check if a compiler/executable is available on the system
const isCommandAvailable = (cmd) => {
  // If the command contains path separators, check if it exists directly on disk
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
 * Runs a command with a child process, feeds stdin, handles timeouts
 */
const runProcess = (cmd, args, input, timeoutSec, options = {}) => {
  return new Promise((resolve) => {
    const processInstance = spawn(cmd, args, { cwd: options.cwd || TEMP_DIR });
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      try {
        processInstance.kill();
      } catch (e) {}
      resolve({
        status: 'Time Limit Exceeded',
        stdout: '',
        error: `Time limit of ${timeoutSec}s exceeded.`
      });
    }, timeoutSec * 1000);

    if (input) {
      processInstance.stdin.write(input);
      processInstance.stdin.end();
    } else {
      processInstance.stdin.end();
    }

    processInstance.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    processInstance.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    processInstance.on('close', (code) => {
      clearTimeout(timeout);
      if (timedOut) return;

      if (code === 0) {
        resolve({
          status: 'Success',
          stdout,
          error: stderr
        });
      } else {
        resolve({
          status: 'Runtime Error',
          stdout,
          error: stderr || `Process exited with code ${code}`
        });
      }
    });

    processInstance.on('error', (err) => {
      clearTimeout(timeout);
      if (timedOut) return;
      resolve({
        status: 'Runtime Error',
        stdout: '',
        error: err.message
      });
    });
  });
};

/**
 * Main execution runner for multiple test cases (Compile Once, Run Many)
 */
export const runLocalCodeMulti = async (code, language, inputs, timeLimit = 2) => {
  const jobId = Math.random().toString(36).substring(7);
  
  console.log(`\n--- [NQTCoder Compiler] Job ${jobId} initialized for language: ${language} ---`);
  console.time(`[Job ${jobId}] Total Time`);

  const inputsArray = Array.isArray(inputs) ? inputs : [inputs];
  const results = [];

  if (language === 'python') {
    const filename = `script_${jobId}.py`;
    const filepath = path.join(TEMP_DIR, filename);
    fs.writeFileSync(filepath, code);

    // Determine python command
    let pyCmd = 'python';
    if (!isCommandAvailable('python') && isCommandAvailable('python3')) {
      pyCmd = 'python3';
    }

    if (!isCommandAvailable(pyCmd)) {
      try { fs.unlinkSync(filepath); } catch (e) {}
      console.timeEnd(`[Job ${jobId}] Total Time`);
      return {
        status: 'Compilation Error',
        error: '[System Error] Python was not detected on this machine.\n\nTo run Python code, please download and install Python 3.x and ensure it is added to your system Environment Variables.'
      };
    }

    console.time(`[Job ${jobId}] Run ${inputsArray.length} test cases`);
    for (const input of inputsArray) {
      const runRes = await runProcess(pyCmd, [filename], input, timeLimit);
      results.push({
        status: runRes.status === 'Success' ? 'Accepted' : runRes.status,
        stdout: runRes.stdout,
        error: runRes.error
      });
    }
    console.timeEnd(`[Job ${jobId}] Run ${inputsArray.length} test cases`);

    // Clean up
    try {
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    } catch (e) {}

  } else if (language === 'cpp') {
    const filename = `code_${jobId}.cpp`;
    const filepath = path.join(TEMP_DIR, filename);
    const binaryName = `prog_${jobId}${process.platform === 'win32' ? '.exe' : '.out'}`;
    const binaryPath = path.join(TEMP_DIR, binaryName);

    fs.writeFileSync(filepath, code);

    if (!isCommandAvailable('g++')) {
      try { fs.unlinkSync(filepath); } catch (e) {}
      console.timeEnd(`[Job ${jobId}] Total Time`);
      return {
        status: 'Compilation Error',
        error: '[System Error] GCC C++ Compiler (g++) was not detected on this machine.\n\nTo run C++ code, please download and install MinGW (GCC) and ensure its "bin" path is added to your system Environment Variables.'
      };
    }

    // Compile once - using -O1 optimization for faster compile times on Render
    console.time(`[Job ${jobId}] C++ Compilation`);
    try {
      execSync(`g++ -O1 "${filepath}" -o "${binaryPath}"`, { stdio: 'pipe' });
      console.timeEnd(`[Job ${jobId}] C++ Compilation`);
    } catch (err) {
      console.timeEnd(`[Job ${jobId}] C++ Compilation`);
      const errorMsg = err.stderr ? err.stderr.toString() : err.message;
      try {
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      } catch (e) {}
      console.timeEnd(`[Job ${jobId}] Total Time`);
      return {
        status: 'Compilation Error',
        error: errorMsg
      };
    }

    // Run test cases
    console.time(`[Job ${jobId}] Run ${inputsArray.length} test cases`);
    for (const input of inputsArray) {
      const runRes = await runProcess(binaryPath, [], input, timeLimit);
      results.push({
        status: runRes.status === 'Success' ? 'Accepted' : runRes.status,
        stdout: runRes.stdout,
        error: runRes.error
      });
    }
    console.timeEnd(`[Job ${jobId}] Run ${inputsArray.length} test cases`);

    // Clean up
    try {
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      if (fs.existsSync(binaryPath)) fs.unlinkSync(binaryPath);
    } catch (e) {}

  } else if (language === 'java') {
    const jobDir = path.join(TEMP_DIR, `java_${jobId}`);
    fs.mkdirSync(jobDir, { recursive: true });

    const filename = 'Main.java';
    const filepath = path.join(jobDir, filename);
    fs.writeFileSync(filepath, code);

    // Dynamic paths for Java 8 bin override from .env
    const javaBin = process.env.JAVA_8_BIN ? process.env.JAVA_8_BIN : '';
    const javacCmd = javaBin ? path.join(javaBin, 'javac') : 'javac';
    const javaCmd = javaBin ? path.join(javaBin, 'java') : 'java';

    // Verify if java is available
    if (!isCommandAvailable(javacCmd) || !isCommandAvailable(javaCmd)) {
      try { fs.rmSync(jobDir, { recursive: true, force: true }); } catch (e) {}
      console.timeEnd(`[Job ${jobId}] Total Time`);
      return {
        status: 'Compilation Error',
        error: '[System Error] Java Compiler (javac/java) was not detected on this machine.\n\nTo run Java 8 code, please download and install JDK 8 (Java Development Kit) and ensure its "bin" path is added to your system Environment Variables.'
      };
    }

    // Compile targeting Java 8 using --release 8 parameter if supported
    console.time(`[Job ${jobId}] Java Compilation`);
    let compiled = false;
    let compileError = '';

    try {
      // We wrap compiler paths in quotes to support Windows paths with spaces
      execSync(`"${javacCmd}" --release 8 "${filepath}"`, { stdio: 'pipe' });
      compiled = true;
    } catch (err) {
      // Fallback compilation without --release flag if using a pure Java 8 JDK (which doesn't support --release)
      try {
        execSync(`"${javacCmd}" "${filepath}"`, { stdio: 'pipe' });
        compiled = true;
      } catch (innerErr) {
        compileError = innerErr.stderr ? innerErr.stderr.toString() : innerErr.message;
      }
    }
    console.timeEnd(`[Job ${jobId}] Java Compilation`);

    if (!compiled) {
      try {
        fs.rmSync(jobDir, { recursive: true, force: true });
      } catch (e) {}
      console.timeEnd(`[Job ${jobId}] Total Time`);
      return {
        status: 'Compilation Error',
        error: compileError
      };
    }

    // Run test cases
    console.time(`[Job ${jobId}] Run ${inputsArray.length} test cases`);
    for (const input of inputsArray) {
      const runRes = await runProcess(javaCmd, ['Main'], input, timeLimit, { cwd: jobDir });
      results.push({
        status: runRes.status === 'Success' ? 'Accepted' : runRes.status,
        stdout: runRes.stdout,
        error: runRes.error
      });
    }
    console.timeEnd(`[Job ${jobId}] Run ${inputsArray.length} test cases`);

    // Clean up directory
    try {
      fs.rmSync(jobDir, { recursive: true, force: true });
    } catch (e) {}
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
    const javaBin = process.env.JAVA_8_BIN ? process.env.JAVA_8_BIN : '';
    const javacCmd = javaBin ? path.join(javaBin, 'javac') : 'javac';
    const javaCmd = javaBin ? path.join(javaBin, 'java') : 'java';

    if (isCommandAvailable(javacCmd) && isCommandAvailable(javaCmd)) {
      const { stdout, stderr } = await execPromise(`"${javacCmd}" -version`);
      versions.java.available = true;
      const verOutput = (stdout || stderr || '').trim();
      // Match the version number (e.g., javac 1.8.0_202)
      const match = verOutput.match(/javac\s+([0-9\.\_\-]+)/i);
      versions.java.version = match ? `Java ${match[1]}` : verOutput || 'Java 8';
    }
  } catch (e) {
    versions.java.version = '';
  }

  return versions;
};
