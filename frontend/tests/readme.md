🧪 Testing Overview

This project includes two categories of tests:

✔ UI Component Tests (React Testing Library)

Rendering components

Simulating board clicks

Verifying game UI updates

Verifying button states

Ensuring correct layout and behavior

✔ API Service Tests (Axios + Mocking)

Verifies correct API calls

Mocks axios.create() with interceptors

Ensures axios responses behave the same as real backend

Prevents Jest from crashing on import.meta.env

⚙️ Jest Setup Summary

Because this project uses Vite, React, JSX, and import.meta, additional setup was required.

This project uses:

jest

babel-jest

@testing-library/react

identity-obj-proxy

A custom solution to safely handle import.meta.env during tests

📘 Config Files (Important)
1️⃣ babel.config.js
module.exports = {
presets: [
["@babel/preset-env", { targets: { node: "current" } }],
["@babel/preset-react", { runtime: "automatic" }]
],
};

2️⃣ jest.config.js
module.exports = {
testEnvironment: "jsdom",

transform: {
"^.+\\.(js|jsx)$": "babel-jest",
},

transformIgnorePatterns: ["/node_modules/"],

setupFilesAfterEnv: [
"@testing-library/jest-dom",
"<rootDir>/jest.setup.js"
],

moduleNameMapper: {
"\\.(css|less|scss)$": "identity-obj-proxy"
},

resolver: undefined
};

3️⃣ jest.setup.js
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

globalThis.**VITE_ENV** = {
VITE_API_URL: "http://localhost:5000/api",
};

🌐 Handling import.meta.env in Jest

Jest cannot parse:

import.meta.env

To fix this, apiService.js uses a safe fallback:

let API_URL = "http://localhost:5000/api";

try {
const meta = eval("import.meta");
if (meta && meta.env?.VITE*API_URL) {
API_URL = meta.env.VITE_API_URL;
}
} catch (*) {
if (process.env.VITE_API_URL) {
API_URL = process.env.VITE_API_URL;
}
}

💡 This ensures:

Vite uses real environment variables

Jest never sees invalid syntax

Tests run reliably

🔥 Axios Mocking Strategy (Very Important)

Because apiService.js uses:

const api = axios.create({
baseURL: API_URL,
headers: { "Content-Type": "application/json" }
});

The test must mock axios.create() before importing the service:

In apiService.test.js:
jest.mock("axios", () => {
const mockPost = jest.fn();
const mockGet = jest.fn();

return {
create: jest.fn(() => ({
post: mockPost,
get: mockGet,
interceptors: {
request: { use: jest.fn() },
response: { use: jest.fn() },
},
})),
**mockPost: mockPost,
**mockGet: mockGet,
};
});

Then import:

import axios from "axios";
const mockPost = axios.**mockPost;
const mockGet = axios.**mockGet;

This ensures apiService.js uses the mocked axios instance, not the real axios library.

🧪 Running Tests
Run full test suite:
npm test

Clear Jest cache:
npx jest --clearCache

Run a specific test:
npm test -- apiService.test.js

Run tests in watch mode:
npm test -- --watch

📊 What Is Covered by Tests?
UI Tests

Component rendering

Simulated cell clicks

Game state rendering

Reset button

AI move triggers

Conditional rendering

API Tests

/game/new

/game/move

/game/ai-move

axios.create mocking

Request payload verification

Response shape verification

🚀 Development
Start dev server:
npm run dev

Build:
npm run build

📝 Notes & Recommendations
✔ Always mock axios before importing your service file
✔ Use eval("import.meta") ONLY for Jest compatibility
✔ Keep tests simple, pure, and isolated
✔ Never hit the real backend in Jest
✔ Follow identical response shape to your real API
