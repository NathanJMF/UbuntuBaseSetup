# Ubuntu desktop setup

These profiles restore the bottom taskbar and Super-key search. They were captured from Dash to Panel 74 and ArcMenu 70.0 on GNOME 50.

Install compatible versions of Dash to Panel and ArcMenu before loading the profiles. From this directory, run these commands as the desktop user.

```sh
dconf load /org/gnome/shell/extensions/dash-to-panel/ < dash-to-panel.dconf
dconf load /org/gnome/shell/extensions/arcmenu/ < arcmenu.dconf
gnome-extensions disable ubuntu-dock@ubuntu.com
gnome-extensions enable dash-to-panel@jderose9.github.com
gnome-extensions enable arcmenu@arcmenu.com
```

The panel is 40 px high and full width. The app grid button is visible, matching the current desktop. The first three displays use matching layouts keyed by monitor index. ArcMenu opens a centred 650 px search field on the primary display when either Super key is pressed.

The empty-taskbar menu order is Terminal, Files, Resource Monitor, Show Desktop. To restore the built-in menu removals, use the included patch from the Dash to Panel extension directory. Run `patch --dry-run -p1 < /absolute/path/to/dash-to-panel-empty-menu.patch` before applying it with the same command without `--dry-run`. Log out and back in to load the patched extension code. The Resource Monitor entry requires a `resources-monitor` executable on the GNOME session’s PATH.

## Window snapping

The planned source for the custom keyboard snapping extension is [UbuntuWindowSnapping](https://github.com/NathanJMF/UbuntuWindowSnapping). Pin a revision when adding it to the installer.
