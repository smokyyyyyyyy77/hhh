const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const LOG = '/tmp/soc_app_run4.log';
function log(msg){ fs.appendFileSync(LOG, msg + '\n'); }
ipcMain.handle('dialog:savePdf', async () => true); // 测试时不弹窗

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1180, height: 900, show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false },
  });
  win.webContents.on('console-message', (e) => {
    if (e.level >= 3) log(`RENDERER-ERROR line=${e.lineNumber} src=${e.sourceId} msg=${String(e.message).slice(0,200)}`);
  });
  win.webContents.on('did-finish-load', async () => {
    log('LOADED OK');
    try {
      const res = await win.webContents.executeJavaScript(`(async () => {
        const out = { errors: [] };
        const chk = (name, cond) => { if (!cond) out.errors.push(name); };
        // 1. 关键函数存在
        chk('generateCoverPDF', typeof generateCoverPDF === 'function');
        chk('addStyledButtons', typeof addStyledButtons === 'function');
        chk('lockPdf', typeof lockPdf === 'function');
        chk('docxToText', typeof docxToText === 'function');
        chk('md5', typeof (window.md5mod && window.md5mod.rstrMD5) === 'function');
        chk('pako', typeof window.pako === 'object');
        // 2. 导入模板（真实 handleTemplateText 函数）
        handleTemplateText('[法律声明]\\n这是真实环境导入的法律声明。\\n[用户许可协议]\\n1. 同意条款\\n2. 保密义务', '测试.docx');
        const pv = document.getElementById('cover-preview').innerHTML;
        chk('preview-导入内容', pv.includes('这是真实环境导入的法律声明'));
        chk('preview-按钮', pv.includes('I Agree') && pv.includes('Decline'));
        // 3. 生成封面（jsPDF）
        const cover = generateCoverPDF();
        chk('封面PDF', cover && cover.byteLength > 0);
        // 4. 完整流程：pdf-lib + 按钮 + 上锁
        const doc = await window.PDFLib.PDFDocument.load(cover);
        const page = doc.getPage(doc.getPageCount() - 1);
        await addStyledButtons(doc, page, getBtnLayout());
        lockPdf(doc);
        const locked = await doc.save({ useObjectStreams: false });
        chk('锁定PDF', locked && locked.byteLength > 0);
        out.lockedBytes = locked.byteLength;
        // 5. 模拟报告上传 + OCG 合并
        const rep = new window.jspdf.jsPDF({unit:'pt',format:'a4'}); rep.text('REPORT',60,80);
        const repBytes = rep.output('arraybuffer');
        const doc2 = await window.PDFLib.PDFDocument.load(cover);
        const rep2 = await window.PDFLib.PDFDocument.load(repBytes);
        const pages = await doc2.copyPages(rep2, rep2.getPageIndices());
        pages.forEach(p => doc2.addPage(p));
        await hidePagesOCG(doc2, pages, 'ReportPages');
        const last = doc2.getPage(doc2.getPageCount() - 1);
        await addStyledButtons(doc2, last, getBtnLayout());
        lockPdf(doc2);
        const ocg = await doc2.save({ useObjectStreams: false });
        chk('OCG+锁定', ocg && ocg.byteLength > 0);
        out.ocgBytes = ocg.byteLength;
        return out;
      })()`);
      log('AUTOTEST=' + JSON.stringify(res));
    } catch (err) { log('AUTOTEST-ERR=' + err.message); }
    app.exit(0);
  });
  win.loadFile(path.join(__dirname, 'app', '合规报告访问门户生成器.html'));
});
app.on('window-all-closed', () => app.exit(0));
