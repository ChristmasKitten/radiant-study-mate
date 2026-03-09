import { useState } from "react";
import { Music2, Youtube, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Platform = "youtube" | "spotify" | "apple_music";

const DEFAULT_EMBEDS: Record<Platform, string> = {
  youtube: "https://www.youtube.com/embed/jfKfPfyJRdk",
  spotify: "https://open.spotify.com/embed/playlist/37i9dQZF1DX8Uebhn9wzrS",
  apple_music: "https://embed.music.apple.com/us/playlist/lo-fi-chill/pl.u-V9D7v8GUB0v21xM",
};

function getYouTubeEmbedUrl(raw: string): string | null {
  try {
    const url = new URL(raw.trim());

    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (url.hostname.includes("youtube.com")) {
      const watchId = url.searchParams.get("v");
      if (watchId) return `https://www.youtube.com/embed/${watchId}`;

      const parts = url.pathname.split("/").filter(Boolean);
      const embedIndex = parts.findIndex((part) => part === "embed" || part === "shorts");
      if (embedIndex >= 0 && parts[embedIndex + 1]) {
        return `https://www.youtube.com/embed/${parts[embedIndex + 1]}`;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function getSpotifyEmbedUrl(raw: string): string | null {
  try {
    const url = new URL(raw.trim());
    if (!url.hostname.includes("spotify.com")) return null;

    const parts = url.pathname.split("/").filter(Boolean);
    const allowed = ["track", "playlist", "album", "episode", "show"];
    const contentType = parts.find((part) => allowed.includes(part));
    const id = contentType ? parts[parts.indexOf(contentType) + 1] : null;

    if (!contentType || !id) return null;
    return `https://open.spotify.com/embed/${contentType}/${id}`;
  } catch {
    return null;
  }
}

function getAppleMusicEmbedUrl(raw: string): string | null {
  try {
    const url = new URL(raw.trim());
    if (!url.hostname.includes("music.apple.com")) return null;
    
    // Replace "music.apple.com" with "embed.music.apple.com"
    return raw.trim().replace("music.apple.com", "embed.music.apple.com");
  } catch {
    return null;
  }
}

export function FocusMediaEmbed() {
  const [platform, setPlatform] = useState<Platform>("youtube");
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [embedUrls, setEmbedUrls] = useState<Record<Platform, string>>(DEFAULT_EMBEDS);

  const activeEmbed = embedUrls[platform];

  const handleLoad = () => {
    let next: string | null = null;
    if (platform === "youtube") next = getYouTubeEmbedUrl(urlInput);
    else if (platform === "spotify") next = getSpotifyEmbedUrl(urlInput);
    else if (platform === "apple_music") next = getAppleMusicEmbedUrl(urlInput);

    if (!next) {
      setError(`Use a valid ${platform === "youtube" ? "YouTube" : platform === "spotify" ? "Spotify" : "Apple Music"} link.`);
      return;
    }

    setEmbedUrls((prev) => ({ ...prev, [platform]: next }));
    setUrlInput("");
    setError(null);
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Music2 className="h-4 w-4 text-primary" />
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Focus Player</p>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant={platform === "youtube" ? "default" : "secondary"}
          size="sm"
          className="rounded-lg text-xs px-2"
          onClick={() => {
            setPlatform("youtube");
            setError(null);
          }}
        >
          <Youtube className="mr-1 h-3.5 w-3.5" />
          YouTube
        </Button>
        <Button
          type="button"
          variant={platform === "spotify" ? "default" : "secondary"}
          size="sm"
          className="rounded-lg text-xs px-2"
          onClick={() => {
            setPlatform("spotify");
            setError(null);
          }}
        >
          <Music2 className="mr-1 h-3.5 w-3.5" />
          Spotify
        </Button>
        <Button
          type="button"
          variant={platform === "apple_music" ? "default" : "secondary"}
          size="sm"
          className="rounded-lg text-xs px-2"
          onClick={() => {
            setPlatform("apple_music");
            setError(null);
          }}
        >
          <Music2 className="mr-1 h-3.5 w-3.5" />
          Apple
        </Button>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={platform === "youtube" ? "Paste YouTube URL" : "Paste Spotify URL"}
            className="pl-8"
          />
        </div>
        <Button type="button" size="sm" variant="outline" onClick={handleLoad}>
          Load
        </Button>
      </div>

      {error && <p className="mb-2 text-xs text-destructive">{error}</p>}

      <div className="overflow-hidden rounded-lg border border-border bg-secondary/40">
        <iframe
          key={`${platform}-${activeEmbed}`}
          src={activeEmbed}
          title={`Focus ${platform} player`}
          className="h-52 w-full"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
