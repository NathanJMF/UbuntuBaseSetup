const status = document.querySelector('#status');
const speed = document.querySelector('#speed');
const [slower, faster] = document.querySelectorAll('[data-step]');
const presets = document.querySelectorAll('[data-rate]');
const reset = document.querySelector('#reset');
const minimumSpeed = 0.25;

function showRate(rate) {
  speed.textContent = `${rate}×`;
  slower.disabled = rate <= minimumSpeed;
  for (const button of presets) {
    button.setAttribute('aria-pressed', String(Number(button.dataset.rate) === rate));
  }
}

async function update(change = null) {
  const request = change ? { type: 'change-speed', ...change } : { type: 'remembered-speed' };
  try {
    const result = await chrome.runtime.sendMessage(request);
    if (!result) throw new Error('Unable to read playback speed');
    showRate(result.rate ?? 1);
    status.textContent = 'Applies across tabs';
  } catch {
    status.textContent = change ? 'Could not save the speed.' : 'Could not read the saved speed.';
  }
}

for (const button of [slower, faster]) {
  button.addEventListener('click', () => update({ step: Number(button.dataset.step) }));
}
for (const button of presets) {
  button.addEventListener('click', () => update({ rate: Number(button.dataset.rate) }));
}
reset.addEventListener('click', () => update({ rate: 1 }));
update();
