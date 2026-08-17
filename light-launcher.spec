# -*- mode: python ; coding: utf-8 -*-
from pathlib import Path

root = Path.cwd()
html_path = root / 'electron' / 'app' / '合规报告访问门户生成器.html'
libs_path = root / 'electron' / 'app' / 'libs'
fonts_path = root / 'electron' / 'app' / 'fonts'

datas = [
    (str(html_path), '.'),
    (str(libs_path), 'libs'),
    (str(fonts_path), 'fonts'),
]

block_cipher = None

a = Analysis(
    ['light-launcher.py'],
    pathex=[str(root)],
    binaries=[],
    datas=datas,
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)
exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='合规报告访问门户生成器-轻量版',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
