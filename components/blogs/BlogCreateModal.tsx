import React, { type FC, useState, useRef, useEffect } from "react";
import { XIcon } from "@/icons";

interface BlogCreateModalProps {
    setShowCreateModal: (show: boolean) => void;
}

export const blogTags: string[] = [
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

export const BlogCreateModal: FC<BlogCreateModalProps> = ({ setShowCreateModal }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [body, setBody] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();

        const request = {
            title,
            description,
            body,
            tags,
        };

        setLoading(true);

        fetch(`/api/blogPost/create`, {
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
                    <h1 className="text-lg font-semibold">Create Blog Post</h1>
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
                        Description: <br />
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Enter the description"
                            required
                            className="modal-input mb-3 mt-2 p-1 px-2 w-full rounded-md focus:outline-none"
                        />
                    </label>
                    <label className="mb-2">
                        Body: <br />
                        <textarea
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            placeholder="Enter the body"
                            required
                            className="modal-input mb-3 mt-2 p-1 px-2 w-full rounded-md focus:outline-none resize-y"
                            style={{ minHeight: "6rem" }}
                        />
                    </label>
                    <label className="mb-8">
                        Tags<br />
                        <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
                            {blogTags.map(tag => (
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
                    <button
                        type="submit"
                        className={`text-white rounded p-2 mt-5 w-full ${
                            !title || !description || !body || done
                                ? "bg-cyan-950"
                                : "bg-cyan-700 hover:bg-cyan-800"
                        }`}
                        disabled={!title || !description || !body || done}
                    >
                        {loading ? "Creating..." : done ? "Blog created!" : "Create Blog"}
                    </button>
                </form>
            </div>
        </div>
    );
};