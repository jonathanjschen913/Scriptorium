import { createContext, useContext, useState, ReactNode, useEffect, FC } from "react";

type Theme = "light" | "dark";

interface ThemeContextState {
    theme: Theme;
    toggleTheme: () => void;
}

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeContext = createContext<ThemeContextState | undefined>(undefined);

export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setTheme] = useState<Theme | undefined>(undefined);

    useEffect(() => {
        // Load theme from local storage or default to 'dark'
        const savedTheme = localStorage.getItem('theme') as Theme;
        setTheme(savedTheme || 'dark');
    }, []);

    const toggleTheme = () => {
        setTheme((prevTheme) => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);
            return newTheme;
        });
    };

    useEffect(() => {
        if (theme) {
            // Apply theme to document
            document.documentElement.setAttribute('data-theme', theme);
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme: theme || "dark", toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }

    return context;
};
