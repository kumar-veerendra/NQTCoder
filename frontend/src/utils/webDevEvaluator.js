/**
 * Normalize CSS color (converts rgb/rgba to hex for reliable comparisons)
 */
export const normalizeColor = (colorStr) => {
  if (!colorStr) return '';
  colorStr = colorStr.trim().toLowerCase();
  if (colorStr.startsWith('#')) return colorStr;

  const rgbMatch = colorStr.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3], 10).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  return colorStr;
};

/**
 * Build the complete self-contained HTML payload to inject into the sandboxed iframe
 */
export const buildSandboxedIframeDoc = ({ html = '', css = '', javascript = '', tests = [] }) => {
  // Serialize tests safely
  const serializedTests = JSON.stringify(tests || []);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    /* Default reset to prevent browser margin artifacts */
    html, body {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
  </style>
  <style id="student-injected-css">
${css}
  </style>
</head>
<body>
${html}

  <!-- Console Log Interception & Test Runner Harness -->
  <script>
    (function() {
      // 1. Console Interception
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;

      function sendToParent(type, payload) {
        try {
          window.parent.postMessage({ type: type, payload: payload }, '*');
        } catch (e) {}
      }

      console.log = function(...args) {
        originalLog.apply(console, args);
        sendToParent('NQT_CONSOLE_LOG', { level: 'log', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') });
      };

      console.warn = function(...args) {
        originalWarn.apply(console, args);
        sendToParent('NQT_CONSOLE_LOG', { level: 'warn', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') });
      };

      console.error = function(...args) {
        originalError.apply(console, args);
        sendToParent('NQT_CONSOLE_LOG', { level: 'error', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') });
      };

      window.onerror = function(message, source, lineno, colno, error) {
        sendToParent('NQT_CONSOLE_LOG', { level: 'error', message: 'Runtime Error: ' + message });
      };

      // 2. Semantic Element Finder
      function resolveElement(target) {
        if (!target) return null;
        if (typeof target === 'string') {
          // Check for pseudo :contains selector e.g. button:contains("Add")
          const containsMatch = target.match(/^([a-zA-Z0-9_\-\.]+):contains\(["'](.*?)["']\)$/i);
          if (containsMatch) {
            const tagOrClass = containsMatch[1];
            const textToFind = containsMatch[2].toLowerCase();
            const elements = Array.from(document.querySelectorAll(tagOrClass));
            return elements.find(el => (el.textContent || '').toLowerCase().includes(textToFind)) || null;
          }
          return document.querySelector(target);
        }
        return null;
      }

      // 3. Test Runner Engine
      async function executeTests(testsList) {
        const results = [];
        let passedCount = 0;
        let pointsEarned = 0;
        let totalPoints = 0;

        for (const test of testsList) {
          const testPoints = Number(test.points) || 20;
          totalPoints += testPoints;
          let passed = false;
          let failureReason = '';

          try {
            const el = resolveElement(test.target);

            // Execute Action if specified
            if (test.action && test.action.type) {
              const actType = test.action.type;
              const actionEl = el || document.body;

              if (actType === 'click') {
                actionEl.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
                actionEl.dispatchEvent(new MouseEvent('focus', { bubbles: true, cancelable: true }));
                actionEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                actionEl.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
                if (typeof actionEl.click === 'function') actionEl.click();
              } else if (actType === 'type' || actType === 'input') {
                actionEl.focus();
                actionEl.value = test.action.value !== undefined ? test.action.value : '';
                actionEl.dispatchEvent(new Event('input', { bubbles: true }));
                actionEl.dispatchEvent(new Event('change', { bubbles: true }));
              } else if (actType === 'key' || actType === 'keydown') {
                const key = test.action.key || 'Enter';
                actionEl.dispatchEvent(new KeyboardEvent('keydown', { key: key, code: key, bubbles: true }));
                actionEl.dispatchEvent(new KeyboardEvent('keyup', { key: key, code: key, bubbles: true }));
              }

              // Allow DOM ticks for microtask & requestAnimationFrame
              await new Promise(r => setTimeout(r, 60));
            }

            // Re-resolve element after action
            const targetEl = resolveElement(test.target);
            const assertion = test.assertion || { type: 'exists' };

            switch (assertion.type) {
              case 'exists':
                passed = targetEl !== null;
                if (!passed) failureReason = 'Element not found in DOM';
                break;

              case 'notExists':
                passed = targetEl === null;
                if (!passed) failureReason = 'Element should not exist in DOM';
                break;

              case 'textEquals':
                if (!targetEl) {
                  passed = false;
                  failureReason = 'Target element not found';
                } else {
                  const actualText = (targetEl.textContent || '').trim();
                  const expectedText = (assertion.expected !== undefined ? String(assertion.expected) : '').trim();
                  passed = actualText === expectedText;
                  if (!passed) failureReason = 'Expected text "' + expectedText + '" but found "' + actualText + '"';
                }
                break;

              case 'textContains':
                if (!targetEl) {
                  passed = false;
                  failureReason = 'Target element not found';
                } else {
                  const actualText = (targetEl.textContent || '').toLowerCase();
                  const expectedText = (assertion.expected !== undefined ? String(assertion.expected) : '').toLowerCase();
                  passed = actualText.includes(expectedText);
                  if (!passed) failureReason = 'Text does not contain expected snippet';
                }
                break;

              case 'attributeEquals':
                if (!targetEl) {
                  passed = false;
                  failureReason = 'Target element not found';
                } else {
                  const attrName = assertion.attribute || 'type';
                  const actualVal = targetEl.getAttribute(attrName) || targetEl[attrName] || '';
                  passed = String(actualVal).trim() === String(assertion.expected).trim();
                  if (!passed) failureReason = 'Attribute ' + attrName + ' did not match';
                }
                break;

              case 'countEquals':
                const count = document.querySelectorAll(test.target || '*').length;
                passed = count === Number(assertion.expected);
                if (!passed) failureReason = 'Expected ' + assertion.expected + ' elements, found ' + count;
                break;

              case 'hasClass':
                if (!targetEl) {
                  passed = false;
                  failureReason = 'Target element not found';
                } else {
                  const className = assertion.className || assertion.expected || '';
                  passed = targetEl.classList.contains(className);
                  if (!passed) failureReason = 'Missing class: ' + className;
                }
                break;

              case 'computedCss':
              case 'cssRange':
              case 'cssGreaterThan':
                if (!targetEl) {
                  passed = false;
                  failureReason = 'Target element not found';
                } else {
                  const styleProp = assertion.property || 'color';
                  const computedStyle = window.getComputedStyle(targetEl);
                  const actualVal = computedStyle.getPropertyValue(styleProp) || computedStyle[styleProp] || '';

                  if (assertion.type === 'cssRange') {
                    const num = parseFloat(actualVal);
                    passed = !isNaN(num) && num >= (assertion.min || 0) && num <= (assertion.max || 9999);
                  } else if (assertion.type === 'cssGreaterThan') {
                    const num = parseFloat(actualVal);
                    passed = !isNaN(num) && num >= (Number(assertion.expected) || 0);
                  } else {
                    // Normalize colors and units
                    const actNorm = actualVal.replace(/\\s+/g, '').toLowerCase();
                    const expNorm = String(assertion.expected || '').replace(/\\s+/g, '').toLowerCase();
                    passed = actNorm.includes(expNorm) || expNorm.includes(actNorm);
                  }
                  if (!passed) failureReason = 'Computed CSS for ' + styleProp + ' did not match';
                }
                break;

              case 'isVisible':
                if (!targetEl) {
                  passed = false;
                } else {
                  const rect = targetEl.getBoundingClientRect();
                  const comp = window.getComputedStyle(targetEl);
                  passed = rect.width > 0 && rect.height > 0 && comp.display !== 'none' && comp.visibility !== 'hidden';
                }
                if (!passed) failureReason = 'Element is not visible';
                break;

              default:
                passed = targetEl !== null;
                break;
            }
          } catch (err) {
            passed = false;
            failureReason = 'Evaluation error: ' + err.message;
          }

          if (passed) {
            passedCount += 1;
            pointsEarned += testPoints;
          }

          results.push({
            testId: test.id,
            description: test.description,
            passed: passed,
            points: testPoints,
            earnedPoints: passed ? testPoints : 0,
            failureMessage: passed ? '' : test.failureMessage || failureReason,
          });
        }

        const score = totalPoints > 0 ? Math.round((pointsEarned / totalPoints) * 100) : 0;
        sendToParent('NQT_TEST_RESULTS', {
          testResults: results,
          passedCount: passedCount,
          totalCount: testsList.length,
          pointsEarned: pointsEarned,
          totalPoints: totalPoints,
          score: score,
        });
      }

      // 4. Message Listener from Parent App
      window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'NQT_RUN_TESTS') {
          const testSuite = event.data.tests || ${serializedTests};
          executeTests(testSuite);
        }
      });

      sendToParent('NQT_IFRAME_READY', { ready: true });
    })();
  </script>

  <!-- Student JavaScript -->
  <script id="student-injected-js">
    try {
${javascript}
    } catch (e) {
      console.error('Script Error: ' + e.message);
    }
  </script>
</body>
</html>`;
};
