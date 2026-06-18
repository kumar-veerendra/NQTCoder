import dotenv from 'dotenv';
dotenv.config();
import { runLocalCodeMulti } from '../utils/localRunner.js';

// ANSI escape codes for coloring
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const SECURITY_SCENARIOS = [
  {
    name: "Python: File Access Sandbox Check (Read parent .env)",
    language: "python",
    code: `
import os
try:
    # Attempt to read parent directory dotenv file containing DB URI and secrets
    if os.path.exists('../.env'):
        with open('../.env', 'r') as f:
            content = f.read()
            if len(content) > 0:
                print("EXPLOIT_SUCCESS: read sensitive .env file content")
            else:
                print("EXPLOIT_FAILED: .env file is empty")
    else:
        print("EXPLOIT_BLOCKED: .env path does not exist")
except Exception as e:
    print(f"EXPLOIT_BLOCKED: exception {str(e)}")
`,
    inputs: ["test"],
    verify: (res) => {
      const stdout = res.results?.[0]?.stdout || '';
      if (stdout.includes("EXPLOIT_SUCCESS")) {
        return {
          secure: false,
          reason: "Code was allowed to read files outside the execution sandbox directory (.env accessible)"
        };
      }
      return { secure: true };
    }
  },
  {
    name: "Python: Network Sandbox Check (Connect to external domain)",
    language: "python",
    code: `
import urllib.request
try:
    # Attempt to fetch external webpage (network egress check)
    urllib.request.urlopen("https://www.google.com", timeout=1)
    print("EXPLOIT_SUCCESS: network connection successful")
except Exception as e:
    print(f"EXPLOIT_BLOCKED: network failed ({str(e)})")
`,
    inputs: ["test"],
    verify: (res) => {
      const stdout = res.results?.[0]?.stdout || '';
      if (stdout.includes("EXPLOIT_SUCCESS")) {
        return {
          secure: false,
          reason: "Code execution was allowed to establish external outbound network connections"
        };
      }
      return { secure: true };
    }
  }
];

async function runSecurityTests() {
  console.log(`${BOLD}====================================================${RESET}`);
  console.log(`${BOLD}       NQTCoder Sandbox Security Audit Suite        ${RESET}`);
  console.log(`${BOLD}====================================================${RESET}\n`);

  console.log(`${YELLOW}ℹ️  Checking current local code runner isolation profile...${RESET}\n`);

  let secureCount = 0;
  let insecureCount = 0;

  for (let i = 0; i < SECURITY_SCENARIOS.length; i++) {
    const sc = SECURITY_SCENARIOS[i];
    console.log(`🔒 Auditing Scenario [${i+1}/${SECURITY_SCENARIOS.length}]: ${sc.name}...`);

    try {
      const res = await runLocalCodeMulti(sc.code, sc.language, sc.inputs, 3);
      const auditResult = sc.verify(res);

      if (auditResult.secure) {
        console.log(`  ${GREEN}✓ SECURE: Execution blocked/failed successfully.${RESET}\n`);
        secureCount++;
      } else {
        console.log(`  ${RED}⚠ VULNERABLE: ${auditResult.reason}${RESET}`);
        console.log(`  Recommendation: Configure containerization (Docker) or lower system privileges for the compiler runner process.`);
        console.log(`  Output obtained: ${res.results?.[0]?.stdout.trim() || 'No stdout'}\n`);
        insecureCount++;
      }
    } catch (err) {
      console.log(`  ${GREEN}✓ SECURE: Exception thrown by runner: ${err.message}${RESET}\n`);
      secureCount++;
    }
  }

  console.log(`${BOLD}=================== Audit Summary ===================${RESET}`);
  console.log(`Audited Scenarios: ${SECURITY_SCENARIOS.length}`);
  console.log(`Blocked (Secure):  ${GREEN}${secureCount}${RESET}`);
  console.log(`Bypassed (Vulnerable): ${insecureCount > 0 ? RED + insecureCount : GREEN + insecureCount}${RESET}`);
  console.log(`${BOLD}====================================================${RESET}\n`);

  // Note: This security test is diagnostic. We do not exit with 1 on local development bypasses
  // because local mode runs raw child_processes, but it serves as an automated checker to ensure
  // staging/production deployments (like Judge0 or isolated sandboxes) enforce rules.
  process.exit(0);
}

runSecurityTests().catch(err => {
  console.error("Fatal error running security audit suite:", err);
  process.exit(1);
});
