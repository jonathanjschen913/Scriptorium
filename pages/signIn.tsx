import { type FC, useState } from "react";
import { useRouter } from "next/router";

export const SignIn: FC = () => {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const res = await fetch("/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (data.error) {
            alert(data.error);
        } else {
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("userId", data.user.uId);
            localStorage.setItem("username", data.user.username);
            localStorage.setItem("avatar", data.user.avatar);
            localStorage.setItem("role", data.user.role);
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            window.location.href = "/";
        }
    };

    return (
        <div className="h-screen mt-32">
            <div className="flex flex-col items-center">
                <h1 className="text-4xl font-bold mb-3">Sign In</h1>
                <p className="blog-date">
                    Don't have an account?{" "}
                    <a
                        onClick={() => router.push("/signUp")}
                        className="text-cyan-800 hover:underline cursor-pointer"
                    >
                        Sign up!
                    </a>
                </p>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col items-center mt-12 w-3/5 md:w-1/3"
                >
                    <label className="text-lg font-medium mb-1 w-full">Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="sign-text p-2 rounded-lg mb-5 w-full focus:outline-none"
                    />

                    <label className="text-lg font-medium mb-1 w-full">Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="sign-text p-2 rounded-lg mb-12 w-full focus:outline-none"
                    />

                    <button
                        type="submit"
                        disabled={!username || !password}
                        className={`text-white p-2 rounded-lg w-full ${
                            !username || !password ? "bg-cyan-950 shadow-inner" : "bg-cyan-700 hover:bg-cyan-800"
                        }`}
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignIn;
