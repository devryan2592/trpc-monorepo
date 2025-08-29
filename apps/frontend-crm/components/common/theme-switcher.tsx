"use client";

import { FC, useId, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";

import { Switch } from "@workspace/ui/components/switch";
import { useTheme } from "next-themes";

interface ThemeSwitcherProps {
  // Add your props here
  children?: React.ReactNode;
}

const ThemeSwitcher: FC<ThemeSwitcherProps> = ({ children }) => {
  const id = useId();
  const { setTheme, theme } = useTheme();

  const toggleSwitch = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="group inline-flex items-center gap-2">
      <span
        id={`${id}-on`}
        className="group-data-[state=unchecked]:text-muted-foreground/70 flex-1 cursor-pointer text-left text-sm font-medium"
        aria-controls={id}
        onClick={() => setTheme("light")}
      >
        <SunIcon size={16} aria-hidden="true" />
      </span>
      <Switch
        id={id}
        onCheckedChange={toggleSwitch}
        checked={theme === "dark"}
        aria-labelledby={`${id}-off ${id}-on`}
        aria-label="Toggle between dark and light mode"
      />
      <span
        id={`${id}-off`}
        className="group-data-[state=checked]:text-muted-foreground/70 flex-1 cursor-pointer text-right text-sm font-medium"
        aria-controls={id}
        onClick={() => setTheme("dark")}
      >
        <MoonIcon size={16} aria-hidden="true" />
      </span>
    </div>
  );
};

export default ThemeSwitcher;
