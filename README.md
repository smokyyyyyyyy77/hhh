# 合规报告访问门户生成器

内置 SOC1 披露函模板（或导入自定义模板）-> 填写字段 / 调整 I Agree / Decline 按钮样式 -> 生成封面 PDF（可内嵌并"上锁"正式报告）。

## 内置 SOC1 披露函模板
软件默认内置基于 EY/Airwallex SOC 1 Type 2 披露函提炼的模板，只需填写以下字段即可自动生成正文：
- 审计机构全称 / 简称
- 报告主体（客户公司）/ 简称
- 鉴证类型（如 SOC 1 Type 2）
- 被审系统描述
- 适用法律 / 管辖地
- 关联公司清单（可选，作为页脚注释）

也可以切换为「导入自定义模板」使用 `.docx` / `.txt` / `.md`，正文仍支持 `[法律声明]` / `[用户许可协议]` 分段。

## 按钮样式配置器

如果不方便用文字描述固定按钮样式，可直接打开 `按钮样式配置器.html`：
1. 调整 I Agree / Decline 的文字、字号、尺寸、颜色、边框、阴影、透明度和位置
2. 在右侧实时预览
3. 点击“下载 JSON 文件”或“复制 JSON”
4. 把导出的 JSON 发给我，我可以据此把按钮样式固定到正式软件中

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
1. 选择「内置 SOC1 披露函模板」并填写字段，或导入 `.docx` / `.txt` / `.md` 自定义模板
2. 调整 I Agree / Decline 按钮样式、尺寸、位置（实时预览）
3. 可选上传正式报告（.pdf）并生成封面 PDF（内嵌/隐藏页 + 上锁）

## 说明
- PDF 按钮点击动作仍建议用 Adobe Acrobat / Reader 验证
- 浏览器版保存使用浏览器下载
- 轻量启动器只负责分发和打开本地网页，不修改核心业务逻辑
