# 合规报告访问门户生成器

导入模板（Word/txt/md）-> 调整 I Agree / Decline 按钮样式 -> 生成封面 PDF（可内嵌并"上锁"正式报告）。

## 当前推荐分发方式
- Windows 轻量版：由 GitHub Actions 在 Windows runner 上自动构建 `合规报告访问门户生成器-轻量版.exe`
- 浏览器版：直接打开 `electron/app/合规报告访问门户生成器.html`
- 旧 Electron 版：仅保留历史参考，不再作为首选发布方式

## 项目结构
```text
soc-report-app/
|- electron/app/合规报告访问门户生成器.html
|- electron/app/libs/
|- electron/app/fonts/
|- light-launcher.py
|- light-launcher.spec
|- requirements-light-launcher.txt
|- .github/workflows/build-windows-light-exe.yml
|- 发布版/
`- 功能与设计说明.md
```

## 轻量版构建原理
`light-launcher.py` 会在启动时把网页资源同步到本地用户目录，然后用系统默认浏览器打开。
这样不用再捆绑 Electron/Chromium 运行时，包体会明显更小，启动也更快。

## GitHub Actions 自动构建
仓库推送到 `main` 后，会自动在 Windows runner 上执行：
1. 安装 Python 3.11
2. 安装 `requirements-light-launcher.txt` 中的依赖
3. 执行 `pyinstaller --noconfirm light-launcher.spec`
4. 上传 `合规报告访问门户生成器-轻量版.exe`

工作流文件：`.github/workflows/build-windows-light-exe.yml`

## 使用流程
1. 导入 `.docx` / `.txt` / `.md` 模板
2. 调整 I Agree / Decline 按钮样式、尺寸、位置
3. 生成封面 PDF，可选附带正式报告并进行权限限制

## 说明
- PDF 按钮点击动作仍建议用 Adobe Acrobat / Reader 验证
- 浏览器版保存使用浏览器下载
- 轻量启动器只负责分发和打开本地网页，不修改核心业务逻辑
