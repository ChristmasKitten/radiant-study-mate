import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Lock, Check } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";

export const SHOP_ITEMS = [
  { id: "cat_hat_party", category: "cat_accessory", name: "Party Hat", emoji: "🥳", cost: 100 },
  { id: "cat_hat_crown", category: "cat_accessory", name: "Crown", emoji: "👑", cost: 500 },
  { id: "cat_glasses_cool", category: "cat_accessory", name: "Cool Glasses", emoji: "🕶️", cost: 200 },
  { id: "cat_bowtie", category: "cat_accessory", name: "Bowtie", emoji: "👔", cost: 150 },
  { id: "theme_neon", category: "theme", name: "Neon Theme", emoji: "🌈", cost: 300 },
  { id: "sound_lofi_premium", category: "ambient_sound", name: "Premium Lo-Fi", emoji: "🎧", cost: 250 },
  { id: "effect_confetti_pro", category: "celebration", name: "Pro Confetti", emoji: "🎊", cost: 400 },
];

export function CosmeticsShop() {
  const [open, setOpen] = useState(false);
  const { xp, unlockedItems, equippedItems, unlockItem, equipItem } = useGamification();

  const getCategoryItems = (category: string) => SHOP_ITEMS.filter((i) => i.category === category);

  const renderCategory = (title: string, category: string) => (
    <div className="mb-6">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {getCategoryItems(category).map((item) => {
          const isUnlocked = unlockedItems.includes(item.id);
          const isEquipped = equippedItems[category] === item.id;
          const canAfford = xp >= item.cost;

          return (
            <div
              key={item.id}
              className={`flex flex-col items-center justify-between gap-2 rounded-xl border p-3 text-center transition-colors ${
                isEquipped ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-secondary"
              }`}
            >
              <div className="text-3xl">{item.emoji}</div>
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
                    onClick={() => unlockItem(item.id, item.cost)}
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:inline">XP Shop</span>
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
          {renderCategory("Cat Accessories", "cat_accessory")}
          {renderCategory("Color Themes", "theme")}
          {renderCategory("Premium Sounds", "ambient_sound")}
          {renderCategory("Celebration Effects", "celebration")}
        </div>
      </DialogContent>
    </Dialog>
  );
}
