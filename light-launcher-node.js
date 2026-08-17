#!/usr/bin/env node
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const APP_NAME = '合规报告访问门户生成器';
const WEB_ITEMS = ['合规报告访问门户生成器.html', 'libs', 'fonts'];
const BASE_DIR = process.env.CAXA ? process.env.CAXA : __dirname;
const WEB_ROOT = fs.existsSync(path.join(BASE_DIR, 'electron', 'app'))
  ? path.join(BASE_DIR, 'electron', 'app')
  : BASE_DIR;

function appDataDir() {
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), APP_NAME, 'web');
  }
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', APP_NAME, 'web');
  }
  return path.join(process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share'), APP_NAME, 'web');
}

function sha256(file) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(file));
  return hash.digest('hex');
}

function sameFile(src, dest) {
  if (!fs.existsSync(dest)) return false;
  const srcStat = fs.statSync(src);
  const destStat = fs.statSync(dest);
  return srcStat.size === destStat.size && sha256(src) === sha256(dest);
}

function syncTree(src, dest) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    const wanted = new Set(fs.readdirSync(src));
    for (const child of wanted) {
      syncTree(path.join(src, child), path.join(dest, child));
    }
    for (const existing of fs.readdirSync(dest)) {
      if (!wanted.has(existing)) {
        fs.rmSync(path.join(dest, existing), { recursive: true, force: true });
      }
    }
    return;
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (sameFile(src, dest)) return;
  const tmp = dest + '.tmp';
  fs.copyFileSync(src, tmp);
  fs.renameSync(tmp, dest);
}

function openInBrowser(target) {
  const url = 'file://' + target.replace(/\\/g, '/');
  if (process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref();
    return;
  }
  if (process.platform === 'darwin') {
    spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
    return;
  }
  spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
}

function main() {
  const outDir = appDataDir();
  fs.mkdirSync(outDir, { recursive: true });
  for (const item of WEB_ITEMS) {
    syncTree(path.join(WEB_ROOT, item), path.join(outDir, item));
  }
  openInBrowser(path.join(outDir, '合规报告访问门户生成器.html'));
}

try {
  main();
} catch (err) {
  console.error('启动失败:', err && err.message ? err.message : err);
  process.exit(1);
}
