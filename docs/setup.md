# Setup details

On a clean Ubuntu Desktop installation with GNOME Shell 50, open a terminal in a GNOME session and run this from a local checkout as the desktop user.

```sh
./setup
```

The command installs system dependencies through APT, bootstraps Nix if needed, builds the locked Home Manager configuration, and configures the desktop. Package installation may prompt for sudo. When using Ubuntu’s Nix package, setup adds the desktop user to the `nix-users` group for daemon access. The first run downloads dependencies and compiles Resources. Sign out and back in to load the GNOME extensions.

If Home Manager reports an existing extension directory at a managed path, move it to a backup before retrying. Test on a fresh Ubuntu installation or VM to start with a clean Chromium profile.

## What it installs and configures

| Feature | Source | Behaviour |
|---|---|---|
| Bottom taskbar | Dash to Panel 74 from GNOME Extensions and the included menu patch | Full-width, 40 px bottom bar with a centred clock and visible app grid button. The first three displays share the layout. Right-click empty space for Terminal, Files, Resource Monitor, and Show Desktop. |
| Search | ArcMenu 70.0 from GNOME Extensions | Either Super key opens centred search on the primary display. |
| Window snapping | Bundled UbuntuWindowSnapping revision `7afa4fb0d826c99bf60a9da0659132b23e94aff4` and Ubuntu Tiling Assistant | Super+Arrow snaps windows. Super+Shift+Arrow moves windows between monitors. Tiling Assistant handles mouse and numpad snapping. |
| Workspace, theme, and input | Ubuntu GNOME and Yaru | One workspace, Yaru Olive Dark with a green accent, a 24-hour clock with seconds and weekday, flat mouse acceleration, and two-finger touchpad scrolling. |
| New File | Nautilus templates | Right-click empty space and choose **New Document → New File**. |
| Area screenshots | Instant Area Screenshot revision `ab4a72ff77c31b56258e6588c3b375240bf37f4f` | Press Print Screen, drag an area, and release to capture it. |
| Resource Monitor | UbuntuResourceMonitor (see the [installer](../install-resources)) | Custom hardware views, textured process tables, and grayscale icon. Open from the taskbar menu or press Ctrl+Shift+Esc. |
| Chromium | Ubuntu Chromium Snap and bundled Video Playback Speed revision `93c7e7e47e6d8c5a2e2a2a669de2997982a0458a` | Files and Chromium are pinned in that order. Launch Chromium from the taskbar or app menu to load the bundled extension. |
| Password management | KeePassXC Snap and KeePassXCAgentAccess (see the [installer](../install-desktop-apps)) | Installs both KeePassXC and Keeper. Keeper installs its agent skill and launcher. |
| ChatGPT Desktop | OpenAI’s signed APT repository | Installs the official `chatgpt` Debian package on amd64. |
| Additional desktop apps | Bitwarden Snap and checksum-verified vendor installers | Installs Bitwarden, PIA and Antigravity desktop. Removes Firefox while retaining user data. |
| PyCharm Community | [JetBrains’ Community Snap](https://snapcraft.io/pycharm-community) | Installs `pycharm-community` from its stable channel. |
| Power menu | GNOME Session Manager | Restart, Log Out, and Power Off skip the standard confirmation countdown. |

Nixpkgs and Home Manager are pinned in `flake.lock`. The GNOME extension archives use pinned hashes. Each setup run checks the head of UbuntuResourceMonitor’s `main` branch and reuses the installed build when that commit is already present. Ubuntu system packages and the Chromium Snap follow the Ubuntu and Snap stable update channels.

## Keeper

Setup installs Keeper, its skill, and its local MCP runner with `--connect-agent --no-launch`. Approve Keeper’s one-time administrator prompt to create the dedicated runner and per-user socket. Setup registers the stdio command with Codex when its CLI is installed. It preserves existing `keeper` registrations. Restart an open Codex client and start a new chat to load a new registration. Other clients can use the command shown in **Keeper → Settings → Connect an Agent**.

On a desktop-only Keeper installation, setup uses Keeper’s existing update checkout to add the runner. An existing Nightfall icon is preserved automatically when it is the only change to Keeper’s recorded launcher. Keeper retains its usual checks for other launcher edits. For an existing legacy runner or separately managed broker, follow Keeper’s migration instructions before switching. Vault selection, resuming agent access, and credential approvals stay in Keeper.

## Idle screen lock

The screen blanks after 15 minutes. Automatic locking and idle suspend are disabled by default. To lock the screen when it blanks, run `./setup --lock-after-15-minutes`. Running `./setup` without the flag restores the default.

## Clean VM test

An earlier revision was validated on an Ubuntu 26.04.1 VM with GNOME Shell 50.1. The install completed, all five GNOME extensions were active after a new login, Resources launched from its desktop entry, and Chromium loaded the bundled extension in a fresh profile. Repeat runs applied both idle-lock modes and kept one Resource Monitor shortcut.

1. Install Ubuntu Desktop with GNOME Shell 50 and take a snapshot after the first login.
2. Run `./setup`, sign out, and sign back in.
3. Verify the taskbar and search, keyboard and mouse snapping, Print Screen capture, and the Files template.
4. Open Resources from both launchers and open Chromium from the panel. Open the playback extension and change the speed on a video.
5. Run `./setup` again and verify there are no duplicate shortcuts or extensions. Run once with `--lock-after-15-minutes` to test the opt-in screen lock.
