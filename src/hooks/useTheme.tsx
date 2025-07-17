import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Simple theme application
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add("light");
    setIsDark(false);
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(newTheme === "dark" ? "dark" : "light");
    setIsDark(newTheme === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}