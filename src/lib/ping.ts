// Best-effort short notification chime using the Web Audio API — no audio asset
// to ship and no autoplay file to host. Safe to call from any client component;
// it silently no-ops on the server or when the browser blocks audio (e.g. before
// the user has interacted with the page).
export function playPing() {
  if (typeof window === "undefined") return;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;

    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Two-tone "ding": brief rise then fade.
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1175, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

    osc.start();
    osc.stop(ctx.currentTime + 0.42);
    osc.onended = () => ctx.close().catch(() => {});
  } catch {
    // Ignore — autoplay policy, permissions, or unsupported environment.
  }
}
