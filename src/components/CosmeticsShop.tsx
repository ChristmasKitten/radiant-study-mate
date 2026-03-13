import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Lock, Check, Sparkles } from "lucide-react";
import { useGamificationContext } from "@/contexts/GamificationContext";
import { fireItemUnlock } from "@/lib/celebrations";
import { toast } from "@/hooks/use-toast";

type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

interface ShopItem {
  id: string;
  category: string;
  name: string;
  emoji: string;
  cost: number;
  rarity: Rarity;
}

const RARITY_CONFIG: Record<Rarity, { label: string; color: string; border: string; bg: string }> = {
  common: { label: "Common", color: "text-muted-foreground", border: "border-border", bg: "bg-card" },
  uncommon: { label: "Uncommon", color: "text-green-500", border: "border-green-500/40", bg: "bg-green-500/5" },
  rare: { label: "Rare", color: "text-blue-500", border: "border-blue-500/40", bg: "bg-blue-500/5" },
  epic: { label: "Epic", color: "text-purple-500", border: "border-purple-500/40", bg: "bg-purple-500/5" },
  legendary: { label: "Legendary", color: "text-amber-500", border: "border-amber-500/40", bg: "bg-amber-500/5" },
};

export const SHOP_ITEMS: ShopItem[] = [
  // Cat Hats
  { id: "cat_hat_party", category: "cat_hat", name: "Party Hat", emoji: "🥳", cost: 100, rarity: "common" },
  { id: "cat_hat_tophat", category: "cat_hat", name: "Top Hat", emoji: "🎩", cost: 200, rarity: "uncommon" },
  { id: "cat_hat_wizard", category: "cat_hat", name: "Wizard Hat", emoji: "🧙", cost: 350, rarity: "rare" },
  { id: "cat_hat_crown", category: "cat_hat", name: "Crown", emoji: "👑", cost: 800, rarity: "epic" },
  { id: "cat_hat_halo", category: "cat_hat", name: "Halo", emoji: "😇", cost: 1500, rarity: "legendary" },
  { id: "cat_hat_helmet", category: "cat_hat", name: "Knight Helm", emoji: "⛑️", cost: 400, rarity: "rare" },

  // Cat Accessories
  { id: "cat_glasses_cool", category: "cat_accessory", name: "Cool Glasses", emoji: "🕶️", cost: 150, rarity: "common" },
  { id: "cat_bowtie", category: "cat_accessory", name: "Bowtie", emoji: "👔", cost: 120, rarity: "common" },
  { id: "cat_scarf", category: "cat_accessory", name: "Scarf", emoji: "🧣", cost: 180, rarity: "uncommon" },
  { id: "cat_cape", category: "cat_accessory", name: "Hero Cape", emoji: "🦸", cost: 500, rarity: "rare" },
  { id: "cat_wings", category: "cat_accessory", name: "Angel Wings", emoji: "🪽", cost: 1200, rarity: "epic" },
  { id: "cat_aura", category: "cat_accessory", name: "Galaxy Aura", emoji: "🌌", cost: 2000, rarity: "legendary" },

  // Cat Skins
  { id: "cat_skin_orange", category: "cat_skin", name: "Orange Tabby", emoji: "🐱", cost: 100, rarity: "common" },
  { id: "cat_skin_black", category: "cat_skin", name: "Black Cat", emoji: "🐈‍⬛", cost: 200, rarity: "uncommon" },
  { id: "cat_skin_lion", category: "cat_skin", name: "Lion", emoji: "🦁", cost: 600, rarity: "rare" },
  { id: "cat_skin_tiger", category: "cat_skin", name: "Tiger", emoji: "🐯", cost: 900, rarity: "epic" },
  { id: "cat_skin_dragon", category: "cat_skin", name: "Dragon", emoji: "🐉", cost: 2500, rarity: "legendary" },
  { id: "cat_skin_unicorn", category: "cat_skin", name: "Unicorn", emoji: "🦄", cost: 1800, rarity: "epic" },

  // Themes
  { id: "theme_neon", category: "theme", name: "Neon Theme", emoji: "🌈", cost: 300, rarity: "uncommon" },
  { id: "theme_ocean", category: "theme", name: "Ocean Theme", emoji: "🌊", cost: 400, rarity: "rare" },
  { id: "theme_sunset", category: "theme", name: "Sunset Theme", emoji: "🌅", cost: 600, rarity: "epic" },

  // Sounds
  { id: "sound_lofi_premium", category: "ambient_sound", name: "Premium Lo-Fi", emoji: "🎧", cost: 250, rarity: "uncommon" },
  { id: "sound_nature", category: "ambient_sound", name: "Nature Sounds", emoji: "🌿", cost: 300, rarity: "rare" },

  // Celebrations
  { id: "effect_confetti_pro", category: "celebration", name: "Pro Confetti", emoji: "🎊", cost: 400, rarity: "rare" },
  { id: "effect_fireworks", category: "celebration", name: "Fireworks", emoji: "🎆", cost: 700, rarity: "epic" },
  { id: "effect_aurora", category: "celebration", name: "Aurora Burst", emoji: "✨", cost: 1500, rarity: "legendary" },
];

