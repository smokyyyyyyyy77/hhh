/* 合规报告访问门户生成器 —— 启动器版主进程
 * 行为：双击 exe → 把网页版（HTML + 库 + 字体）解压到本地目录
 *      → 用系统默认浏览器打开网页版 → 立即退出（不留后台进程）
 * 网页版功能与桌面版一致（上锁、按钮、PDF 生成均为纯前端实现）。 */
const { app, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const VERSION = '1.0.4';
const isSmoke = process.argv.includes('--smoke');

function copyRecursive(src, dest){
  const st = fs.statSync(src);
  if (st.isDirectory()){
    fs.mkdirSync(dest, { recursive: true });
    for (const n of fs.readdirSync(src)) copyRecursive(path.join(src, n), path.join(dest, n));
  } else {
    fs.copyFileSync(src, dest);
  }
}
function extractWeb(){
  const outDir = path.join(app.getPath('userData'), 'web');
  const verFile = path.join(outDir, '.version');
  if (fs.existsSync(verFile) && fs.readFileSync(verFile, 'utf8') === VERSION) return outDir;
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  copyRecursive(path.join(__dirname, 'app'), outDir);
  fs.writeFileSync(verFile, VERSION);
  return outDir;
}

app.whenReady().then(async () => {
  const dir = extractWeb();
  const index = path.join(dir, '合规报告访问门户生成器.html');
  if (isSmoke){
    const ok = fs.existsSync(index) && fs.existsSync(path.join(dir, 'libs', 'md5.js')) && fs.existsSync(path.join(dir, 'fonts', 'font.js'));
    console.log('SMOKE_RESULT=' + JSON.stringify({ extracted: ok, dir }));
    app.exit(0);
    return;
  }
  const err = await shell.openPath(index);
  if (err) console.error('打开网页版失败:', err);
  app.exit(0);
});

app.on('window-all-closed', () => app.exit(0));
