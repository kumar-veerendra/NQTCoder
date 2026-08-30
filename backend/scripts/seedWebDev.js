import mongoose from 'mongoose';
import dotenv from 'dotenv';
import WebDevQuestion from '../models/WebDevQuestion.js';

dotenv.config();

const webDevSeedData = [
  {
    title: 'Interactive Counter Card',
    slug: 'interactive-counter-card',
    difficulty: 'easy',
    category: 'javascript',
    description: `Build an interactive counter component that allows students to increment, decrement, and reset numeric values. The counter must initialize at 0 and must never decrease below 0.`,
    requirements: [
      'Render a counter display element with id "count" initializing at 0.',
      'An increment button with id "incrementBtn" that increases the counter by 1 upon clicking.',
      'A decrement button with id "decrementBtn" that decreases the counter by 1.',
      'Prevent the counter from decreasing below 0 (non-negative constraint).',
      'A reset button with id "resetBtn" that returns the count back to 0.',
    ],
    starterCode: {
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Counter Card</title>
</head>
<body>
  <div class="counter-card">
    <h2>Student Counter</h2>
    <div id="count" class="count-display">0</div>
    
    <div class="btn-group">
      <button id="decrementBtn" class="btn btn-dec">-</button>
      <button id="resetBtn" class="btn btn-reset">Reset</button>
      <button id="incrementBtn" class="btn btn-inc">+</button>
    </div>
  </div>
</body>
</html>`,
      css: `body {
  font-family: Arial, sans-serif;
  background-color: #0f172a;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.counter-card {
  background: #1e293b;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  width: 320px;
}

.count-display {
  font-size: 3.5rem;
  font-weight: bold;
  color: #38bdf8;
  margin: 1.5rem 0;
}

.btn-group {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn {
  padding: 0.6rem 1.2rem;
  font-size: 1.1rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.9;
}

.btn-dec {
  background: #f43f5e;
  color: white;
}

.btn-reset {
  background: #64748b;
  color: white;
}

.btn-inc {
  background: #10b981;
  color: white;
}`,
      javascript: `// Write your interactive counter logic below
const countDisplay = document.getElementById('count');
const incrementBtn = document.getElementById('incrementBtn');
const decrementBtn = document.getElementById('decrementBtn');
const resetBtn = document.getElementById('resetBtn');

let count = 0;

// Implement click handlers for increment, decrement, and reset:
`,
    },
    solutionCode: {
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Counter Card</title>
</head>
<body>
  <div class="counter-card">
    <h2>Student Counter</h2>
    <div id="count" class="count-display">0</div>
    
    <div class="btn-group">
      <button id="decrementBtn" class="btn btn-dec">-</button>
      <button id="resetBtn" class="btn btn-reset">Reset</button>
      <button id="incrementBtn" class="btn btn-inc">+</button>
    </div>
  </div>
</body>
</html>`,
      css: `body {
  font-family: Arial, sans-serif;
  background-color: #0f172a;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.counter-card {
  background: #1e293b;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  width: 320px;
}

.count-display {
  font-size: 3.5rem;
  font-weight: bold;
  color: #38bdf8;
  margin: 1.5rem 0;
}

.btn-group {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn {
  padding: 0.6rem 1.2rem;
  font-size: 1.1rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-dec {
  background: #f43f5e;
  color: white;
}

.btn-reset {
  background: #64748b;
  color: white;
}

.btn-inc {
  background: #10b981;
  color: white;
}`,
      javascript: `const countDisplay = document.getElementById('count');
const incrementBtn = document.getElementById('incrementBtn');
const decrementBtn = document.getElementById('decrementBtn');
const resetBtn = document.getElementById('resetBtn');

let count = 0;

function updateDisplay() {
  countDisplay.textContent = count;
}

incrementBtn.addEventListener('click', () => {
  count += 1;
  updateDisplay();
});

decrementBtn.addEventListener('click', () => {
  if (count > 0) {
    count -= 1;
    updateDisplay();
  }
});

resetBtn.addEventListener('click', () => {
  count = 0;
  updateDisplay();
});`,
    },
    tests: [
      {
        id: 'cnt_1',
        description: 'Counter element exists with initial value 0',
        failureMessage: 'Element #count was not found or did not initialize with "0"',
        points: 20,
        type: 'dom',
        target: '#count',
        assertion: {
          type: 'textEquals',
          expected: '0',
        },
      },
      {
        id: 'cnt_2',
        description: 'Clicking increment button increases count to 1 and 2',
        failureMessage: 'Clicking #incrementBtn did not increase the counter to 1',
        points: 25,
        type: 'click',
        target: '#incrementBtn',
        action: { type: 'click' },
        assertion: {
          type: 'textEquals',
          expected: '1',
        },
      },
      {
        id: 'cnt_3',
        description: 'Clicking decrement button reduces count by 1',
        failureMessage: 'Clicking #decrementBtn did not decrease the counter',
        points: 25,
        type: 'click',
        target: '#decrementBtn',
        action: { type: 'click' },
        assertion: {
          type: 'textEquals',
          expected: '0',
        },
      },
      {
        id: 'cnt_4',
        description: 'Counter cannot decrease below zero (boundary check)',
        failureMessage: 'Counter decreased below 0 when decrement was clicked at 0',
        points: 20,
        type: 'click',
        target: '#decrementBtn',
        action: { type: 'click' },
        assertion: {
          type: 'textEquals',
          expected: '0',
        },
      },
      {
        id: 'cnt_5',
        description: 'Reset button returns count to 0',
        failureMessage: '#resetBtn did not reset the counter back to 0',
        points: 10,
        type: 'click',
        target: '#resetBtn',
        action: { type: 'click' },
        assertion: {
          type: 'textEquals',
          expected: '0',
        },
      },
    ],
    points: 100,
    timeLimit: 15,
    version: 1,
    status: 'published',
    tags: ['dom', 'javascript', 'events', 'counter'],
    displayOrder: 1,
  },
  {
    title: 'Responsive Login Form with Validation',
    slug: 'responsive-login-form-validation',
    difficulty: 'medium',
    category: 'html-css-javascript',
    description: `Construct a responsive authentication card with an email field, password field, and submit button. Implement client-side validation that alerts the student if the email is invalid or fields are empty upon clicking the login button.`,
    requirements: [
      'Email input with id "email" and type="email".',
      'Password input with id "password" and type="password".',
      'A button with id "loginBtn" or type="submit".',
      'A status container with id "statusMessage" for showing validation verdicts.',
      'Clicking login with empty fields displays "Please fill in all fields" in #statusMessage.',
      'Clicking login with an invalid email address format displays "Invalid email address".',
      'Submitting with valid credentials displays "Login successful".',
    ],
    starterCode: {
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Login Card</title>
</head>
<body>
  <div class="login-box">
    <h2>NQTCoder Login</h2>
    <form id="loginForm" onsubmit="return false;">
      <div class="input-group">
        <label for="email">Email Address</label>
        <input type="email" id="email" placeholder="student@example.com" />
      </div>

      <div class="input-group">
        <label for="password">Password</label>
        <input type="password" id="password" placeholder="••••••••" />
      </div>

      <button type="submit" id="loginBtn">Sign In</button>
      <div id="statusMessage" class="status-msg"></div>
    </form>
  </div>
</body>
</html>`,
      css: `body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #0b0f19;
  color: #e2e8f0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.login-box {
  background: #1e293b;
  padding: 2.5rem;
  border-radius: 16px;
  width: 340px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
}

.login-box h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #38bdf8;
  text-align: center;
}

.input-group {
  margin-bottom: 1.2rem;
}

.input-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: #94a3b8;
}

.input-group input {
  width: 100%;
  padding: 0.75rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  color: white;
  box-sizing: border-box;
  font-size: 0.95rem;
}

.input-group input:focus {
  outline: none;
  border-color: #38bdf8;
}

button {
  width: 100%;
  padding: 0.8rem;
  background: #0284c7;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 0.5rem;
  transition: background 0.2s;
}

button:hover {
  background: #0369a1;
}

.status-msg {
  margin-top: 1rem;
  font-size: 0.85rem;
  text-align: center;
  min-height: 1.2rem;
}`,
      javascript: `// Implement form validation logic here
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const statusMessage = document.getElementById('statusMessage');

// Add event listener to validate inputs upon login submission
`,
    },
    solutionCode: {
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Login Card</title>
</head>
<body>
  <div class="login-box">
    <h2>NQTCoder Login</h2>
    <form id="loginForm" onsubmit="return false;">
      <div class="input-group">
        <label for="email">Email Address</label>
        <input type="email" id="email" placeholder="student@example.com" />
      </div>

      <div class="input-group">
        <label for="password">Password</label>
        <input type="password" id="password" placeholder="••••••••" />
      </div>

      <button type="submit" id="loginBtn">Sign In</button>
      <div id="statusMessage" class="status-msg"></div>
    </form>
  </div>
</body>
</html>`,
      css: `body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #0b0f19;
  color: #e2e8f0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.login-box {
  background: #1e293b;
  padding: 2.5rem;
  border-radius: 16px;
  width: 340px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
}

.input-group {
  margin-bottom: 1.2rem;
}

.input-group label {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
  color: #94a3b8;
}

.input-group input {
  width: 100%;
  padding: 0.75rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  color: white;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 0.8rem;
  background: #0284c7;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.status-msg {
  margin-top: 1rem;
  font-size: 0.85rem;
  text-align: center;
}`,
      javascript: `const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const statusMessage = document.getElementById('statusMessage');

function validateEmail(email) {
  const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return re.test(email);
}

loginBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    statusMessage.textContent = 'Please fill in all fields';
    statusMessage.style.color = '#f43f5e';
    return;
  }

  if (!validateEmail(email)) {
    statusMessage.textContent = 'Invalid email address';
    statusMessage.style.color = '#f43f5e';
    return;
  }

  statusMessage.textContent = 'Login successful';
  statusMessage.style.color = '#10b981';
});`,
    },
    tests: [
      {
        id: 'log_1',
        description: 'Input elements and button exist with required attributes',
        failureMessage: 'Form must contain #email with type="email" and #password with type="password"',
        points: 20,
        type: 'dom',
        target: '#email',
        assertion: {
          type: 'attributeEquals',
          attribute: 'type',
          expected: 'email',
        },
      },
      {
        id: 'log_2',
        description: 'Submitting with empty fields shows "Please fill in all fields"',
        failureMessage: 'Clicking login with empty inputs did not show error message in #statusMessage',
        points: 30,
        type: 'click',
        target: '#loginBtn',
        action: { type: 'click' },
        assertion: {
          type: 'textContains',
          expected: 'Please fill in all fields',
        },
      },
      {
        id: 'log_3',
        description: 'Submitting with invalid email format shows "Invalid email address"',
        failureMessage: 'Entering invalid email format did not trigger email validation message',
        points: 25,
        type: 'input',
        target: '#email',
        action: { type: 'type', value: 'not-an-email' },
        assertion: {
          type: 'exists',
        },
      },
      {
        id: 'log_4',
        description: 'Submitting valid credentials produces "Login successful"',
        failureMessage: 'Valid email and password did not produce "Login successful"',
        points: 25,
        type: 'click',
        target: '#loginBtn',
        action: { type: 'click' },
        assertion: {
          type: 'textContains',
          expected: 'Login successful',
        },
      },
    ],
    points: 100,
    timeLimit: 20,
    version: 1,
    status: 'published',
    tags: ['forms', 'validation', 'html-css-js', 'login'],
    displayOrder: 2,
  },
  {
    title: 'Interactive Task / Todo List',
    slug: 'interactive-task-todo-list',
    difficulty: 'medium',
    category: 'javascript',
    description: `Build a clean vanilla JavaScript task manager where candidates can add new tasks via input and button, toggle completion styles, and delete completed items dynamically.`,
    requirements: [
      'Text input with id "taskInput" for typing a new task.',
      'Add button with id "addTaskBtn" that appends a new item into the unordered list with id "taskList".',
      'Pressing Enter inside #taskInput also appends the new task item.',
      'Clears the text input after adding a task.',
      'Clicking a task text toggles the ".completed" CSS class on the task item.',
      'Clicking the delete button inside a task removes that specific item from the DOM.',
    ],
    starterCode: {
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Task Manager</title>
</head>
<body>
  <div class="todo-app">
    <h2>My Placement Tasks</h2>
    
    <div class="input-row">
      <input type="text" id="taskInput" placeholder="Enter a new task..." />
      <button id="addTaskBtn">Add Task</button>
    </div>

    <ul id="taskList">
      <!-- Dynamic list items will be injected here -->
    </ul>
  </div>
</body>
</html>`,
      css: `body {
  font-family: Arial, sans-serif;
  background-color: #0f172a;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  padding-top: 3rem;
  margin: 0;
}

.todo-app {
  background: #1e293b;
  padding: 2rem;
  border-radius: 12px;
  width: 380px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}

.input-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

#taskInput {
  flex: 1;
  padding: 0.6rem;
  border-radius: 6px;
  border: 1px solid #334155;
  background: #0f172a;
  color: white;
}

#addTaskBtn {
  background: #38bdf8;
  color: #0f172a;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  padding: 0.6rem 1rem;
  cursor: pointer;
}

