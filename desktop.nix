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
in
{
  home.username = builtins.getEnv "USER";
  home.homeDirectory = builtins.getEnv "HOME";
  home.stateVersion = "26.05";

  xdg.dataFile = {
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
