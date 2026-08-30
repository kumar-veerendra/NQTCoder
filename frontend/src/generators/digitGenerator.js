function shuffle(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateDigitPuzzle(levelConfig = {}) {
  const digitsCount = levelConfig.digitsCount || 3;
  const availableOps = levelConfig.operators || ['+', '-'];

  const digits = [];
  while (digits.length < digitsCount) {
    const d = getRandomInt(2, 9);
    if (!digits.includes(d)) digits.push(d);
  }

  let target = 0;
  let expression = '';
  let tries = 0;

  while (tries < 20) {
    tries++;
    const shuffledDigits = shuffle(digits);
    let currentVal = shuffledDigits[0];
    let expStr = `${shuffledDigits[0]}`;
    let valid = true;

    for (let i = 1; i < digitsCount; i++) {
      const op = availableOps[Math.floor(Math.random() * availableOps.length)];
      const nextD = shuffledDigits[i];

      if (op === '+') {
        currentVal += nextD;
        expStr += ` + ${nextD}`;
      } else if (op === '-') {
        if (currentVal - nextD <= 0) {
          valid = false;
          break;
        }
        currentVal -= nextD;
        expStr += ` - ${nextD}`;
      } else if (op === '*') {
        currentVal *= nextD;
        expStr += ` × ${nextD}`;
      } else if (op === '/') {
        if (currentVal % nextD !== 0 || nextD === 0) {
          valid = false;
          break;
        }
        currentVal /= nextD;
        expStr += ` ÷ ${nextD}`;
      }
    }

    if (valid && currentVal > 0 && currentVal <= 100) {
      target = currentVal;
      expression = expStr;
      break;
    }
  }

  if (!expression) {
    const d1 = digits[0], d2 = digits[1], d3 = digits[2] || 2;
    target = d1 * d2 + d3;
    expression = `${d1} × ${d2} + ${d3}`;
  }

  const options = [expression];
  const ops = ['+', '-', '×'];
  while (options.length < 4) {
    const sD = shuffle(digits);
    const op1 = ops[Math.floor(Math.random() * ops.length)];
    const op2 = ops[Math.floor(Math.random() * ops.length)];
    const candidate = sD.length === 3 ? `${sD[0]} ${op1} ${sD[1]} ${op2} ${sD[2]}` : `${sD[0]} ${op1} ${sD[1]}`;
    if (!options.includes(candidate)) {
      options.push(candidate);
    }
  }

  return {
    target,
    digits,
    correctAnswer: expression,
    options: shuffle(options),
    explanation: `${expression} = ${target}`,
  };
}
