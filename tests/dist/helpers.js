"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.readSourceFile = readSourceFile;
exports.checkFileExists = checkFileExists;
exports.httpGet = httpGet;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
async function readSourceFile(relativePath) {
    const absolutePath = path.join(PROJECT_ROOT, relativePath);
    try {
        return await fs.readFile(absolutePath, 'utf8');
    }
    catch (error) {
        throw new Error(`Failed to read file ${relativePath}: ${error.message}`);
    }
}
async function checkFileExists(relativePath) {
    const absolutePath = path.join(PROJECT_ROOT, relativePath);
    try {
        await fs.access(absolutePath);
        return true;
    }
    catch {
        return false;
    }
}
async function httpGet(route) {
    const url = `http://localhost:3000${route}`;
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'E2E-Test-Runner',
            },
        });
        const body = await res.text();
        const headers = {};
        res.headers.forEach((val, key) => {
            headers[key] = val;
        });
        return {
            status: res.status,
            headers,
            body,
        };
    }
    catch (error) {
        throw new Error(`HTTP request failed for ${route}: ${error.message}. Is the Next.js server running on port 3000?`);
    }
}
