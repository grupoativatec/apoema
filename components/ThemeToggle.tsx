"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // ou um skeleton se quiser

  return (
    <Button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-[45px] gap-2 rounded-lg bg-[#f0f0f0] px-5 text-[#333] shadow-drop-1 hover:bg-[#e0e0e0] dark:border dark:border-white/20 dark:bg-zinc-900 dark:text-white"
    >
      {theme === "dark" ? (
        <Sun className="size-6" />
      ) : (
        <Moon className="size-6" />
      )}
    </Button>
  );
}
