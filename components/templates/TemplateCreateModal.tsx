import React, { type FC, useState, useRef, useEffect } from "react";
import { XIcon } from "@/icons";
import { useRouter } from "next/router";

interface TemplateCreateModalProps {
    setShowCreateModal: (show: boolean) => void;
}

export const TemplateTags: string[] = [
    "api",
    "backend",
    "best-practices",
    "business",
    "clean-code",
    "coding",
    "development",
    "educational",
    "entertainment",
    "frontend",
    "learning",
    "programming",
    "software",
    "tutorial",
    "web-development"
];

export const TemplateCreateModal: FC<TemplateCreateModalProps> = ({ setShowCreateModal }) => {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [explanation, setExplanation] = useState("");
    const [language, setLanguage] = useState("javaScript");
    const [tags, setTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [which, setWhich] = useState(1);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();

        const request = {
            title,
            explanation,
            language,
            tags,
        };

        setLoading(true);

        fetch(`/api/codeTemplate/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("accessToken") || "",
                "Refresh-Token": localStorage.getItem("refreshToken") || "",
            },
            body: JSON.stringify(request),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    return;
                }

                if (data.accessToken) {
                    localStorage.setItem("accessToken", data.accessToken);
                }

                setLoading(false);
                setDone(true);

                window.location.reload();
            });
    };

    // Close popup on escape key press
    useEffect(() => {
        const closeOnEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setShowCreateModal(false);
            }
        };

        window.addEventListener("keydown", closeOnEscape);

        return () => window.removeEventListener("keydown", closeOnEscape);
    }, []);

    // Close popup on background click
    const bgRef = useRef(null);
    const closeOnBgClick = (e: React.MouseEvent) => {
        if (e.target === bgRef.current) {
            setShowCreateModal(false);
        }
    };

    return (
        <div
            ref={bgRef}
            onClick={closeOnBgClick}
            className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex justify-center items-center"
        >
            <div className="report-modal flex flex-col gap-5 rounded p-10 bg-white w-4/5">
                <div className="flex justify-between items-center">
                    <h1 className="text-lg font-semibold">Create Code Template</h1>
                    <button
                        onClick={() => setShowCreateModal(false)}
                        className="flex items-center hover:underline text-xs"
                    >
                        Close <XIcon className="modal-exit w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleCreate} className="text-sm mx-10">
                    <label className="mb-2">
                        Title: <br />
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Enter the title"
                            required
                            className="modal-input mb-3 mt-2 p-1 px-2 w-full rounded-md focus:outline-none"
                        />
                    </label>

                    <label className="mb-2">
                        Explanation: <br />
                        <input
                            type="text"
                            value={explanation}
                            onChange={e => setExplanation(e.target.value)}
                            placeholder="Enter the explanation"
                            required
                            className="modal-input mb-3 mt-2 p-1 px-2 w-full rounded-md focus:outline-none"
                        />
                    </label>

                    <label className="mb-2">
                        Language:
                        <select
                            id="language"
                            value={language}
                            onChange={e => setLanguage(e.target.value)}
                            className="sign-text rounded-md p-1 mb-3 mt-2 ml-2 sm:ml-0 w-full"
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
                            <option value="swift">Swift</option>
                            <option value="typescript">TypeScript</option>
                            <option value="scala">Scala</option>
                            <option value="r">R</option>
                        </select>
                    </label>

                    <label className="mb-8">
                        Tags<br />
                        <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
                            {TemplateTags.map(tag => (
                                <span
                                    key={tag}
                                    onClick={() => {
                                        if (tags.includes(tag)) {
                                            setTags(tags.filter(t => t !== tag));
                                        } else {
                                            setTags([...tags, tag]);
                                        }
                                    }}
                                    className={`cursor-pointer p-1 px-2 rounded-md ${
                                        tags.includes(tag) ? "bg-cyan-700 text-white" : "bg-gray-200"
                                    }`}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </label>
                    
                    <div className="flex gap-8 mt-4">
                        <button
                            type="submit"
                            onClick={() => setWhich(1)}
                            className={`text-white rounded p-2 mt-5 w-full ${
                                !title || !explanation || !language || done
                                    ? "bg-cyan-950"
                                    : "bg-cyan-700 hover:bg-cyan-800"
                            }`}
                            disabled={!title || !explanation || !language || done}
                        >
                            {loading ? "Creating..." : done ? "Code Template created!" : "Create Code Template"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}