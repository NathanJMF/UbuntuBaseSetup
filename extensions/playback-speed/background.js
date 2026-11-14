const speedKey = 'playbackSpeed';
const minimumSpeed = 0.25;
let pendingUpdate = Promise.resolve();

async function getRememberedSpeed() {
  const values = await chrome.storage.local.get(speedKey);
  return values[speedKey] ?? null;
}

async function publishSpeed(rate) {
  const tabs = await chrome.tabs.query({});
  await Promise.allSettled(tabs.map(tab =>
    chrome.tabs.sendMessage(tab.id, { type: 'speed-changed', rate })
  ));
}

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  const fromPopup = sender.url === chrome.runtime.getURL('popup.html');

  if (message?.type === 'remembered-speed' && (fromPopup || sender.tab?.id >= 0)) {
    pendingUpdate.then(getRememberedSpeed)
      .then(rate => respond({ rate }), () => respond(null));
    return true;
  }

  if (message?.type === 'change-speed' && fromPopup) {
    const { rate, step } = message;
    const isStep = step === -0.25 || step === 0.25;
    if (!isStep && (!Number.isFinite(rate) || rate < minimumSpeed)) return;

    const result = pendingUpdate.then(async () => {
      const currentRate = await getRememberedSpeed() ?? 1;
      const nextRate = isStep
        ? Math.max(minimumSpeed, Number((currentRate + step).toPrecision(15)))
        : rate;
      await chrome.storage.local.set({ [speedKey]: nextRate });
      // A tab may close or be unable to run content scripts.
      await publishSpeed(nextRate).catch(() => {});
      return { rate: nextRate };
    });

    pendingUpdate = result.catch(() => {});
    result.then(respond, () => respond(null));
    return true;
  }
});

async function downloadVideo(url) {
  let source;
  try {
    source = new URL(url);
  } catch {
    return false;
  }
  if (!['https:', 'http:'].includes(source.protocol) || /\.(m3u8|mpd)$/i.test(source.pathname)) {
    return false;
  }

  try {
    await chrome.downloads.download({ url: source.href, saveAs: true });
    return true;
  } catch {
    return false;
  }
}

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message?.type !== 'download-video' || sender.tab?.id == null) return;
  downloadVideo(message.source).then(respond);
  return true;
});

const downloadMenuId = 'download-direct-video';

chrome.runtime.onInstalled.addListener(async () => {
  // Remove the retired command if this profile still has its menu entry.
  await chrome.contextMenus.remove('open-video-in-player').catch(() => {});
  const options = {
    title: 'Download video',
    contexts: ['video'],
    targetUrlPatterns: ['http://*/*', 'https://*/*']
  };
  try {
    await chrome.contextMenus.update(downloadMenuId, options);
  } catch {
    chrome.contextMenus.create({ id: downloadMenuId, ...options });
  }
});

chrome.contextMenus.onClicked.addListener(info => {
  if (info.menuItemId === downloadMenuId) downloadVideo(info.srcUrl);
});
