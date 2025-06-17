import { useEffect, useState } from "react";
import { Check, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const themes = [
  { name: "Light", value: "light", icon: Sun },
  { name: "Dark", value: "dark", icon: Moon },
  { name: "System", value: "system", icon: Laptop },
];

const colors = [
  { name: "Slate", value: "slate" },
  { name: "Blue", value: "blue" },
  { name: "Green", value: "green" },
  { name: "Violet", value: "violet" },
  { name: "Red", value: "red" },
  { name: "Amber", value: "amber" },
  { name: "Teal", value: "teal" },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [color, setColor] = useState("slate");
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Get saved color from localStorage
    const savedColor = localStorage.getItem("theme-color") || "slate";
    setColor(savedColor);

    // Apply the color theme
    document.documentElement.setAttribute("data-color", savedColor);
  }, []);

  // Handle color change
  const handleColorChange = (value: string) => {
    setColor(value);
    localStorage.setItem("theme-color", value);
    document.documentElement.setAttribute("data-color", value);

    toast(`Theme updated- Accent color changed to ${value}.`);
  };

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          {theme === "light" ? (
            <Sun className="h-4 w-4" />
          ) : theme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Laptop className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {themes.map((t) => (
            <DropdownMenuItem
              key={t.value}
              onClick={() => {
                setTheme(t.value);
                toast(
                  `Theme updated
                  - ${t.name} theme applied.`
                );
              }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <t.icon className="h-4 w-4" />
                <span>{t.name}</span>
              </div>
              {theme === t.value && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span>Accent Color</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={color}
                onValueChange={handleColorChange}
              >
                {colors.map((c) => (
                  <DropdownMenuRadioItem key={c.value} value={c.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full bg-${c.value}-500`}
                      />
                      <span>{c.name}</span>
                    </div>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
