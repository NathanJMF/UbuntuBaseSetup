(() => {
  try {
    // Match the popup's scope by skipping frames behind a cross-origin boundary.
    for (let frame = window; frame !== frame.top; frame = frame.parent) {
      if (!frame.parent.document) return;
    }
  } catch {
    return;
  }

  let lookup;
  let revision = 0;
  function getRememberedSpeed() {
    if (!lookup) {
      lookup = chrome.runtime.sendMessage({ type: 'remembered-speed' })
        .then(response => response?.rate ?? null)
        .catch(() => null)
        .finally(() => { lookup = null; });
    }
    return lookup;
  }

  async function restore(videos) {
    const startingRevision = revision;
    const rates = videos.map(video => video.playbackRate);
    const rememberedRate = await getRememberedSpeed();
    if (rememberedRate === null || startingRevision !== revision) return;

    for (const [index, video] of videos.entries()) {
      if (video.playbackRate === rates[index]) applySpeed(video, rememberedRate);
    }
  }

  function applySpeed(video, rate) {
    if (!video.isConnected || video.playbackRate === rate) return;
    try {
      video.playbackRate = rate;
    } catch {
      // A browser or player can reject a remembered rate.
    }
  }

  chrome.runtime.onMessage.addListener(message => {
    if (message?.type !== 'speed-changed') return;
    revision += 1;
    for (const video of document.querySelectorAll('video')) {
      applySpeed(video, message.rate);
    }
  });

  function restorePage() {
    const videos = [...document.querySelectorAll('video')];
    if (videos.length) restore(videos);
  }

  function restoreVideo(event) {
    if (event.target instanceof HTMLVideoElement) restore([event.target]);
  }

  document.addEventListener('loadedmetadata', restoreVideo, true);
  document.addEventListener('play', restoreVideo, true);
  // Players can reset the rate after playback starts, including on in-page navigation.
  document.addEventListener('ratechange', restoreVideo, true);
  document.addEventListener('DOMContentLoaded', restorePage, { once: true });
  window.addEventListener('pageshow', event => {
    if (event.persisted) restorePage();
  });
})();
