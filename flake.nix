{
  description = "Reproducible Ubuntu GNOME desktop settings";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/f1e5c356f35d07e7b71a6b5e6c9338e0b029e0c0";
    home-manager.url = "github:nix-community/home-manager/6eb2d33d1d0c95a37ef6443c88e6c1686012ee8b";
    home-manager.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = { nixpkgs, home-manager, ... }: {
    homeConfigurations.desktop = home-manager.lib.homeManagerConfiguration {
      pkgs = nixpkgs.legacyPackages.${builtins.currentSystem};
      modules = [ ./desktop.nix ];
    };
  };
}
