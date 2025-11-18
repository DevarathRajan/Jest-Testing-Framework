import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Correct import.meta.env mock for Vite
globalThis.importMeta = {
  env: {
    VITE_API_URL: "http://localhost:5000/api",
  },
};

// Make it accessible the same way React sees it
global.importMeta = globalThis.importMeta;

globalThis.import = globalThis.import || {};