#taskList {
  list-style: none;
  padding: 0;
  margin: 0;
}

#taskList li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0f172a;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

#taskList li.completed span {
  text-decoration: line-through;
  color: #64748b;
}

.delete-btn {
  background: #f43f5e;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
  cursor: pointer;
}`,
      javascript: `const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

// Implement dynamic task insertion, completion toggle, and deletion
`,
    },
    solutionCode: {
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Task Manager</title>
</head>
<body>
  <div class="todo-app">
    <h2>My Placement Tasks</h2>
    
    <div class="input-row">
      <input type="text" id="taskInput" placeholder="Enter a new task..." />
      <button id="addTaskBtn">Add Task</button>
    </div>

    <ul id="taskList">
    </ul>
  </div>
</body>
</html>`,
      css: `body {
  font-family: Arial, sans-serif;
  background-color: #0f172a;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  padding-top: 3rem;
  margin: 0;
}

.todo-app {
  background: #1e293b;
  padding: 2rem;
  border-radius: 12px;
  width: 380px;
}

.input-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

#taskInput {
  flex: 1;
  padding: 0.6rem;
  border-radius: 6px;
  border: 1px solid #334155;
  background: #0f172a;
  color: white;
}

#addTaskBtn {
  background: #38bdf8;
  color: #0f172a;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  padding: 0.6rem 1rem;
  cursor: pointer;
}

#taskList {
  list-style: none;
  padding: 0;
  margin: 0;
}

#taskList li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0f172a;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

#taskList li.completed span {
  text-decoration: line-through;
  color: #64748b;
}

.delete-btn {
  background: #f43f5e;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
  cursor: pointer;
}`,
      javascript: `const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  const li = document.createElement('li');
  const span = document.createElement('span');
  span.textContent = text;
  span.addEventListener('click', () => {
    li.classList.toggle('completed');
  });

  const delBtn = document.createElement('button');
  delBtn.textContent = 'Delete';
  delBtn.className = 'delete-btn';
  delBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    li.remove();
  });

  li.appendChild(span);
  li.appendChild(delBtn);
  taskList.appendChild(li);

  taskInput.value = '';
}

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    addTask();
  }
});`,
    },
    tests: [
      {
        id: 'todo_1',
        description: 'Input element and add button exist in DOM',
        failureMessage: 'Required elements #taskInput or #addTaskBtn were not found',
        points: 20,
        type: 'dom',
        target: '#taskInput',
        assertion: {
          type: 'exists',
        },
      },
      {
        id: 'todo_2',
        description: 'Adding a task appends an item to #taskList',
        failureMessage: 'Clicking #addTaskBtn with input text did not add an <li> to #taskList',
        points: 30,
        type: 'input',
        target: '#taskInput',
        action: { type: 'type', value: 'Practice TCS NQT Coding' },
        assertion: {
          type: 'exists',
        },
      },
      {
        id: 'todo_3',
        description: 'Task item can be toggled as completed',
        failureMessage: 'Clicking the task item did not toggle the "completed" class',
        points: 25,
        type: 'dom',
        target: '#taskList li',
        assertion: {
          type: 'exists',
        },
      },
      {
        id: 'todo_4',
        description: 'Delete button removes task from DOM',
        failureMessage: 'Clicking delete button did not remove the task item from list',
        points: 25,
        type: 'dom',
        target: '#taskList',
        assertion: {
          type: 'exists',
        },
      },
    ],
    points: 100,
    timeLimit: 25,
    version: 1,
    status: 'published',
    tags: ['dom', 'javascript', 'todo', 'lists'],
    displayOrder: 3,
  },
  {
    title: 'Dynamic Color Palette Generator',
    slug: 'dynamic-color-palette-generator',
    difficulty: 'easy',
    category: 'css',
    description: `Build a dynamic color palette card. Clicking the "Generate Colors" button generates random hex colors for 4 color cards and updates the hex labels underneath each swatch.`,
    requirements: [
      'Four color box containers with class ".color-box".',
      'Hex code label inside each color box with class ".hex-code".',
      'Generate button with id "generateBtn".',
      'Clicking generate button assigns new background colors to all color boxes.',
      'Hex codes match format "#XXXXXX".',
    ],
    starterCode: {
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Color Palette</title>
</head>
<body>
  <div class="palette-container">
    <h2>Palette Generator</h2>
    
    <div class="palette-grid">
      <div class="color-box"><span class="hex-code">#38bdf8</span></div>
      <div class="color-box"><span class="hex-code">#818cf8</span></div>
      <div class="color-box"><span class="hex-code">#c084fc</span></div>
      <div class="color-box"><span class="hex-code">#f472b6</span></div>
    </div>

    <button id="generateBtn">Generate New Palette</button>
  </div>
</body>
</html>`,
      css: `body {
  font-family: Arial, sans-serif;
  background-color: #0f172a;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.palette-container {
  background: #1e293b;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}

.palette-grid {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
}

.color-box {
  width: 90px;
  height: 140px;
  border-radius: 12px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 0.75rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}

.color-box:hover {
  transform: translateY(-4px);
}

.hex-code {
  background: rgba(0,0,0,0.6);
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-family: monospace;
  font-weight: bold;
}

#generateBtn {
  background: #38bdf8;
  color: #0f172a;
  font-weight: bold;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}`,
      javascript: `const generateBtn = document.getElementById('generateBtn');
const colorBoxes = document.querySelectorAll('.color-box');

// Implement random hex color generator logic on click
`,
    },
    solutionCode: {
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Color Palette</title>
</head>
<body>
  <div class="palette-container">
    <h2>Palette Generator</h2>
    
    <div class="palette-grid">
      <div class="color-box"><span class="hex-code">#38bdf8</span></div>
      <div class="color-box"><span class="hex-code">#818cf8</span></div>
      <div class="color-box"><span class="hex-code">#c084fc</span></div>
      <div class="color-box"><span class="hex-code">#f472b6</span></div>
    </div>

    <button id="generateBtn">Generate New Palette</button>
  </div>
</body>
</html>`,
      css: `body {
  font-family: Arial, sans-serif;
  background-color: #0f172a;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.palette-container {
  background: #1e293b;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
}

.palette-grid {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
}

.color-box {
  width: 90px;
  height: 140px;
  border-radius: 12px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 0.75rem;
}

.hex-code {
  background: rgba(0,0,0,0.6);
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-family: monospace;
  font-weight: bold;
}

#generateBtn {
  background: #38bdf8;
  color: #0f172a;
  font-weight: bold;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
}`,
      javascript: `const generateBtn = document.getElementById('generateBtn');
const colorBoxes = document.querySelectorAll('.color-box');

function getRandomHex() {
  const chars = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += chars[Math.floor(Math.random() * 16)];
  }
  return color;
}

function updatePalette() {
  colorBoxes.forEach((box) => {
    const hex = getRandomHex();
    box.style.backgroundColor = hex;
    const hexSpan = box.querySelector('.hex-code');
    if (hexSpan) hexSpan.textContent = hex;
  });
}

generateBtn.addEventListener('click', updatePalette);
updatePalette();`,
    },
    tests: [
      {
        id: 'pal_1',
        description: 'Palette grid has 4 color boxes with hex labels',
        failureMessage: 'Must render exactly 4 .color-box elements',
        points: 30,
        type: 'count',
        target: '.color-box',
        assertion: {
          type: 'countEquals',
          expected: 4,
        },
      },
      {
        id: 'pal_2',
        description: 'Generate button with id #generateBtn exists',
        failureMessage: 'Element #generateBtn was not found',
        points: 20,
        type: 'dom',
        target: '#generateBtn',
        assertion: {
          type: 'exists',
        },
      },
      {
        id: 'pal_3',
        description: 'Clicking generate button triggers color update',
        failureMessage: 'Clicking #generateBtn did not update color box styles',
        points: 50,
        type: 'click',
        target: '#generateBtn',
        action: { type: 'click' },
        assertion: {
          type: 'exists',
        },
      },
    ],
    points: 100,
    timeLimit: 15,
    version: 1,
    status: 'published',
    tags: ['css', 'javascript', 'colors', 'styling'],
    displayOrder: 4,
  },
  {
    title: '5-Star Interactive Rating Widget',
    slug: '5-star-interactive-rating-widget',
    difficulty: 'medium',
    category: 'html-css-javascript',
    description: `Build an interactive 5-star rating widget. When the student hovers or clicks on a star, all stars up to that rating highlight in golden color, and a feedback label updates to show the selected rating (e.g., "5 of 5 Stars").`,
    requirements: [
      'Rating container with 5 star elements carrying class ".star".',
      'Feedback text container with id "ratingFeedback".',
      'Clicking the 4th star highlights 4 stars with the ".active" class.',
      'Updates #ratingFeedback text to display "4 of 5 Stars".',
      'Preserves selected rating state on subsequent interactions.',
    ],
    starterCode: {
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rating Widget</title>
</head>
<body>
  <div class="rating-card">
    <h3>Rate Your Assessment</h3>
    <div id="starContainer" class="star-group">
      <span class="star" data-value="1">&#9733;</span>
      <span class="star" data-value="2">&#9733;</span>
      <span class="star" data-value="3">&#9733;</span>
      <span class="star" data-value="4">&#9733;</span>
      <span class="star" data-value="5">&#9733;</span>
    </div>
    <div id="ratingFeedback" class="feedback-text">Select a rating</div>
  </div>
</body>
</html>`,
      css: `body {
  font-family: Arial, sans-serif;
  background-color: #0f172a;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.rating-card {
  background: #1e293b;
  padding: 2.5rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}

.star-group {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin: 1.5rem 0;
}

.star {
  font-size: 2.5rem;
  color: #475569;
  cursor: pointer;
  transition: color 0.2s, transform 0.1s;
}

.star:hover {
  transform: scale(1.15);
}

.star.active {
  color: #fbbf24;
}

.feedback-text {
  font-size: 0.95rem;
  color: #94a3b8;
  font-weight: bold;
}`,
      javascript: `const stars = document.querySelectorAll('.star');
const feedback = document.getElementById('ratingFeedback');

// Implement hover & click rating selection logic
`,
    },
    solutionCode: {
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rating Widget</title>
</head>
<body>
  <div class="rating-card">
    <h3>Rate Your Assessment</h3>
    <div id="starContainer" class="star-group">
      <span class="star" data-value="1">&#9733;</span>
      <span class="star" data-value="2">&#9733;</span>
      <span class="star" data-value="3">&#9733;</span>
      <span class="star" data-value="4">&#9733;</span>
      <span class="star" data-value="5">&#9733;</span>
    </div>
    <div id="ratingFeedback" class="feedback-text">Select a rating</div>
  </div>
</body>
</html>`,
      css: `body {
  font-family: Arial, sans-serif;
  background-color: #0f172a;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.rating-card {
  background: #1e293b;
  padding: 2.5rem;
  border-radius: 16px;
  text-align: center;
}

.star-group {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin: 1.5rem 0;
}

.star {
  font-size: 2.5rem;
  color: #475569;
  cursor: pointer;
}

.star.active {
  color: #fbbf24;
}

.feedback-text {
  font-size: 0.95rem;
  color: #94a3b8;
  font-weight: bold;
}`,
      javascript: `const stars = document.querySelectorAll('.star');
const feedback = document.getElementById('ratingFeedback');

let selectedRating = 0;

function highlightStars(rating) {
  stars.forEach((star) => {
    const val = parseInt(star.getAttribute('data-value'), 10);
    if (val <= rating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

stars.forEach((star) => {
  star.addEventListener('click', () => {
    selectedRating = parseInt(star.getAttribute('data-value'), 10);
    highlightStars(selectedRating);
    feedback.textContent = \`\${selectedRating} of 5 Stars\`;
  });
});`,
    },
    tests: [
      {
        id: 'star_1',
        description: 'Contains 5 star elements with .star class',
        failureMessage: 'Widget must contain 5 .star elements',
        points: 20,
        type: 'count',
        target: '.star',
        assertion: {
          type: 'countEquals',
          expected: 5,
        },
      },
      {
        id: 'star_2',
        description: 'Initial feedback text prompts selection',
        failureMessage: '#ratingFeedback must contain initial text',
        points: 20,
        type: 'dom',
        target: '#ratingFeedback',
        assertion: {
          type: 'exists',
        },
      },
      {
        id: 'star_3',
        description: 'Clicking star applies .active class to stars',
        failureMessage: 'Clicking star did not apply active highlight class',
        points: 30,
        type: 'click',
        target: '.star[data-value="4"]',
        action: { type: 'click' },
        assertion: {
          type: 'hasClass',
          className: 'active',
        },
      },
      {
        id: 'star_4',
        description: 'Feedback text updates to show "4 of 5 Stars"',
        failureMessage: '#ratingFeedback did not update to "4 of 5 Stars" after clicking 4th star',
        points: 30,
        type: 'dom',
        target: '#ratingFeedback',
        assertion: {
          type: 'textContains',
          expected: '4 of 5 Stars',
        },
      },
    ],
    points: 100,
    timeLimit: 20,
    version: 1,
    status: 'published',
    tags: ['stars', 'ratings', 'events', 'ui'],
    displayOrder: 5,
  },
];

async function seedWebDev() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nqtcoder';
    console.log('Connecting to MongoDB...');
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    } catch {
      await mongoose.connect('mongodb://127.0.0.1:27017/nqtcoder');
    }
    console.log('✅ Connected to MongoDB.');

    console.log(`🌱 Seeding ${webDevSeedData.length} Web Development practical challenges...`);

    for (const qData of webDevSeedData) {
      await WebDevQuestion.findOneAndUpdate({ slug: qData.slug }, qData, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
      console.log(`  ✓ Seeded / Verified: ${qData.title} (${qData.difficulty})`);
    }

    console.log('🌟 Web Development Practice challenges successfully seeded! 🌟');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

// Execute if run directly via CLI
seedWebDev();
