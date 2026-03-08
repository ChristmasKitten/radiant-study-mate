import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, CloudRain, Wind, Waves, Coffee, Trees, Radio } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface Sound {
  id: string;
  label: string;
  icon: React.ElementType;
  frequency: number; // Base frequency for oscillator
  type: OscillatorType;
}

const SOUNDS: Sound[] = [
  { id: "rain", label: "Rain", icon: CloudRain, frequency: 0, type: "sawtooth" },
  { id: "wind", label: "Wind", icon: Wind, frequency: 0, type: "sine" },
  { id: "waves", label: "Waves", icon: Waves, frequency: 0, type: "sine" },
  { id: "cafe", label: "Café", icon: Coffee, frequency: 0, type: "square" },
  { id: "forest", label: "Forest", icon: Trees, frequency: 0, type: "sine" },
  { id: "lofi", label: "Lo-Fi", icon: Radio, frequency: 0, type: "triangle" },
];

// Generate ambient noise using Web Audio API
function createNoiseGenerator(ctx: AudioContext, type: string): { node: AudioNode; stop: () => void } {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === "rain") {
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (Math.random() > 0.97 ? 0.8 : 0.15);
    }
  } else if (type === "wind") {
    let val = 0;
    for (let i = 0; i < bufferSize; i++) {
      val += (Math.random() * 2 - 1) * 0.02;
      val *= 0.998;
      data[i] = val * 3;
    }
  } else if (type === "waves") {
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      data[i] = Math.sin(t * 0.3) * 0.3 * (Math.random() * 0.4 + 0.6) + (Math.random() * 2 - 1) * 0.08;
    }
  } else if (type === "cafe") {
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.12 + Math.sin(i / 800) * 0.05;
    }
  } else if (type === "forest") {
    for (let i = 0; i < bufferSize; i++) {
      const bird = Math.random() > 0.999 ? Math.sin(i * 0.1) * 0.4 : 0;
      data[i] = (Math.random() * 2 - 1) * 0.06 + bird;
    }
  } else {
    // lofi - gentle hum
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      data[i] = (Math.sin(t * 220) * 0.03 + Math.sin(t * 330) * 0.02 + Math.sin(t * 440) * 0.01) + (Math.random() * 2 - 1) * 0.02;
    }
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = type === "rain" ? 3000 : type === "wind" ? 800 : 2000;

  source.connect(filter);
  source.start();

  return { node: filter, stop: () => source.stop() };
}

export function FocusSounds() {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(40);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const cleanup = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    gainRef.current = null;
    if (ctxRef.current?.state !== "closed") {
      ctxRef.current?.close();
    }
    ctxRef.current = null;
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume / 100;
    }
  }, [volume]);

  const toggleSound = (id: string) => {
    if (activeSound === id) {
      cleanup();
      setActiveSound(null);
      return;
    }

    cleanup();

    try {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = volume / 100;
      gain.connect(ctx.destination);

      const { node, stop } = createNoiseGenerator(ctx, id);
      node.connect(gain);

      ctxRef.current = ctx;
      gainRef.current = gain;
      stopRef.current = stop;
      setActiveSound(id);
    } catch {
      setActiveSound(null);
    }
  };

  return (
    <div className="rounded-xl bg-card border border-border p-4 w-full max-w-md">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Focus Sounds</p>
        {activeSound && (
          <div className="flex items-center gap-2 w-24">
            {volume === 0 ? (
              <VolumeX className="h-3 w-3 text-muted-foreground shrink-0" />
            ) : (
              <Volume2 className="h-3 w-3 text-primary shrink-0" />
            )}
            <Slider
              value={[volume]}
              onValueChange={([v]) => setVolume(v)}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        )}
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {SOUNDS.map((sound) => {
          const isActive = activeSound === sound.id;
          return (
            <motion.button
              key={sound.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleSound(sound.id)}
              className={`flex flex-col items-center gap-1.5 rounded-lg p-2 transition-colors ${
                isActive
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
              }`}
            >
              <sound.icon className="h-4 w-4" />
              <span className="text-[9px]">{sound.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
