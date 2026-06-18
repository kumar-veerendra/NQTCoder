import dotenv from 'dotenv';
dotenv.config();

import { runLocalCodeMulti, getCompilerVersions } from '../utils/localRunner.js';

// ANSI escape codes for coloring
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const SCENARIOS = [
  // =================== PYTHON SCENARIOS ===================
  {
    name: "Python: Successful batch execution (2 test cases)",
    language: "python",
    code: `import sys\nprint(f"Echo: {sys.stdin.read().strip()}")`,
    inputs: ["apple", "banana"],
    verify: (res) => {
      if (res.status !== 'Success') return `Expected 'Success', got '${res.status}'`;
      if (!res.results || res.results.length !== 2) return `Expected 2 results, got ${res.results?.length}`;
      if (res.results[0].status !== 'Accepted') return `Result 0 status: expected 'Accepted', got '${res.results[0].status}'`;
      if (!res.results[0].stdout.trim().includes('Echo: apple')) return `Result 0 stdout mismatch: '${res.results[0].stdout}'`;
      if (res.results[1].status !== 'Accepted') return `Result 1 status: expected 'Accepted', got '${res.results[1].status}'`;
      if (!res.results[1].stdout.trim().includes('Echo: banana')) return `Result 1 stdout mismatch: '${res.results[1].stdout}'`;
      return null;
    }
  },
  {
    name: "Python: Runtime Error (Division by Zero)",
    language: "python",
    code: `x = 1 / 0`,
    inputs: ["test"],
    verify: (res) => {
      if (res.status !== 'Success') return `Expected overall status 'Success', got '${res.status}'`;
      if (res.results[0].status !== 'Runtime Error') return `Expected test status 'Runtime Error', got '${res.results[0].status}'`;
      if (!res.results[0].error.toLowerCase().includes('zerodivisionerror')) return `Expected error message to mention ZeroDivisionError, got: '${res.results[0].error}'`;
      return null;
    }
  },

  // =================== C++ SCENARIOS ===================
  {
    name: "C++: Successful batch execution (2 test cases)",
    language: "cpp",
    code: `
#include <iostream>
#include <string>
using namespace std;
int main() {
    string s;
    if (cin >> s) {
        cout << "CPP: " << s << endl;
    }
    return 0;
}
    `,
    inputs: ["hello", "world"],
    verify: (res) => {
      if (res.status !== 'Success') return `Expected 'Success', got '${res.status}'`;
      if (!res.results || res.results.length !== 2) return `Expected 2 results, got ${res.results?.length}`;
      if (res.results[0].status !== 'Accepted') return `Result 0: expected 'Accepted', got '${res.results[0].status}'`;
      if (!res.results[0].stdout.includes('CPP: hello')) return `Result 0 output mismatch: '${res.results[0].stdout}'`;
      if (res.results[1].status !== 'Accepted') return `Result 1: expected 'Accepted', got '${res.results[1].status}'`;
      if (!res.results[1].stdout.includes('CPP: world')) return `Result 1 output mismatch: '${res.results[1].stdout}'`;
      return null;
    }
  },
  {
    name: "C++: Compilation Error (Missing Semicolon)",
    language: "cpp",
    code: `
#include <iostream>
int main() {
    std::cout << "no semicolon"
    return 0;
}
    `,
    inputs: ["test"],
    verify: (res) => {
      if (res.status !== 'Compilation Error') return `Expected 'Compilation Error', got '${res.status}'`;
      if (!res.error || !res.error.toLowerCase().includes('error')) return `Expected error message details, got: '${res.error}'`;
      return null;
    }
  },
  {
    name: "C++: Time Limit Exceeded (Infinite Loop)",
    language: "cpp",
    code: `
int main() {
    while(true) {}
    return 0;
}
    `,
    inputs: ["test"],
    verify: (res) => {
      if (res.status !== 'Success') return `Expected 'Success' containing a TLE case, got '${res.status}'`;
      if (res.results[0].status !== 'Time Limit Exceeded') return `Expected 'Time Limit Exceeded', got '${res.results[0].status}'`;
      return null;
    }
  },

  // =================== JAVA SCENARIOS ===================
  {
    name: "Java: Successful batch execution (2 test cases)",
    language: "java",
    code: `
import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            System.out.println("JAVA: " + sc.next());
        }
    }
}
    `,
    inputs: ["java1", "java2"],
    verify: (res) => {
      if (res.status !== 'Success') return `Expected 'Success', got '${res.status}'`;
      if (!res.results || res.results.length !== 2) return `Expected 2 results, got ${res.results?.length}`;
      if (res.results[0].status !== 'Accepted') return `Result 0: expected 'Accepted', got '${res.results[0].status}'`;
      if (!res.results[0].stdout.includes('JAVA: java1')) return `Result 0 output mismatch: '${res.results[0].stdout}'`;
      if (res.results[1].status !== 'Accepted') return `Result 1: expected 'Accepted', got '${res.results[1].status}'`;
      if (!res.results[1].stdout.includes('JAVA: java2')) return `Result 1 output mismatch: '${res.results[1].stdout}'`;
      return null;
    }
  },
  {
    name: "Java: Compilation Error (Syntax Error)",
    language: "java",
    code: `
public class Main {
    public static void main(String[] args) {
        System.out.println("syntax error"
    }
}
    `,
    inputs: ["test"],
    verify: (res) => {
      if (res.status !== 'Compilation Error') return `Expected 'Compilation Error', got '${res.status}'`;
      if (!res.error || !res.error.toLowerCase().includes('error')) return `Expected error logs, got: '${res.error}'`;
      return null;
    }
  },
  {
    name: "Java: Runtime Error (Unhandled Exception)",
    language: "java",
    code: `
public class Main {
    public static void main(String[] args) {
        throw new RuntimeException("E2E Test Exception Triggered");
    }
}
    `,
    inputs: ["test"],
    verify: (res) => {
      if (res.status !== 'Success') return `Expected 'Success', got '${res.status}'`;
      if (res.results[0].status !== 'Runtime Error') return `Expected 'Runtime Error', got '${res.results[0].status}'`;
      if (!res.results[0].error.includes('RuntimeException') && !res.results[0].error.includes('E2E Test Exception Triggered')) {
        return `Expected stderr to mention Exception details, got: '${res.results[0].error}'`;
      }
      return null;
    }
  },
  {
    name: "Java: Time Limit Exceeded (Infinite Loop)",
    language: "java",
    code: `
public class Main {
    public static void main(String[] args) {
        while (true) {}
    }
}
    `,
    inputs: ["test"],
    verify: (res) => {
      if (res.status !== 'Success') return `Expected 'Success', got '${res.status}'`;
      if (res.results[0].status !== 'Time Limit Exceeded') return `Expected 'Time Limit Exceeded', got '${res.results[0].status}'`;
      return null;
    }
  }
];

