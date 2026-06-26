import * as fs from 'fs/promises';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '../..');

export async function readSourceFile(relativePath: string): Promise<string> {
  const absolutePath = path.join(PROJECT_ROOT, relativePath);
  try {
    return await fs.readFile(absolutePath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read file ${relativePath}: ${(error as Error).message}`);
  }
}

export async function checkFileExists(relativePath: string): Promise<boolean> {
  const absolutePath = path.join(PROJECT_ROOT, relativePath);
  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

export async function httpGet(route: string): Promise<{ status: number; headers: Record<string, string>; body: string }> {
  const url = `http://localhost:3000${route}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'E2E-Test-Runner',
      },
    });
    const body = await res.text();
    const headers: Record<string, string> = {};
    res.headers.forEach((val, key) => {
      headers[key] = val;
    });
    return {
      status: res.status,
      headers,
      body,
    };
  } catch (error) {
    throw new Error(`HTTP request failed for ${route}: ${(error as Error).message}. Is the Next.js server running on port 3000?`);
  }
}
