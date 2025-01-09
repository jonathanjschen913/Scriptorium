import React, { useState, type FC } from "react";
import { useRouter } from "next/router";
import { CheckIcon, XIcon } from "@/icons";

const SignUp: FC = () => {
    const router = useRouter();
    
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [avatar, setAvatar] = useState(1);

    const [isUsernameUnique, setIsUsernameUnique] = useState(true);
    const [isEmailUnique, setIsEmailUnique] = useState(true);
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [isPhoneNumberUnique, setIsPhoneNumberUnique] = useState(true);

    const checkUsername = async () => {
        const response = await fetch("/api/users/checkUniqueFields", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username }),
        });

        const data = await response.json();
        setIsUsernameUnique(!data.usernameExists);
    };

    const checkEmail = async () => {
        const response = await fetch("/api/users/checkUniqueFields", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        setIsEmailUnique(!data.emailExists);
    };

    const checkPhoneNumber = async () => {
        const response = await fetch("/api/users/checkUniqueFields", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ phoneNumber }),
        });

        const data = await response.json();
        setIsPhoneNumberUnique(!data.phoneNumberExists);
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        await Promise.all([checkUsername(), checkEmail(), checkPhoneNumber()]);

        fetch("/api/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                email,
                password,
                phoneNumber,
                firstName,
                lastName,
                avatar,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if ("error" in data) {
                    return;
                }

                // automically log in the user after signing up
                fetch("/api/users/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                })
                    .then(response => response.json())
                    .then(data => {
                        if ("error" in data) {
                            return;
                        }

                        localStorage.setItem("loggedIn", "true");
                        localStorage.setItem("userId", data.user.uId);
                        localStorage.setItem("username", data.user.username);
                        localStorage.setItem("avatar", data.user.avatar);
                        localStorage.setItem("role", data.user.role);
                        localStorage.setItem("accessToken", data.accessToken);
                        localStorage.setItem("refreshToken", data.refreshToken);

                        window.location.href = "/";
                    });
            });
    };

    return (
        <div className="flex justify-center items-center my-20">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col w-1/2"
            >
                <h2 className="text-2xl mb-1">Make your account</h2>
                <p className="blog-date mb-4">
                    Have an account already?{" "}
                    <a
                        onClick={() => router.push("/signIn")}
                        className="text-cyan-800 hover:underline cursor-pointer"
                    >
                        Sign in!
                    </a>
                </p>
                <label className="mb-2">
                    Username: <br />
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        onBlur={checkUsername}
                        placeholder="Enter your username"
                        required
                        className="sign-text mb-3 mt-2 p-1 px-2 w-full rounded-md focus:outline-none"
                    />
                    {!isUsernameUnique ? (
                        <p className="text-red-600 mb-3 flex items-center gap-2">
                            Username is already in use <XIcon className="w-5 h-5 fill-red-600" />
                        </p>
                    ) : (
                        username && (
                            <p className="text-green-600 mb-3 flex items-center gap-2">
                                Username is available <CheckIcon className="w-5 h-5 fill-green-600" />
                            </p>
                        )
                    )}
                </label>
                <label className="mb-2">
                    Email: <br />
                    <input
                        type="email"
                        value={email}
                        onChange={e => {
                            setEmail(e.target.value);
                            setIsEmailValid(validateEmail(e.target.value));
                        }}
                        onBlur={checkEmail}
                        placeholder="Enter your email"
                        required
                        className="sign-text mb-3 mt-2 p-1 px-2 w-full rounded-md focus:outline-none"
                    />
                    {!isEmailUnique && (
                        <p className="text-red-600 mb-3 flex items-center gap-2">
                            Email is already in use <XIcon className="w-5 h-5 fill-red-600" />
                        </p>
                    )}
                    {!isEmailValid && (
                        <p className="text-red-600 mb-3 flex items-center gap-2">
                            Invalid email format <XIcon className="w-5 h-5 fill-red-600" />
                        </p>
                    )}
                </label>
                <label className="mb-2">
                    Password: <br />
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="sign-text mb-3 mt-2 p-1 px-2 w-full rounded-md focus:outline-none"
                    />
                </label>
                <label className="mb-2">
                    Phone Number: <br />
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        onBlur={checkPhoneNumber}
                        placeholder="Enter your phone number e.g. 1234567890"
                        required
                        className="sign-text mb-3 mt-2 p-1 px-2 w-full rounded-md focus:outline-none"
                    />
                    {!isPhoneNumberUnique && (
                        <p className="text-red-600 mb-3 flex items-center gap-2">
                            Phone number is already in use <XIcon className="w-5 h-5 fill-red-600" />
                        </p>
                    )}
                </label>
                <label className="mb-2">
                    First Name: <br />
                    <input
                        type="text"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        placeholder="Enter your first name"
                        required
                        className="sign-text mb-3 mt-2 p-1 px-2 w-full rounded-md focus:outline-none"
                    />
                </label>
                <label className="mb-2">
                    Last Name: <br />
                    <input
                        type="text"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        placeholder="Enter your last name"
                        required
                        className="sign-text mb-3 mt-2 p-1 px-2 w-full rounded-md focus:outline-none"
                    />
                </label>
                <label className="mb-8">
                    Pick your avatar:
                    <div className="flex flex-wrap gap-5 justify-center mt-2">
                        {[1, 2, 3, 4, 5].map(num => (
                            <label
                                key={num}
                                className="flex flex-col items-center"
                            >
                                <input
                                    type="radio"
                                    value={num}
                                    checked={avatar === num}
                                    onChange={e => setAvatar(Number(e.target.value))}
                                    className="hidden"
                                />
                                <img
                                    src={`/avatars/${num}.png`}
                                    alt={`Avatar ${num}`}
                                    className={`h-24 w-24 border-2 ${
                                        avatar === num ? "border-cyan-700" : "border-transparent"
                                    } rounded-full cursor-pointer`}
                                />
                            </label>
                        ))}
                    </div>
                </label>
                <button
                    type="submit"
                    className={`p-2 text-lg text-white rounded-md ${
                        !isUsernameUnique ||
                        !isEmailUnique ||
                        !isPhoneNumberUnique ||
                        !username ||
                        !email ||
                        !password ||
                        !phoneNumber ||
                        !firstName ||
                        !lastName
                            ? "bg-cyan-950 shadow-inner"
                            : "bg-cyan-700 hover:bg-cyan-800"
                    }`}
                    disabled={
                        !isUsernameUnique ||
                        !isEmailUnique ||
                        !isPhoneNumberUnique ||
                        !username ||
                        !email ||
                        !password ||
                        !phoneNumber ||
                        !firstName ||
                        !lastName
                    }
                >
                    Sign In
                </button>
            </form>
        </div>
    );
};

export default SignUp;