export function CosmeticsShop() {
  const [open, setOpen] = useState(false);
  const { xp, unlockedItems, equippedItems, unlockItem, equipItem } = useGamification();

  const getCategoryItems = (category: string) =>
    SHOP_ITEMS.filter((i) => i.category === category).sort((a, b) => {
      const order: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary"];
      return order.indexOf(a.rarity) - order.indexOf(b.rarity);
    });

  const renderCategory = (title: string, category: string) => {
    const items = getCategoryItems(category);
    if (items.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => {
            const isUnlocked = unlockedItems.includes(item.id);
            const isEquipped = equippedItems[category] === item.id;
            const canAfford = xp >= item.cost;
            const rarity = RARITY_CONFIG[item.rarity];

            return (
              <div
                key={item.id}
                className={`relative flex flex-col items-center justify-between gap-2 rounded-xl border p-3 text-center transition-all hover:scale-[1.02] ${
                  isEquipped
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : `${rarity.border} ${rarity.bg} hover:bg-secondary`
                }`}
              >
                {item.rarity !== "common" && (
                  <span className={`absolute top-1 right-1 text-[9px] font-bold uppercase tracking-wider ${rarity.color}`}>
                    {item.rarity === "legendary" && <Sparkles className="inline h-2.5 w-2.5 mr-0.5" />}
                    {rarity.label}
                  </span>
                )}
                <div className="text-3xl mt-1">{item.emoji}</div>
                <div className="flex-1">
                  <p className="text-xs font-medium">{item.name}</p>
                  {!isUnlocked && (
                    <p className={`text-[10px] ${canAfford ? "text-primary" : "text-muted-foreground"}`}>
                      {item.cost} XP
                    </p>
                  )}
                </div>
                <div className="w-full mt-1">
                  {isUnlocked ? (
                    <Button
                      size="sm"
                      variant={isEquipped ? "secondary" : "outline"}
                      className="w-full h-7 text-[10px]"
                      onClick={() => equipItem(category, isEquipped ? null : item.id)}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="mr-1 h-3 w-3" /> Equipped
                        </>
                      ) : (
                        "Equip"
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant={canAfford ? "default" : "secondary"}
                      className="w-full h-7 text-[10px]"
                      disabled={!canAfford}
                      onClick={() => {
                        unlockItem(item.id, item.cost);
                        fireItemUnlock();
                        toast({ title: `${item.emoji} Unlocked!`, description: `You got ${item.name} (${rarity.label})!` });
                      }}
                    >
                      {canAfford ? (
                        "Unlock"
                      ) : (
                        <>
                          <Lock className="mr-1 h-3 w-3" /> Locked
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
          <ShoppingBag className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Cosmetics Shop
            </DialogTitle>
            <Badge variant="secondary" className="mr-6 bg-primary/10 text-primary hover:bg-primary/20">
              {xp} XP Available
            </Badge>
          </div>
        </DialogHeader>

        <div className="mt-4">
          {renderCategory("🎩 Cat Hats", "cat_hat")}
          {renderCategory("✨ Cat Accessories", "cat_accessory")}
          {renderCategory("🐾 Cat Skins", "cat_skin")}
          {renderCategory("🎨 Color Themes", "theme")}
          {renderCategory("🎵 Premium Sounds", "ambient_sound")}
          {renderCategory("🎉 Celebration Effects", "celebration")}
        </div>
      </DialogContent>
    </Dialog>
  );
}