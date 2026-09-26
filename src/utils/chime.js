let sharedAudioContext = null;

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContextClass();
  }
  return sharedAudioContext;
}

// Plays a short two-note chime using the Web Audio API - no audio asset needed.
// Browsers block sound until the page has had some user gesture, so failures
// (blocked autoplay, no Web Audio support) are swallowed rather than surfaced.
export async function playChime() {
  try {
    const context = getAudioContext();
    if (!context) return;

    if (context.state === "suspended") {
      await context.resume();
    }

    const notes = [
      { frequency: 880, startOffset: 0 },
      { frequency: 660, startOffset: 0.15 },
    ];

    notes.forEach(({ frequency, startOffset }) => {
      const startTime = context.currentTime + startOffset;
      const duration = 0.18;

      const oscillator = context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;

      const gain = context.createGain();
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  } catch {
    // Autoplay blocked or Web Audio unavailable - notification sound is a
    // nice-to-have, never something worth surfacing an error for.
  }
}
