"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CopyIdButton({ id }: { id: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success("ID copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 shrink-0"
      onClick={handleCopy}
      aria-label="Copiar ID"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </Button>
  );
}
