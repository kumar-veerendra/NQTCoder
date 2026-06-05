import React, { useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Settings, RefreshCw, Type } from 'lucide-react';

const CODE_TEMPLATES = {
  python: `# Python 3
# ───────────
# Instructions:
# 1. Write a complete working program from scratch.
# 2. Read input from standard input (stdin) using sys.stdin.read() or input().
# 3. Print your final result to standard output (stdout) using print().
# 4. NQTCoder runs your code once per testcase. Do not wrap your logic in 
#    a loop for multiple test cases unless specified in the problem statement.
#
# Write your code below:

`,
  cpp: `// C++
// ───────────
// Instructions:
// 1. Write a complete working program from scratch.
// 2. You must include headers (e.g. #include <iostream>), namespace std, and int main().
// 3. Read input from standard input (stdin) using cin (e.g. cin >> N).
// 4. Print your final result to standard output (stdout) using cout.
// 5. NQTCoder runs your code once per testcase. Do not wrap your logic in 
//    a t-- loop for multiple test cases unless specified in the problem statement.
//
// Write your code below:

`,
  java: `// Java
// ───────────
// Instructions:
// 1. Write a complete working program from scratch (including imports).
// 2. The entry class must be named "Main" (public class Main).
// 3. Implement your execution entry point inside: public static void main(String[] args)
// 4. Read input from standard input (stdin) using Scanner (e.g. new Scanner(System.in)).
// 5. Print your final result to standard output (stdout) using System.out.println().
// 6. NQTCoder runs your code once per testcase. Do not wrap your logic in 
//    a hasNext() loop for multiple test cases unless specified in the problem statement.
//
// Write your code below:

`
};

