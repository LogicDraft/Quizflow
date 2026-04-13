import { useCallback, useRef } from "react";

export function useSound() {
  const ctxRef = useRef(null);
  const mutedRef = useRef(false);

  function ctx() {
    if (!ctxRef.current)
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctxRef.current;
  }

  function tone(freq, dur, type = "sine", vol = 0.28, delay = 0) {
    if (mutedRef.current) return;
    try {
      const c = ctx();
      const o = c.createOscillator();
      const g = c.createGain();
      const t = c.currentTime + delay;
      o.connect(g); g.connect(c.destination);
      o.type = type; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.start(t); o.stop(t + dur + 0.05);
    } catch {}
  }

  function chord(freqs, dur, type, vol, delay) {
    freqs.forEach(f => tone(f, dur, type, vol, delay));
  }

  const playCorrect = useCallback(() => {
    tone(523,0.12,"sine",0.3,0); tone(659,0.12,"sine",0.28,0.08);
    tone(784,0.12,"sine",0.28,0.16); tone(1047,0.3,"sine",0.25,0.24);
    tone(2093,0.2,"sine",0.08,0.24);
    chord([784,987,1175],0.3,"sine",0.1,0.24);
  }, []);

  const playWrong = useCallback(() => {
    tone(311,0.18,"sawtooth",0.22,0); tone(277,0.35,"sawtooth",0.18,0.12);
    tone(80,0.3,"sine",0.2,0.05);
  }, []);

  const playTick  = useCallback(() => tone(1200,0.04,"square",0.1,0), []);
  const playUrgent= useCallback(() => { tone(1400,0.06,"square",0.2,0); tone(1000,0.06,"square",0.1,0.07); }, []);

  const playStart = useCallback(() => {
    [[262,0],[330,0.07],[392,0.14],[523,0.21],[659,0.3],[784,0.38],[1047,0.48]]
      .forEach(([f,d]) => tone(f,0.18,"sine",0.25,d));
    tone(60,0.15,"sine",0.5,0); tone(60,0.15,"sine",0.5,0.5);
  }, []);

  const playVictory = useCallback(() => {
    [[523,0],[659,0.1],[784,0.2],[1047,0.32],[880,0.5],[988,0.62],[1175,0.76],[1047,0.94]]
      .forEach(([f,d]) => tone(f,0.22,"sine",0.28,d));
    chord([262,330,392],0.8,"sine",0.08,0.5);
    chord([330,415,494],0.8,"sine",0.08,1.0);
  }, []);

  const playJoin = useCallback(() => {
    tone(880,0.08,"sine",0.18,0); tone(1108,0.12,"sine",0.18,0.08);
  }, []);

  const playCountdown = useCallback((n) => {
    if (n > 0) { tone(660,0.15,"sine",0.35,0); tone(660,0.08,"sine",0.15,0.18); }
    else { chord([523,659,784],0.4,"sine",0.3,0); tone(1047,0.5,"sine",0.3,0.1); }
  }, []);

  const setMuted = useCallback((v) => { mutedRef.current = v; }, []);
  const isMuted  = () => mutedRef.current;

  const lobbyIntervalRef = useRef(null);

  const playLobbyMusic = useCallback(() => {
    if (lobbyIntervalRef.current) return;
    
    function playProgression() {
      if (mutedRef.current) return;
      chord([262,392,523], 4.5, "sine", 0.04, 0);       // C maj pad
      chord([293,440,587], 4.5, "sine", 0.03, 4);       // D min pad
      chord([330,493,659], 4.5, "sine", 0.03, 8);       // E min pad
      chord([262,392,523], 4.5, "sine", 0.04, 12);      // C maj pad
    }
    
    playProgression();
    lobbyIntervalRef.current = setInterval(playProgression, 16000);
  }, []);

  const stopLobbyMusic = useCallback(() => {
    if (lobbyIntervalRef.current) {
      clearInterval(lobbyIntervalRef.current);
      lobbyIntervalRef.current = null;
    }
  }, []);

  return { playCorrect, playWrong, playTick, playUrgent, playStart, playVictory, playJoin, playCountdown, setMuted, isMuted, playLobbyMusic, stopLobbyMusic };
}
