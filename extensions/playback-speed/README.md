# Video Playback Speed

A Chromium extension that sets one playback speed for HTML videos across tabs.

## Install from source

1. Open `chrome://extensions` in Chromium.
2. Turn on **Developer mode**.
3. Choose **Load unpacked** and select the folder containing `manifest.json`.
4. From any tab, open **Video Playback Speed** from the Extensions menu. Pick a preset or use **−** and **+** to adjust the speed in 0.25× steps. Use **Reset** to return to 1×. A speed you set applies to supported videos across all tabs and is remembered when Chromium closes.

Choose **Download video** from Chromium’s regular video context menu to open Save As. On custom players that pass both clicks to the page, a quick double right-click also shows the download option. This works with direct video files.

See the [project notes](../../Documentation/video-playback-speed.md) for scope and a manual test checklist.
