import { PDFDocument, PDFName, PDFString, PDFNumber, PDFBool, StandardFonts, rgb } from 'pdf-lib';
import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
  <main class="app-shell">
    <header class="topbar"><div class="brand"><span class="brand-mark">S</span><div><strong>SOC 报告封面生成器</strong><small>本地处理，文件不会上传</small></div></div></header>
    <section class="template-card template-card-only"><div class="template-card-head"><div><span class="eyebrow">FIXED TEMPLATE</span><h2>使用固定封面模板</h2><p>直接填写项目字段，生成可点击按钮的 PDF 报告。</p></div><span class="template-badge">已内置</span></div>
      <div class="template-form"><label>模板语言<select id="template-language"><option value="en">English</option><option value="zh">中文</option></select></label><label>客户 / 公司名称<input id="template-company" value="Airwallex (Singapore) Pte. Ltd." /></label><label>报告名称<input id="template-report" value="SOC 1 Type 2 Examination" /></label><label>系统名称<input id="template-system" value="Financial Infrastructure Platform System" /></label><label class="template-form-full">PDF 报告文件<input id="report-file" type="file" accept="application/pdf" /><span class="file-pill" id="report-file-name">未选择任何文件</span></label></div>
      <button class="primary template-download" id="download-template" type="button" disabled>生成最终 PDF</button>
    </section>
    <section class="document-panel" id="document-panel" hidden><div class="panel-head"><strong id="file-name"></strong><button class="secondary" id="remove-file" type="button">重新导入</button></div><div class="content-wrap"><div id="preview"></div></div></section>
    <div class="error" id="error" role="alert" hidden></div><footer>支持 Microsoft Word 文档格式 · 内容仅在浏览器本地解析</footer>
  </main>`;

const $ = (s) => document.querySelector(s);
const showError = (m) => { $('#error').textContent = m; $('#error').hidden = false; };
const hideError = () => { $('#error').hidden = true; };
const reportFile = $('#report-file'); const downloadTemplate = $('#download-template');
const updateReport = () => { const f = reportFile.files[0]; $('#report-file-name').textContent = f ? f.name : '未选择任何文件'; downloadTemplate.disabled = !f; };

async function createTemplateDownload() {
  const source = reportFile.files[0]; if (!source) throw new Error('请先选择 PDF 报告文件。');
  const url = $('#template-language').value === 'zh' ? '/templates/cover-template-zh.pdf' : '/templates/cover-template-en.pdf';
  const templateBytes = await fetch(url).then((r) => { if (!r.ok) throw new Error('固定模板 PDF 不存在。'); return r.arrayBuffer(); });
  const pdf = await PDFDocument.load(templateBytes); const cover = pdf.getPages()[1];
  const sourceBytes = new Uint8Array(await source.arrayBuffer()); const fileName = source.name || 'document-A.pdf';
  const embedded = pdf.context.register(pdf.context.flateStream(sourceBytes, { Type: PDFName.of('EmbeddedFile'), Subtype: PDFName.of('application#2Fpdf'), Params: pdf.context.obj({ Size: PDFNumber.of(sourceBytes.length) }) }));
  const spec = pdf.context.register(pdf.context.obj({ Type: PDFName.of('Filespec'), F: PDFString.of(fileName), UF: PDFString.of(fileName), EF: pdf.context.obj({ F: embedded }) }));
  const names = pdf.context.register(pdf.context.obj({ Names: pdf.context.obj([PDFString.of(fileName), spec]) }));
  pdf.catalog.set(PDFName.of('Names'), pdf.context.obj({ EmbeddedFiles: names }));
  const open = pdf.context.register(pdf.context.obj({ S: PDFName.of('Launch'), F: spec, NewWindow: PDFBool.True }));
  const close = pdf.context.register(pdf.context.obj({ S: PDFName.of('JavaScript'), JS: PDFString.of('this.closeDoc();') }));
  const isEnglish = $('#template-language').value === 'en';
  // Match the centered 5400-twip button table from the supplied Word template.
  const x = isEnglish ? [162.64, 297.64] : [180.6, 306.6];
  const y = isEnglish ? 420 : 553.92;
  const w = isEnglish ? 135 : 108;
  const h = isEnglish ? 29.04 : 31.32;
  if ($('#template-language').value === 'en') {
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    const colors = [rgb(1, 0.901, 0), rgb(0.145, 0.165, 0.204)];
    ['I Agree', 'Decline'].forEach((label, index) => {
      pdf.getPages()[1].drawRectangle({ x: x[index], y, width: w, height: h, color: colors[index] });
      const textWidth = font.widthOfTextAtSize(label, 11);
      pdf.getPages()[1].drawText(label, { x: x[index] + (w - textWidth) / 2, y: y + 9, size: 11, font, color: index ? rgb(1, 1, 1) : rgb(0.09, 0.09, 0.09) });
    });
  }
  const widget = (name, rect, action) => pdf.context.register(pdf.context.obj({ Type: PDFName.of('Annot'), Subtype: PDFName.of('Widget'), FT: PDFName.of('Btn'), Ff: PDFNumber.of(65536), T: PDFString.of(name), Rect: pdf.context.obj(rect.map(PDFNumber.of)), A: action, P: cover.ref, F: PDFNumber.of(4), H: PDFName.of('P') }));
  const a = widget('accept', [x[0], y, x[0] + w, y + h], open); const r = widget('reject', [x[1], y, x[1] + w, y + h], close);
  const annots = pdf.context.lookup(cover.node.get(PDFName.of('Annots'))) || pdf.context.obj([]); annots.push(a); annots.push(r); cover.node.set(PDFName.of('Annots'), annots); pdf.catalog.set(PDFName.of('AcroForm'), pdf.context.obj({ Fields: pdf.context.obj([a, r]), NeedAppearances: false }));
  const blob = new Blob([await pdf.save()], { type: 'application/pdf' }); const out = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = out; link.download = `${$('#template-language').value === 'zh' ? '中文' : '英文'}-最终报告.pdf`; link.click(); setTimeout(() => URL.revokeObjectURL(out), 1000);
}

reportFile.addEventListener('change', () => { updateReport(); hideError(); });
downloadTemplate.addEventListener('click', async () => { downloadTemplate.disabled = true; downloadTemplate.textContent = '正在生成...'; try { await createTemplateDownload(); downloadTemplate.textContent = '已下载 PDF'; hideError(); } catch (e) { showError(`PDF 生成失败：${e.message}`); downloadTemplate.textContent = '生成最终 PDF'; } finally { if (reportFile.files[0]) downloadTemplate.disabled = false; } });
updateReport();
