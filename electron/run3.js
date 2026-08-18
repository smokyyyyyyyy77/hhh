const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const LOG = '/tmp/soc_app_run3.log';
function log(msg){ fs.appendFileSync(LOG, msg + '\n'); }
app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1180, height: 900,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false },
  });
  win.webContents.on('console-message', (e) => {
    // 新版 API：事件对象携带 level/message/lineNumber/sourceId
    const { level, message, lineNumber, sourceId } = e;
    log(`[${level}] ${message} | line=${lineNumber} | source=${sourceId}`);
  });
  win.webContents.on('did-finish-load', () => {
    log('LOADED');
    setTimeout(() => app.exit(0), 4000);
  });
  win.loadFile(path.join(__dirname, 'app', '合规报告访问门户生成器.html'));
});
app.on('window-all-closed', () => app.exit(0));
