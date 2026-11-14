{ lib, pkgs, ... }:

let
  shellExtension = { uuid, archiveId, sha256, patches ? [] }:
    pkgs.stdenvNoCC.mkDerivation {
      pname = builtins.replaceStrings [ "@" ] [ "-" ] uuid;
      version = archiveId;
      src = pkgs.fetchurl {
        url = "https://extensions.gnome.org/download-extension/${uuid}.shell-extension.zip?version_tag=${archiveId}";
        inherit sha256;
      };
      nativeBuildInputs = [ pkgs.unzip pkgs.glib ];
      unpackPhase = ''
        unzip -q "$src"
      '';
      inherit patches;
      installPhase = ''
        runHook preInstall
        glib-compile-schemas --strict schemas
        mkdir -p "$out"
        cp -R . "$out/"
        runHook postInstall
      '';
    };
  screenshotArchive = pkgs.fetchurl {
    url = "https://codeload.github.com/todomagichere/gnome-instant-area-screenshot/tar.gz/ab4a72ff77c31b56258e6588c3b375240bf37f4f";
    name = "instant-area-screenshot.tar.gz";
    sha256 = "8d9cf0d30cbcdc266643173dad6d74bd8a6d2f79a2de9552361f230e6ad19199";
  };
  screenshot = pkgs.runCommand "instant-area-screenshot-extension" {} ''
    mkdir -p "$out"
    tar -xzf ${screenshotArchive} --strip-components=2 -C "$out" --wildcards '*/instant-area-screenshot@todomagichere/*'
  '';
  keyboardSnapping = pkgs.runCommand "keyboard-snapping-extension" {
    nativeBuildInputs = [ pkgs.glib ];
  } ''
    mkdir -p "$out/schemas"
    cp ${./extensions/keyboard-snapping}/*.js ${./extensions/keyboard-snapping}/metadata.json "$out/"
    cp ${./extensions/keyboard-snapping}/schemas/*.xml "$out/schemas/"
    glib-compile-schemas --strict "$out/schemas"
  '';
in
{
  home.username = builtins.getEnv "USER";
  home.homeDirectory = builtins.getEnv "HOME";
  home.stateVersion = "26.05";

  xdg.dataFile = {
    "gnome-shell/extensions/keyboard-monitor-snap@local".source = keyboardSnapping;
    "gnome-shell/extensions/instant-area-screenshot@todomagichere".source = screenshot;
    "gnome-shell/extensions/dash-to-panel@jderose9.github.com".source = shellExtension {
      uuid = "dash-to-panel@jderose9.github.com";
      archiveId = "75054";
      sha256 = "8989c892f9795948e4490f47dc092218e42d771a6fec3dd44431cb48700ac2e5";
      patches = [ ./dash-to-panel-empty-menu.patch ];
    };
    "gnome-shell/extensions/arcmenu@arcmenu.com".source = shellExtension {
      uuid = "arcmenu@arcmenu.com";
      archiveId = "75483";
      sha256 = "ef414c90dcb5f2b0c6ccb5f8e59fd9963c584789d3d8d26740ddb731100c4b40";
    };
  };

  home.activation.desktopSettings = lib.hm.dag.entryAfter [ "linkGeneration" ] ''
    run /bin/sh ${./apply-desktop-settings} ${./dash-to-panel.dconf} ${./arcmenu.dconf}
  '';
}
