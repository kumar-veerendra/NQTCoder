import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { buildSandboxedIframeDoc } from '../../utils/webDevEvaluator';
import { RefreshCw, Monitor, Tablet, Smartphone, Sparkles, Terminal } from 'lucide-react';

const WebDevPreviewFrame = forwardRef(
  (
    {
      html = '',
      css = '',
      javascript = '',
      tests = [],
      onConsoleLog,
      onTestResults,
      className = '',
    },
    ref
  ) => {
    const iframeRef = useRef(null);
    const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
    const [iframeKey, setIframeKey] = useState(0);
    const [isRunningTests, setIsRunningTests] = useState(false);
    const [isIframeReady, setIsIframeReady] = useState(false);

    // Build the sandboxed HTML document
    const srcDoc = React.useMemo(() => {
      return buildSandboxedIframeDoc({ html, css, javascript, tests });
    }, [html, css, javascript, tests, iframeKey]);

    // Handle postMessage communication from the iframe
    useEffect(() => {
      const handleMessage = (event) => {
        const data = event.data;
        if (!data || typeof data !== 'object') return;

        if (data.type === 'NQT_IFRAME_READY') {
          setIsIframeReady(true);
        } else if (data.type === 'NQT_CONSOLE_LOG') {
          if (onConsoleLog) onConsoleLog(data.payload);
        } else if (data.type === 'NQT_TEST_RESULTS') {
          setIsRunningTests(false);
          if (onTestResults) onTestResults(data.payload);
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, [onConsoleLog, onTestResults]);

    // Expose runTests method to parent components (Arena, Admin Form)
    useImperativeHandle(ref, () => ({
      runTests: (customTests = null) => {
        if (!iframeRef.current || !iframeRef.current.contentWindow) return;

        setIsRunningTests(true);
        const testSuite = customTests || tests;

        // Post run command to iframe
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'NQT_RUN_TESTS',
            tests: testSuite,
          },
          '*'
        );

        // Watchdog timeout: in case student code enters infinite loop or hangs
        setTimeout(() => {
          setIsRunningTests((prev) => {
            if (prev) {
              if (onTestResults) {
                onTestResults({
                  testResults: testSuite.map((t) => ({
                    testId: t.id,
                    description: t.description,
                    passed: false,
                    points: t.points,
                    earnedPoints: 0,
                    failureMessage: 'Test execution timed out (possible infinite loop or script error)',
                  })),
                  passedCount: 0,
                  totalCount: testSuite.length,
                  pointsEarned: 0,
                  totalPoints: testSuite.reduce((acc, t) => acc + (t.points || 0), 0),
                  score: 0,
                });
              }
              return false;
            }
            return false;
          });
        }, 4000);
      },
      reloadPreview: () => {
        setIframeKey((prev) => prev + 1);
      },
    }));

    const getViewportWidth = () => {
      switch (viewport) {
        case 'tablet':
          return '768px';
        case 'mobile':
          return '375px';
        default:
          return '100%';
      }
    };

    return (
      <div className={`flex flex-col h-full bg-darkBg border border-darkBorder rounded-2xl overflow-hidden shadow-xl ${className}`}>
        {/* Preview Top Control Bar */}
        <div className="bg-darkCard px-4 py-2.5 border-b border-darkBorder flex items-center justify-between gap-3 shrink-0 select-none">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Live Sandbox Preview
            </span>
          </div>

          {/* Viewport Width Controls */}
          <div className="flex items-center space-x-1 bg-darkBg border border-darkBorder p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              title="Desktop (100%)"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewport === 'desktop'
                  ? 'bg-accentBlue text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('tablet')}
              title="Tablet (768px)"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewport === 'tablet'
                  ? 'bg-accentBlue text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              title="Mobile (375px)"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewport === 'mobile'
                  ? 'bg-accentBlue text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={() => setIframeKey((k) => k + 1)}
            title="Reload Preview"
            className="p-1.5 rounded-xl border border-darkBorder hover:border-slate-600 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sandboxed Iframe Container */}
        <div className="flex-1 bg-slate-950 flex items-center justify-center overflow-auto p-2">
          <div
            className="h-full bg-white transition-all duration-300 rounded-lg overflow-hidden shadow-2xl relative"
            style={{
              width: getViewportWidth(),
              maxWidth: '100%',
            }}
          >
            <iframe
              key={iframeKey}
              ref={iframeRef}
              srcDoc={srcDoc}
              title="Student Output Preview"
              sandbox="allow-scripts"
              className="w-full h-full border-0 bg-white"
            />
          </div>
        </div>
      </div>
    );
  }
);

WebDevPreviewFrame.displayName = 'WebDevPreviewFrame';

export default WebDevPreviewFrame;
