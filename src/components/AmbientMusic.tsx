import { useState, useRef, useEffect } from "react";
import { Music, X, Volume2, VolumeX } from "lucide-react";
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

export function AmbientMusic() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const [volume, setVolume] = useState(40);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const playTrack = (url: string) => {
    if (playing === url) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = volume / 100;
    audio.play().catch(() => {});
    audioRef.current = audio;
    setPlaying(url);
  };

  const stopAll = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlaying(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        className={`h-9 w-9 rounded-full ${playing ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
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

            <div className="grid grid-cols-3 gap-2 mb-4">
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

            {playing && (
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
