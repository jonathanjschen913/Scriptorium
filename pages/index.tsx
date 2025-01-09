import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

const Home = () => {
    const router = useRouter();

    const text = "Welcome to Scriptorium!";
    const [displayText, setDisplayText] = useState("");
    const [charIndex, setCharIndex] = useState(0);
    const typingSpeed = 100; // Speed of typing in ms

    useEffect(() => {
        if (charIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayText(prev => prev + text[charIndex]);
                setCharIndex(prev => prev + 1);
            }, typingSpeed);

            return () => clearTimeout(timeout);
        }
    }, [charIndex, text]);

    return (
        <div className="">
            <h1 className="flex text-center py-20 px-10 text-4xl items-center justify-center">
                <p>
                    {displayText}
                    <span className={`${charIndex === text.length ? "animate-blink" : ""} font-light`}>_</span>
                </p>
            </h1>

            <div className="flex flex-row flex-wrap justify-center items-center gap-10 mb-20">
                <button
                    className="m-4 p-2 w-52 h-56 bg-slate-700 hover:bg-slate-800 text-white rounded"
                    onClick={() => router.push("/blogs")}
                >
                    Check out our community's blogs!
                </button>
                <button
                    className="m-4 p-2 w-52 h-56 bg-slate-700 hover:bg-slate-800 text-white rounded"
                    onClick={() => router.push("/templates")}
                >
                    Check out our community's code templates!
                </button>
                <button
                    className="m-4 p-2 w-52 h-56 bg-slate-700 hover:bg-slate-800 text-white rounded"
                    onClick={() => router.push("/playground")}
                >
                    Check out our playground!
                </button>
            </div>
        </div>
    );
};

export default Home;
