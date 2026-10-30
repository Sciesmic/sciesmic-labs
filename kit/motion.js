// Animation time excludes time spent in a background tab. Science models never use this clock.
const media = matchMedia('(prefers-reduced-motion: reduce)');
const storageKey = 'sciesmic-labs-motion';
let preference = null;
try { const saved = localStorage.getItem(storageKey); if (['reduce', 'full'].includes(saved)) preference = saved; } catch { /* optional storage */ }
const fromURL = new URLSearchParams(location.search).get('motion');
if (['reduce', 'full'].includes(fromURL)) preference = fromURL;
const listeners = new Set();
export const motionPreference = {
  get matches() { return preference ? preference === 'reduce' : media.matches; },
  addEventListener(type, fn) { if (type === 'change') listeners.add(fn); },
  removeEventListener(type, fn) { if (type === 'change') listeners.delete(fn); },
};
function notify() {
  document.documentElement.dataset.motion = motionPreference.matches ? 'reduce' : 'full';
  listeners.forEach(fn => fn({matches: motionPreference.matches}));
}
export function setReducedMotion(reduced) {
  preference = reduced ? 'reduce' : 'full';
  try { localStorage.setItem(storageKey, preference); } catch { /* optional storage */ }
  const url = new URL(location.href);
  if (url.searchParams.has('motion')) { url.searchParams.set('motion', preference); history.replaceState(null, '', url); }
  notify();
}
media.addEventListener('change', notify);
notify();
let hiddenAt = document.hidden ? performance.now() : null, hiddenTime = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden && hiddenAt === null) hiddenAt = performance.now();
  else if (!document.hidden && hiddenAt !== null) { hiddenTime += performance.now() - hiddenAt; hiddenAt = null; }
});
export function animationNow() { return (hiddenAt ?? performance.now()) - hiddenTime; }
export function animationFrame(callback) {
  // The returned handle remains a native RAF id, compatible with cancelAnimationFrame.
  return requestAnimationFrame(() => callback(animationNow()));
}
export function animationInterval(callback, milliseconds) {
  return setInterval(() => { if (!document.hidden) callback(); }, milliseconds);
}
export function animationWait(milliseconds) {
  return new Promise(resolve => {
    const start = animationNow();
    const tick = () => { if (!document.hidden && animationNow() - start >= milliseconds) resolve(); else animationFrame(tick); };
    animationFrame(tick);
  });
}
