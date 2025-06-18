import { useEffect, useState } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState<null | boolean>(null);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const isDarkMode = theme ? theme === "dark" : prefersDark;

    setIsDark(isDarkMode);
  }, []);

  useEffect(() => {
    if (isDark === null) return;

    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return {
    isDark: isDark ?? false,
    toggle: () => {
      if (isDark !== null) setIsDark((prev) => !prev);
    },
    isReady: isDark !== null,
  };
}
