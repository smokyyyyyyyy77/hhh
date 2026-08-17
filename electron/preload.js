/* 渲染进程安全桥：仅暴露"保存 PDF"能力 */
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('socAPI', {
  savePdf: (name, b64) => ipcRenderer.invoke('dialog:savePdf', name, b64),
  isDesktop: true,
});
