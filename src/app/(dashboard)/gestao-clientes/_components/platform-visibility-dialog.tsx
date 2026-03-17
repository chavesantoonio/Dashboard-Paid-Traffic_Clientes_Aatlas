"use client";

import * as React from "react";
import {
  Settings2,
  BarChart2,
  MousePointerClick,
  MapPin,
  LineChart,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { updatePlatformVisibilityAction } from "../actions";

const PLATFORMS = [
  { id: "meta", label: "Meta Ads", icon: BarChart2 },
  { id: "google_ads", label: "Google Ads", icon: MousePointerClick },
  { id: "gmb", label: "Google Meu Negócio", icon: MapPin },
  { id: "ga4", label: "Google Analytics", icon: LineChart },
] as const;

const ALL_PLATFORMS = ["meta", "google_ads", "gmb", "ga4"];

interface PlatformVisibilityDialogProps {
  org: {
    id: string;
    name: string;
    enabled_platforms: string[] | null;
  };
}

export function PlatformVisibilityDialog({ org }: PlatformVisibilityDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [platforms, setPlatforms] = React.useState<string[]>(
    org.enabled_platforms ?? ALL_PLATFORMS
  );
  const [loading, setLoading] = React.useState(false);

  // Re-sync state when dialog opens
  React.useEffect(() => {
    if (open) setPlatforms(org.enabled_platforms ?? ALL_PLATFORMS);
  }, [open, org.enabled_platforms]);

  function toggle(platformId: string) {
    setPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  }

  async function handleSave() {
    setLoading(true);
    const result = await updatePlatformVisibilityAction(org.id, platforms);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Plataformas atualizadas com sucesso.");
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Configurar plataformas visíveis"
        >
          <Settings2 className="h-4 w-4" />
          <span className="sr-only">Configurar plataformas</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Plataformas visíveis</DialogTitle>
          <DialogDescription>
            Escolha quais plataformas aparecem no sidebar para os utilizadores de{" "}
            <strong>{org.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {PLATFORMS.map(({ id, label, icon: Icon }) => (
            <div key={id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{label}</span>
              </div>
              <Switch
                checked={platforms.includes(id)}
                onCheckedChange={() => toggle(id)}
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
