(() => {
  const doubleClickInterval = 600;
  let menu;
  let lastClick;

  function closeMenu() {
    menu?.remove();
    menu = null;
  }

  function findVideo(event) {
    const clickedVideo = event.composedPath().find(node => node instanceof HTMLVideoElement);
    if (clickedVideo) return clickedVideo;

    const { clientX: x, clientY: y } = event;
    return document.elementsFromPoint(x, y).find(node => node instanceof HTMLVideoElement)
      ?? [...document.querySelectorAll('video')].find(video => {
        if (!video.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
        const bounds = video.getBoundingClientRect();
        return bounds.width > 0 && bounds.height > 0 &&
          x >= bounds.left && x < bounds.right && y >= bounds.top && y < bounds.bottom;
      });
  }

  function showMenu(event, source) {
    closeMenu();
    const button = document.createElement('button');
    button.id = 'video-playback-speed-context-button';
    button.type = 'button';
    let directSource = false;
    try {
      const url = new URL(source);
      directSource = ['https:', 'http:'].includes(url.protocol) && !/\.(m3u8|mpd)$/i.test(url.pathname);
    } catch {
      // The player may not expose a media URL.
    }
    button.textContent = directSource ? 'Download video' : 'No direct video file available';
    button.disabled = !directSource;
    button.popover = 'manual';
    button.addEventListener('click', async click => {
      if (!click.isTrusted) return;
      button.disabled = true;
      try {
        const started = await chrome.runtime.sendMessage({ type: 'download-video', source });
        if (!started) throw new Error('Download did not start');
        if (menu === button) closeMenu();
      } catch {
        button.textContent = 'Download did not start';
      }
    });

    document.documentElement.append(button);
    menu = button;
    button.showPopover();
    const x = Math.max(0, Math.min(event.clientX, innerWidth - button.offsetWidth));
    const y = Math.max(0, Math.min(event.clientY, innerHeight - button.offsetHeight));
    button.style.left = `${x}px`;
    button.style.top = `${y}px`;
    button.focus({ preventScroll: true });
  }

  window.addEventListener('contextmenu', event => {
    if (!event.isTrusted) return;
    closeMenu();
    const previous = lastClick;
    lastClick = null;
    if (event.button !== 2 || event.shiftKey) return;

    const video = findVideo(event);
    if (!video) return;

    const source = video.currentSrc || video.src;
    if (previous?.video === video && previous.source === source &&
        event.timeStamp - previous.time <= doubleClickInterval) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showMenu(event, source);
    } else {
      lastClick = { video, source, time: event.timeStamp };
    }
  }, true);

  window.addEventListener('pointerdown', event => {
    if (event.button !== 2) lastClick = null;
    if (menu && !event.composedPath().includes(menu)) closeMenu();
  }, true);
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  }, true);
  window.addEventListener('scroll', closeMenu, true);
})();
