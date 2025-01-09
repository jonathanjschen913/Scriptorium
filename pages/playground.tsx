import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

const Playground: React.FC = () => {
    const [language, setLanguage] = useState<string>("javascript");
    const [code, setCode] = useState<string>("// Write your code here...");
    const [stdin, setStdin] = useState<string>("");
    const [output, setOutput] = useState<string>("Output will appear here.");
    const [theme, setTheme] = useState<string>("vs-dark");
    const [error, setError] = useState<string>("Standard Error will appear here.");

    const handleRunCode = async () => {
        try {
            const response = await fetch("/api/codeExec", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body:code, language, stdin }),
            });
            const result = await response.json();
            setOutput(result.error ? `Error: ${result.error}` : result.stdout);
            setError(result.error ? `Error: ${result.error}` : result.stderr);
        } catch (err) {
            setOutput(`Error: Unable to execute code. ${(err as Error).message}`);
        }
    };

    return (
        <div className="flex flex-col mt-7 mb-10">
            {/* Main Content */}
            <div className="flex flex-col md:flex-row flex-grow md:ml-2">

                {/* Code Editor Section */}
                <div className="w-full md:w-2/3 p-4 mt-4">
                    <div className="mb-4 flex flex-row items-center justify-between">
                        <div className="flex flex-col gap-2 items-center md:flex-row">
                            <label
                                htmlFor="language"
                                className="text-sm font-medium block sm:inline"
                            >
                                Programming Language:
                            </label>
                            <select
                                id="language"
                                value={language}
                                onChange={e => setLanguage(e.target.value)}
                                className="sign-text rounded-md p-1 ml-2 sm:ml-0"
                            >
                                <option value="javaScript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                                <option value="c">C</option>
                                <option value="ruby">Ruby</option>
                                <option value="go">Go</option>
                                <option value="rust">Rust</option>
                                <option value="php">PHP</option>
                                <option value="perl">Perl</option>
                                <option value="r">R</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2 items-center md:flex-row">
                            <label
                                htmlFor="theme"
                                className="text-sm font-medium block sm:inline"
                            >
                                Theme:
                            </label>
                            <select
                                id="theme"
                                value={theme}
                                onChange={e => setTheme(e.target.value)}
                                className="sign-text rounded-md p-1 ml-2 sm:ml-0"
                            >
                                <option value="vs-dark">Dark</option>
                                <option value="vs-light">Light</option>
                                <option value="hc-black">High Contrast</option>
                            </select>
                        </div>
                    </div>

                    <Editor
                        height="75vh"
                        language={language}
                        value={code}
                        onChange={value => setCode(value || "")}
                        theme={theme}
                        options={{ lineHeight: 20, fontSize: 14 }}
                    />
                </div>

                {/* Input and Output Section */}
                <div className="w-full md:w-1/3 p-4 flex flex-col space-y-4 md:mr-3">
                
                    {/* Standard Input */}
                    <div>
                        <label
                            htmlFor="stdin"
                            className="block text-sm font-medium mb-1"
                        >
                            Standard Input:
                        </label>
                        <textarea
                            id="stdin"
                            value={stdin}
                            onChange={e => setStdin(e.target.value)}
                            className="sign-text w-full rounded-md p-2 text-sm resize-none"
                            rows={4}
                            placeholder="Enter input for your program..."
                        />
                    </div>

                    {/* Run Button */}
                    <button
                        onClick={handleRunCode}
                        className="w-full bg-cyan-700 hover:bg-cyan-800 text-white font-semibold py-2 px-4 rounded-md"
                    >
                        Run Code
                    </button>

                    {/* Output Display */}
                    <div>
                        <label
                            htmlFor="Standard Output"
                            className="block text-sm font-medium mb-1"
                        >
                            Standard Output:
                        </label>
                        <div
                            id="output"
                            className="sign-text w-full rounded-md p-2 text-sm overflow-y-auto h-40"
                        >
                            {output}
                        </div>
                    </div>

                    {/* Error Display */}
                    <div>
                        <label
                            htmlFor="Standard Error"
                            className="block text-sm font-medium mb-1"
                        >
                            Standard Error:
                        </label>
                        <div
                            id="error"
                            className="sign-text w-full rounded-md p-2 text-sm overflow-y-auto h-40"
                        >
                            {error}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Playground;