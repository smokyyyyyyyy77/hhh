#!/usr/bin/env python3
import hashlib
import os
import shutil
import sys
import webbrowser
from pathlib import Path

APP_NAME = "合规报告访问门户生成器"
ROOT = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent))
WEB_ROOT = ROOT / "electron" / "app" if (ROOT / "electron" / "app").exists() else ROOT
WEB_ITEMS = [
    "合规报告访问门户生成器.html",
    "libs",
    "fonts",
]


def app_data_dir() -> Path:
    if sys.platform == "win32":
        base = Path(os.environ.get("APPDATA", Path.home() / "AppData" / "Roaming"))
    elif sys.platform == "darwin":
        base = Path.home() / "Library" / "Application Support"
    else:
        base = Path(os.environ.get("XDG_DATA_HOME", Path.home() / ".local" / "share"))
    return base / APP_NAME / "web"


def file_sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def same_file(src: Path, dest: Path) -> bool:
    return dest.exists() and src.stat().st_size == dest.stat().st_size and file_sha256(src) == file_sha256(dest)


def sync_tree(src: Path, dest: Path) -> None:
    if src.is_dir():
        dest.mkdir(parents=True, exist_ok=True)
        for child in src.iterdir():
            sync_tree(child, dest / child.name)
        existing = {p.name for p in dest.iterdir()}
        wanted = {p.name for p in src.iterdir()}
        for extra in existing - wanted:
            target = dest / extra
            if target.is_dir():
                shutil.rmtree(target)
            else:
                target.unlink()
        return

    dest.parent.mkdir(parents=True, exist_ok=True)
    if same_file(src, dest):
        return
    tmp = dest.with_suffix(dest.suffix + ".tmp")
    shutil.copy2(src, tmp)
    os.replace(tmp, dest)


def extract_web() -> Path:
    out_dir = app_data_dir()
    out_dir.mkdir(parents=True, exist_ok=True)
    for item in WEB_ITEMS:
        sync_tree(WEB_ROOT / item, out_dir / item)
    return out_dir


def main() -> int:
    try:
        out_dir = extract_web()
        index = out_dir / "合规报告访问门户生成器.html"
        webbrowser.open(index.resolve().as_uri())
        return 0
    except Exception as exc:
        if sys.platform == "win32":
            try:
                import ctypes
                ctypes.windll.user32.MessageBoxW(None, f"启动失败：{exc}", APP_NAME, 0x10)
            except Exception:
                pass
        print(f"启动失败: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
