import { type FC, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ThemeToggler } from "@/components/theme"; // Adjust the import path as necessary

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/blogs", label: "Blogs" },
    { href: "/templates", label: "Templates" },
    { href: "/playground", label: "Playground" },
];

export const Header: FC = () => {
    const router = useRouter();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [avatar, setAvatar] = useState("");
    const [username, setUsername] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsLoggedIn(!!localStorage.getItem("loggedIn"));
            setAvatar(localStorage.getItem("avatar") || "");
            setUsername(localStorage.getItem("username") || "");
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        localStorage.removeItem("avatar");
        localStorage.removeItem("role");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setIsLoggedIn(false);
        router.push("/");
    };

    return (
        <header className="header flex">
            <div className="header-content w-full flex flex-col md:flex-row flex-wrap justify-between items-center">
                <div>
                    <button
                        className="logo mb-2 sm:mb-0 sm:ml-5"
                        onClick={() => (window.location.href = "/")}
                    >
                        <h1>Scriptorium</h1>
                    </button>
                </div>

                <nav className="nav mb-2 sm:mb-0">
                    <ul className="flex flex-row flex-wrap">
                        {navLinks.map(link => (
                            <li
                                key={link.href}
                                className={`px-2 py-1 rounded-md ${router.pathname === link.href ? "active" : ""}`}
                            >
                                <Link href={link.href}>
                                    <p>{link.label}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="theme-toggler sm:mr-5 flex items-center gap-5">
                    {isLoggedIn ? (
                        <div className="flex items-center gap-5">
                            <div className="group flex items-center gap-2" onClick={() => {router.push(`/users/${username}`)}}>
                                <img
                                    src={avatar}
                                    alt="User avatar"
                                    className="rounded-full w-8 h-8 cursor-pointer"
                                />
                                <button
                                    className="hover:underline group-hover:underline"
                                >
                                    {username}
                                </button>
                            </div>

                            <button
                                className="logout hover:underline border-l pl-5"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-5">
                            <button
                                className="btn-primary hover:underline"
                                onClick={() => router.push("/signIn")}
                            >
                                Sign In
                            </button>
                            <button
                                className="btn-secondary hover:underline"
                                onClick={() => router.push("/signUp")}
                            >
                                Sign Up
                            </button>
                        </div>
                    )}
                    <ThemeToggler />
                </div>
            </div>
        </header>
    );
};
