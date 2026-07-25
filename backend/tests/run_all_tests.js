import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

async function runAll() {
  console.log(`${BOLD}====================================================${RESET}`);
  console.log(`${BOLD}          Running All NQTCoder Unit & Integration Tests ${RESET}`);
  console.log(`${BOLD}====================================================${RESET}\n`);

  const files = fs.readdirSync(__dirname);
  const testFiles = files.filter(f => f.startsWith('test_') && f.endsWith('.js') && f !== 'run_all_tests.js');

  const results = [];
  let passed = 0;
  let failed = 0;

  // Let's run a local dev server in the background for E2E integration tests to succeed!
  // E2E tests (like test_all_features.js, test_public_access.js) need the server running on port 5000.
  // So we start it in background, then kill it when done.
  console.log(`${YELLOW}Starting temporary local server on port 5000...${RESET}`);
  let serverProcess;
  let serverExited = false;
  let serverClosePromise;
  try {
    const { spawn } = await import('child_process');
    serverProcess = spawn('node', ['server.js'], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PORT: '5000' },
      stdio: ['ignore', 'inherit', 'inherit']
    });

    serverClosePromise = new Promise(resolve => serverProcess.once('close', resolve));
    serverProcess.once('exit', (code, signal) => {
      serverExited = true;
      console.warn(`${YELLOW}Temporary server exited early (code: ${code}, signal: ${signal}).${RESET}`);
    });
    
    // Give it 3 seconds to spin up
    await new Promise(resolve => setTimeout(resolve, 3000));
    if (serverExited) {
      throw new Error('Temporary server failed to stay running. Check database/env configuration above.');
    }
    console.log(`${GREEN}Server started!${RESET}\n`);
  } catch (err) {
    console.warn('Could not start server in background, some integration tests might fail.', err.message);
  }

  for (const file of testFiles) {
    // Skip email/LLM API connection check scripts since they require third-party credentials
    if (['test_brevo.js', 'test_gmail_api.js', 'test_nodemailer.js', 'test_llm.js', 'test_ai_byok.js'].includes(file)) {
      console.log(`${YELLOW}⚡ Skipping third-party API test: ${file}${RESET}`);
      results.push({ file, status: 'SKIPPED' });
      continue;
    }

    console.log(`${YELLOW}🏃 Running ${file}...${RESET}`);
    try {
      execSync(`node --experimental-vm-modules tests/${file}`, {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
      });
      console.log(`${GREEN}✓ PASSED: ${file}${RESET}\n`);
      results.push({ file, status: 'PASSED' });
      passed++;
    } catch (err) {
      console.log(`${RED}✗ FAILED: ${file}${RESET}\n`);
      results.push({ file, status: 'FAILED' });
      failed++;
    }
  }

  if (serverProcess) {
    console.log(`${YELLOW}Shutting down temporary local server...${RESET}`);
    if (!serverExited) {
      serverProcess.kill();
    }
    await serverClosePromise;
  }

  console.log(`\n${BOLD}=================== MASTER SUMMARY ===================${RESET}`);
  console.log(`Total tests found: ${testFiles.length}`);
  console.log(`Passed:            ${GREEN}${passed}${RESET}`);
  console.log(`Failed:            ${failed > 0 ? RED + failed : GREEN + failed}${RESET}`);
  
  console.log(`\nDetail breakdown:`);
  results.forEach(r => {
    const color = r.status === 'PASSED' ? GREEN : r.status === 'FAILED' ? RED : YELLOW;
    console.log(`  ${color}[${r.status}]${RESET} ${r.file}`);
  });
  console.log(`${BOLD}======================================================${RESET}\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAll().catch(error => {
  console.error(error);
  process.exit(1);
});
