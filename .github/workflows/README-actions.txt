GitHub Actions 说明
===================

主工作流：build-windows-light-exe.yml

用途：
- 在 Windows runner 上构建真正的 Windows 可执行文件
- 上传 Actions artifact
- 在 release 发布时附加 EXE 和使用说明

关键产物：
- dist/合规报告访问门户生成器-轻量版.exe
- release/合规报告访问门户生成器-轻量版.exe
- release/使用说明.txt
