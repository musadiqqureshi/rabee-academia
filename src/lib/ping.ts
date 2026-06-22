// Short notification chime via the Web Audio API — no audio asset needed.
// A single shared AudioContext is reused and "unlocked" on the first user
// gesture (browsers block audio until the user interacts with the page).

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedCtx) {
    try { sharedCtx = new Ctx(); } catch { return null; }
  }
  return sharedCtx;
}

// Resume the audio context on the first interaction so later pings can play.
if (typeof window !== "undefined") {
  const unlock = () => {
    const ctx = getCtx();
    if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
  };
  ["pointerdown", "keydown", "touchstart"].forEach((evt) =>
    window.addEventListener(evt, unlock, { passive: true }),
  );
}

export function playPing() {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const t = ctx.currentTime;
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.setValueAtTime(1175, t + 0.1);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);

    osc.start(t);
    osc.stop(t + 0.42);
  } catch {
    // Ignore — autoplay policy, permissions, or unsupported environment.
  }
}
