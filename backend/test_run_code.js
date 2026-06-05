import dotenv from 'dotenv';
import { runLocalCode, getCompilerVersions } from './utils/localRunner.js';

dotenv.config();

async function main() {
  console.log("=== Testing Compilers Discovery ===");
  const compilers = await getCompilerVersions();
  console.log(JSON.stringify(compilers, null, 2));

  console.log("\n=== Testing Python Run ===");
  const pyCode = `
import sys
input_data = sys.stdin.read().strip()
print(f"Python Output: {input_data}")
`;
  const pyRes = await runLocalCode(pyCode, 'python', 'hello from python');
  console.log("Python result:", pyRes);

  console.log("\n=== Testing C++ Run ===");
  const cppCode = `
#include <iostream>
#include <string>
using namespace std;
int main() {
    string s;
    if (getline(cin, s)) {
        cout << "C++ Output: " << s << endl;
    }
    return 0;
}
`;
  const cppRes = await runLocalCode(cppCode, 'cpp', 'hello from cpp');
  console.log("C++ result:", cppRes);

  console.log("\n=== Testing Java Run ===");
  const javaCode = `
import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            System.out.println("Java Output: " + sc.nextLine());
        }
    }
}
`;
  const javaRes = await runLocalCode(javaCode, 'java', 'hello from java');
  console.log("Java result:", javaRes);
}

main().catch(console.error);
