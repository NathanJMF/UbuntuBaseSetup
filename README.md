# Ubuntu desktop setup

From a local checkout on Ubuntu Desktop with GNOME Shell 50, run this in a terminal as the desktop user.

```sh
./setup
```

The command installs Ubuntu dependencies and Nix through APT when needed, builds the locked Home Manager configuration, installs Dash to Panel and ArcMenu, and applies their settings. APT may prompt for sudo. Sign out and back in to load the extensions. If Home Manager reports an existing extension directory at a managed path, move that directory to a backup before retrying.

## Bottom taskbar and search

Dash to Panel 74 provides a full-width 40 px bottom bar with a centred clock and visible app grid button. The first three displays share the same layout. The included patch customises the empty-taskbar menu. Its Resource Monitor entry appears once a `resources-monitor` executable is available on the GNOME session’s PATH.

ArcMenu 70.0 opens a centred 650 px search field on the primary display when either Super key is pressed. Both extension archives are fetched from GNOME Extensions and checked against pinned SHA-256 hashes. Nixpkgs and Home Manager are pinned in `flake.lock`.

## Remaining components

Window snapping, the custom Resources launcher, fresh Chromium with the playback-speed extension, and the remaining desktop preferences are planned for later setup stages. The planned source for the custom keyboard snapping extension is [UbuntuWindowSnapping](https://github.com/NathanJMF/UbuntuWindowSnapping).