async function runTestPipeline() {
  console.log(`${BOLD}====================================================${RESET}`);
  console.log(`${BOLD}     NQTCoder Compiler Pipeline Verification Suite   ${RESET}`);
  console.log(`${BOLD}====================================================${RESET}\n`);

  // 1. Check compiler presence
  const versions = await getCompilerVersions();
  console.log(`${BOLD}Discovered Compiler Versions:${RESET}`);
  console.log(`- Python: ${versions.python.available ? GREEN + 'Available (' + versions.python.version + ')' : RED + 'Not Installed'}${RESET}`);
  console.log(`- C++ (g++): ${versions.cpp.available ? GREEN + 'Available (' + versions.cpp.version + ')' : RED + 'Not Installed'}${RESET}`);
  console.log(`- Java (javac): ${versions.java.available ? GREEN + 'Available (' + versions.java.version + ')' : RED + 'Not Installed'}${RESET}\n`);

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < SCENARIOS.length; i++) {
    const sc = SCENARIOS[i];
    const langAvailable = versions[sc.language === 'cpp' ? 'cpp' : sc.language === 'java' ? 'java' : 'python']?.available;
    
    if (!langAvailable) {
      console.log(`${YELLOW}⚠️  Skipping Test [${i+1}/${SCENARIOS.length}]: ${sc.name} (Compiler not installed)${RESET}`);
      continue;
    }

    console.log(`🏃 Running Test [${i+1}/${SCENARIOS.length}]: ${sc.name}...`);
    try {
      // Run the test cases - enforce a short 1-second timeout for TLE test speedups
      const timeLimit = sc.name.includes("Time Limit Exceeded") ? 1 : 2;
      const res = await runLocalCodeMulti(sc.code, sc.language, sc.inputs, timeLimit);
      
      const errorResult = sc.verify(res);
      if (errorResult === null) {
        console.log(`  ${GREEN}✓ Passed${RESET}\n`);
        passed++;
      } else {
        console.log(`  ${RED}✗ Failed: ${errorResult}${RESET}`);
        console.log(`  Full Payload Response:`, JSON.stringify(res, null, 2));
        console.log('\n');
        failed++;
      }
    } catch (err) {
      console.log(`  ${RED}✗ Exception thrown: ${err.message}${RESET}\n`);
      failed++;
    }
  }

  console.log(`${BOLD}==================== Summary ========================${RESET}`);
  console.log(`Passed: ${GREEN}${passed}${RESET}`);
  console.log(`Failed: ${failed > 0 ? RED + failed : GREEN + failed}${RESET}`);
  console.log(`${BOLD}====================================================${RESET}\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestPipeline().catch(err => {
  console.error(`${RED}Fatal error running test pipeline:${RESET}`, err);
  process.exit(1);
});
