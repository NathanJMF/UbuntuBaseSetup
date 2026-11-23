"""Preserve Nightfall's icon across a Keeper installation or connection repair."""

import fcntl
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
import tempfile


def regular_contents(path):
    if path.is_symlink() or not path.is_file():
        return None
    return path.read_bytes()


def replace_contents(path, data):
    mode = stat.S_IMODE(path.stat().st_mode)
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as stream:
        temporary = Path(stream.name)
        try:
            stream.write(data)
            stream.flush()
            os.fchmod(stream.fileno(), mode)
            os.replace(temporary, path)
        finally:
            temporary.unlink(missing_ok=True)


def managed_launcher(data, manifest):
    record = regular_contents(manifest)
    return (data is not None and record is not None
            and hashlib.sha256(data).hexdigest() == json.loads(record).get("launcher"))


def configure(keeper, installer):
    launcher = keeper.parent / "applications/io.github.keepassxcagentaccess.Tray.desktop"
    manifest = keeper / "installation.json"
    backup = keeper / ".ubuntu-base-nightfall-launcher"
    stock = b"\nIcon=dialog-password\n"
    nightfall = b"\nIcon=nightfall-keeper\n"

    # A blocked or interrupted upstream install can be retried on the next run.
    current = regular_contents(launcher)
    if installer and current and current.count(nightfall) == 1:
        original = current.replace(nightfall, stock)
        if managed_launcher(original, manifest):
            if not backup.exists():
                os.link(launcher, backup)
            if regular_contents(backup) != current:
                raise SystemExit("Keeper launcher backup differs from the current launcher.")
            replace_contents(launcher, original)

    try:
        if installer:
            subprocess.run([installer, "--connect-agent", "--no-launch"], check=True)
    finally:
        saved = regular_contents(backup)
        if saved is not None:
            current = regular_contents(launcher)
            if current == saved:
                backup.unlink()
            elif current is None and not launcher.is_symlink() and not launcher.exists():
                os.link(backup, launcher)
                backup.unlink()
            elif managed_launcher(current, manifest) and current.count(stock) == 1:
                replace_contents(launcher, current.replace(stock, nightfall))
                backup.unlink()
            else:
                print(f"Keeper launcher changed during setup. Saved Nightfall launcher: {backup}",
                      file=sys.stderr)


if __name__ == "__main__":
    keeper = Path(sys.argv[1])
    # Serialize the temporary icon change across concurrent base setup runs.
    keeper.mkdir(mode=0o700, parents=True, exist_ok=True)
    directory = os.open(keeper, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        fcntl.flock(directory, fcntl.LOCK_EX)
        configure(keeper, sys.argv[2])
    finally:
        os.close(directory)
