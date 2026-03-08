import { useState, useRef, useEffect, useCallback } from "react";
import { Music, X, Volume2, VolumeX, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface Track {
  label: string;
  emoji: string;
  url: string;
}

const TRACKS: Track[] = [
  { label: "Rain", emoji: "🌧️", url: "https://cdn.pixabay.com/audio/2022/05/13/audio_257112899f.mp3" },
  { label: "Café", emoji: "☕", url: "https://cdn.pixabay.com/audio/2024/11/04/audio_4956b1c0b1.mp3" },
  { label: "Forest", emoji: "🌿", url: "https://cdn.pixabay.com/audio/2022/02/07/audio_3e4cfab6fa.mp3" },
  { label: "Lo-fi", emoji: "🎵", url: "https://cdn.pixabay.com/audio/2024/09/10/audio_6e5b7595c1.mp3" },
  { label: "Fireplace", emoji: "🔥", url: "https://cdn.pixabay.com/audio/2024/03/18/audio_2a44950332.mp3" },
  { label: "Ocean", emoji: "🌊", url: "https://cdn.pixabay.com/audio/2022/04/27/audio_67dce6b5f8.mp3" },
];

type NoiseColor = "white" | "pink" | "brown";

interface NoiseOption {
  id: NoiseColor;
  label: string;
  emoji: string;
}

const NOISE_OPTIONS: NoiseOption[] = [
  { id: "white", label: "White", emoji: "⚪" },
  { id: "pink", label: "Pink", emoji: "🩷" },
  { id: "brown", label: "Brown", emoji: "🟤" },
];

function createColorNoise(ctx: AudioContext, type: NoiseColor): AudioBufferSourceNode {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === "white") {
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else if (type === "pink") {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  } else {
    // Brown noise
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

export function AmbientMusic() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const [activeNoise, setActiveNoise] = useState<NoiseColor | null>(null);
  const [volume, setVolume] = useState(40);
  const [spotifyUrl, setSpotifyUrl] = useState(() => localStorage.getItem("studyflow_spotify") ?? "");
  const [spotifyInput, setSpotifyInput] = useState("");
  const [showSpotify, setShowSpotify] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const noiseCtxRef = useRef<AudioContext | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Convert Spotify URL to embed URL
  const getSpotifyEmbedUrl = (url: string): string | null => {
    try {
      // Match open.spotify.com/playlist/ID, /track/ID, /album/ID, /episode/ID
      const match = url.match(/open\.spotify\.com\/(playlist|track|album|episode)\/([a-zA-Z0-9]+)/);
      if (match) return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
      return null;
    } catch {
      return null;
    }
  };

  const handleSpotifySave = () => {
    const trimmed = spotifyInput.trim();
    if (!trimmed) {
      setSpotifyUrl("");
      localStorage.removeItem("studyflow_spotify");
      return;
    }
    if (getSpotifyEmbedUrl(trimmed)) {
      setSpotifyUrl(trimmed);
      localStorage.setItem("studyflow_spotify", trimmed);
      setSpotifyInput("");
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
    if (noiseGainRef.current) {
      noiseGainRef.current.gain.value = volume / 100;
    }
  }, [volume]);

  const stopTrack = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlaying(null);
  }, []);

  const stopNoise = useCallback(() => {
    try { noiseSourceRef.current?.stop(); } catch {}
    noiseSourceRef.current = null;
    noiseGainRef.current = null;
    if (noiseCtxRef.current?.state !== "closed") {
      noiseCtxRef.current?.close();
    }
    noiseCtxRef.current = null;
    setActiveNoise(null);
  }, []);

  const playTrack = (url: string) => {
    stopNoise();
    if (playing === url) {
      stopTrack();
      return;
    }
    stopTrack();

    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = volume / 100;
    audio.play().catch(() => {});
    audioRef.current = audio;
    setPlaying(url);
  };

  const playNoise = (type: NoiseColor) => {
    stopTrack();
    if (activeNoise === type) {
      stopNoise();
      return;
    }
    stopNoise();

    try {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = volume / 100;
      gain.connect(ctx.destination);
      const source = createColorNoise(ctx, type);
      source.connect(gain);
      source.start();
      noiseCtxRef.current = ctx;
      noiseGainRef.current = gain;
      noiseSourceRef.current = source;
      setActiveNoise(type);
    } catch {}
  };

  const stopAll = () => {
    stopTrack();
    stopNoise();
  };

  const isAnythingPlaying = !!playing || !!activeNoise;

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      try { noiseSourceRef.current?.stop(); } catch {}
      if (noiseCtxRef.current?.state !== "closed") noiseCtxRef.current?.close();
    };
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        className={`h-9 w-9 rounded-full ${isAnythingPlaying ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        title="Ambient sounds"
      >
        <Music className="h-4 w-4" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-xs rounded-t-2xl sm:rounded-2xl border border-border bg-card p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Ambient Sounds</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-7 w-7 rounded-full">
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Sound tracks */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {TRACKS.map((track) => (
                <button
                  key={track.url}
                  onClick={() => playTrack(track.url)}
                  className={`flex flex-col items-center gap-1 rounded-xl p-3 transition-colors ${
                    playing === track.url
                      ? "bg-primary/10 border border-primary/30"
                      : "border border-border hover:bg-secondary"
                  }`}
                >
                  <span className="text-xl">{track.emoji}</span>
                  <span className="text-[10px] text-muted-foreground">{track.label}</span>
                </button>
              ))}
            </div>

            {/* Color noises */}
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Color Noise</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {NOISE_OPTIONS.map((noise) => (
                <button
                  key={noise.id}
                  onClick={() => playNoise(noise.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl p-3 transition-colors ${
                    activeNoise === noise.id
                      ? "bg-primary/10 border border-primary/30"
                      : "border border-border hover:bg-secondary"
                  }`}
                >
                  <span className="text-xl">{noise.emoji}</span>
                  <span className="text-[10px] text-muted-foreground">{noise.label}</span>
                </button>
              ))}
            </div>

            {/* Spotify embed */}
            <div className="mb-4">
              <button
                onClick={() => setShowSpotify((v) => !v)}
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground mb-2"
              >
                <Link className="h-3 w-3" />
                <span>Spotify Playlist</span>
              </button>

              {showSpotify && (
                <div className="space-y-2">
                  {!spotifyUrl ? (
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={spotifyInput}
                        onChange={(e) => setSpotifyInput(e.target.value.slice(0, 200))}
                        onKeyDown={(e) => e.key === "Enter" && handleSpotifySave()}
                        placeholder="Paste Spotify URL…"
                        className="flex-1 rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <Button
                        size="sm"
                        onClick={handleSpotifySave}
                        disabled={!spotifyInput.trim() || !getSpotifyEmbedUrl(spotifyInput.trim())}
                        className="h-7 rounded-lg px-2.5 text-[10px]"
                      >
                        Add
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <iframe
                        src={getSpotifyEmbedUrl(spotifyUrl) ?? ""}
                        width="100%"
                        height="152"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="rounded-xl"
                        title="Spotify Player"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSpotifyUrl("");
                          localStorage.removeItem("studyflow_spotify");
                        }}
                        className="w-full h-6 text-[10px] text-muted-foreground hover:text-destructive"
                      >
                        Remove playlist
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3">
              <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
              <Slider
                value={[volume]}
                onValueChange={([v]) => setVolume(v)}
                min={0}
                max={100}
                step={5}
                className="flex-1"
              />
              <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
            </div>

            {isAnythingPlaying && (
              <Button variant="outline" size="sm" onClick={stopAll} className="w-full mt-3 rounded-lg text-xs">
                Stop All
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
