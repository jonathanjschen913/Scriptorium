import { useTheme } from "@/hooks";
import { SunIcon, MoonIcon } from "@/icons";

export const ThemeToggler = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="transition transform duration-500 hover:scale-110"
        >
            {theme === "light" ? (
                <SunIcon className="w-6 h-6 fill-gray-950" />
            ) : (
                <MoonIcon className="w-6 h-6 fill-gray-400" />
            )}
        </button>
    );
};