const CodeEditor = ({
  language,
  onLanguageChange,
  code,
  onCodeChange,
  isLocked = false,
  fontSize = 14,
  onFontSizeChange,
  theme = 'dark',
  compilerStatus = null,
  disableClipboard = false
}) => {

  // Set default templates when code is empty or language changes, 
  // and handle swapping if the editor contains another language's default template.
  useEffect(() => {
    const templates = Object.values(CODE_TEMPLATES);
    if (!code || templates.some(t => t.trim() === code.trim())) {
      onCodeChange(CODE_TEMPLATES[language]);
    }
  }, [language]);

  const handleResetTemplate = () => {
    if (window.confirm('Are you sure you want to reset your code to the default template? This will erase current changes.')) {
      onCodeChange(CODE_TEMPLATES[language]);
    }
  };

  const handleEditorChange = (value) => {
    onCodeChange(value);
  };

  const monacoOptions = {
    readOnly: isLocked,
    minimap: { enabled: false },
    fontSize: fontSize,
    fontFamily: 'JetBrains Mono, Courier New, monospace',
    fontLigatures: true,
    wordWrap: 'on',
    automaticLayout: true,
    quickSuggestions: {
      other: false,
      comments: false,
      strings: false
    },
    suggestOnTriggerCharacters: false,
    acceptSuggestionOnEnter: 'off',
    tabCompletion: 'off',
    wordBasedSuggestions: 'none',
    parameterHints: { enabled: false },
    snippetSuggestions: 'none',
    suggest: {
      showWords: false,
      showMethods: false,
      showFunctions: false,
      showConstructors: false,
      showFields: false,
      showProperties: false,
      showEvents: false,
      showOperators: false,
      showUnit: false,
      showValue: false,
      showConstant: false,
      showEnum: false,
      showEnumMember: false,
      showKeyword: false,
      showSnippet: false,
      showColor: false,
      showFile: false,
      showReference: false,
      showFolder: false,
      showTypeParameter: false,
      showUser: false,
      showIssues: false,
      showClasses: false,
      showInterfaces: false,
      showModules: false,
      showStructs: false
    },
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      useShadows: false,
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8
    },
    lineNumbersMinChars: 3,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on'
  };

  return (
    <div className="h-full flex flex-col bg-darkCard border border-darkBorder rounded-lg overflow-hidden">
      {/* Editor Control Header */}
      <div className="px-4 py-3 bg-darkBg/60 border-b border-darkBorder flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            disabled={isLocked}
            className="bg-darkCard border border-darkBorder text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-md focus:outline-none focus:border-accentBlue transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="cpp">
              C++ {compilerStatus?.cpp?.available ? `(${compilerStatus.cpp.version})` : compilerStatus ? '(Not Connected)' : ''}
            </option>
            <option value="java">
              Java {compilerStatus?.java?.available ? `(${compilerStatus.java.version})` : compilerStatus ? '(Not Connected)' : ''}
            </option>
            <option value="python">
              Python {compilerStatus?.python?.available ? `(${compilerStatus.python.version})` : compilerStatus ? '(Not Connected)' : ''}
            </option>
          </select>

          {compilerStatus?.error ? (
            <div className="flex items-center space-x-1.5 text-[10px] font-bold px-2 py-1.5 rounded-md bg-darkCard border border-darkBorder select-none">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse"></span>
              <span className="text-rose-500 font-extrabold">Server Offline</span>
            </div>
          ) : !compilerStatus ? (
            <div className="flex items-center space-x-1.5 text-[10px] font-bold px-2 py-1.5 rounded-md bg-darkCard border border-darkBorder select-none">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-amber-400 font-extrabold">Checking Compilers...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-[10px] font-bold px-2 py-1.5 rounded-md bg-darkCard border border-darkBorder select-none">
              <span className={`h-1.5 w-1.5 rounded-full ${
                compilerStatus[language]?.available ? 'bg-emerald-500' : 'bg-rose-500'
              }`}></span>
              <span className={compilerStatus[language]?.available ? 'text-emerald-400 font-extrabold' : 'text-rose-400 font-extrabold'}>
                {compilerStatus[language]?.available 
                  ? 'Connected' 
                  : 'Offline (Not Found)'
                }
              </span>
            </div>
          )}

          <button
            onClick={handleResetTemplate}
            disabled={isLocked}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 bg-darkCard border border-darkBorder px-2.5 py-1.5 rounded-md transition-colors disabled:opacity-50"
            title="Reset to Default Template"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-darkCard border border-darkBorder px-2 py-1 rounded-md">
            <Type className="w-3.5 h-3.5" />
            <select
              value={fontSize}
              onChange={(e) => onFontSizeChange(Number(e.target.value))}
              className="bg-transparent text-slate-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="12">12px</option>
              <option value="14">14px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
              <option value="20">20px</option>
            </select>
          </div>
          {isLocked && (
            <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30 uppercase font-black tracking-widest animate-pulse">
              Locked
            </span>
          )}
        </div>
      </div>

      {/* Monaco Core Editor */}
      <div 
        className="flex-grow min-h-0 relative"
        onContextMenu={(e) => {
          if (disableClipboard) {
            e.preventDefault();
            alert('Right-click menu is disabled in assessment mode.');
          }
        }}
        onCopy={(e) => {
          if (disableClipboard) {
            e.preventDefault();
            alert('Copying code is disabled in assessment mode.');
          }
        }}
        onCut={(e) => {
          if (disableClipboard) {
            e.preventDefault();
            alert('Cutting code is disabled in assessment mode.');
          }
        }}
        onPaste={(e) => {
          if (disableClipboard) {
            e.preventDefault();
            alert('Pasting code is disabled in assessment mode.');
          }
        }}
      >
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : 'python'}
          theme={theme === 'light' ? 'light' : 'vs-dark'}
          value={code}
          onChange={handleEditorChange}
          options={monacoOptions}
          loading={
            <div className="absolute inset-0 flex items-center justify-center bg-darkBg text-slate-400 text-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accentBlue mr-3"></div>
              Loading Editor...
            </div>
          }
        />
      </div>
    </div>
  );
};

export default CodeEditor;
