/* 运行入口 v2：渲染进程控制台/错误写入文件，便于定位 bug */
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const LOG = '/tmp/soc_app_run.log';
function log(msg){ fs.appendFileSync(LOG, msg + '\n'); console.log(msg); }

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) { app.quit(); }

ipcMain.handle('dialog:savePdf', async (e, defaultName, base64) => {
  const r = await dialog.showSaveDialog({ defaultPath: defaultName, filters: [{ name: 'PDF 报告', extensions: ['pdf'] }] });
  if (r.canceled || !r.filePath) return false;
  fs.writeFileSync(r.filePath, Buffer.from(base64, 'base64'));
  return true;
});

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1180, height: 900,
    title: '合规报告访问门户生成器',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false },
  });
  win.removeMenu();
  win.webContents.on('console-message', (e, level, message, line, sourceId) => {
    const tag = level >= 3 ? '[ERROR]' : (level === 2 ? '[WARN ]' : '[LOG  ]');
    log(`RENDERER ${tag} ${message} @${line}`);
  });
  win.webContents.on('render-process-gone', (e, d) => log('RENDERER GONE: ' + JSON.stringify(d)));
  win.webContents.on('did-fail-load', (e, c, d) => log('LOAD FAIL: ' + c + ' ' + d));
  win.webContents.on('did-finish-load', async () => {
    log('APP LOADED OK');
    // 加载后自动做一次全流程自检（不弹保存框）：导入 docx → 生成封面 → 上锁
    const res = await win.webContents.executeJavaScript(`(async () => {
      const r = { errors: [] };
      try {
        // 1) 检查关键函数
        r.fns = { generateCoverPDF: typeof generateCoverPDF, addStyledButtons: typeof addStyledButtons, lockPdf: typeof lockPdf, docxToText: typeof docxToText, renderPreview: typeof renderPreview, md5: typeof window.md5mod?.rstrMD5 };
        // 2) 预览渲染
        renderPreview();
        r.previewOK = !!document.getElementById('cover-preview').innerHTML;
        // 3) 模拟导入 docx（用内置最小 docx 字节）
        const resp = await fetch('data:application/octet-stream;base64,UEsDBBQAAAAIAACeO1AAAAAAAAAAAAAAAAAAAAAA');
        // 无法用真实 docx，改用文本直接设置 state
        window.state.tplLegal = '这是法律声明，测试内容。';
        window.state.tplAgree = '1. 用户许可协议条款。\n2. 保密义务。';
        renderPreview();
        r.previewTextOK = document.getElementById('cover-preview').innerHTML.includes('这是法律声明');
        // 4) 生成封面（不锁，无报告）
        const bytes1 = generateCoverPDF();
        r.coverBytes = bytes1.byteLength;
        // 5) 生成完整流程（含按钮 + 上锁）
        const doc = await window.PDFLib.PDFDocument.load(bytes1);
        const page = doc.getPage(doc.getPageCount() - 1);
        await addStyledButtons(doc, page, getBtnLayout());
        lockPdf(doc);
        const bytes2 = await doc.save({ useObjectStreams: false });
        r.lockedBytes = bytes2.byteLength;
        r.lockedOK = bytes2.byteLength > 0;
      } catch (e) { r.errors.push(e.message + ' | ' + (e.stack||'').split('\\n')[1]); }
      return r;
    })()`);
    log('AUTOTEST=' + JSON.stringify(res));
  });
  win.loadFile(path.join(__dirname, 'app', '合规报告访问门户生成器.html'));
});
app.on('window-all-closed', () => app.exit(0));
