import { type FC, useState } from "react";

interface CommentInputProps {
    blogPostId: number;
    parentId?: number;
}

export const CommentInput: FC<CommentInputProps> = ({ blogPostId, parentId }) => {
    const [comment, setComment] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        if (comment.trim() === "") {
            setIsFocused(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (comment.trim() === "") {
                setComment("");
                setIsFocused(false);
            return;
        }

        let request;
        if (parentId) {
            request = {
                body: comment,
                blogPostId,
                parentId,
            }
        } else {
            request = {
                body: comment,
                blogPostId,
            }
        }

        fetch("/api/comment/create", {
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
                        setComment("");
                        setIsFocused(false);
                    return;
                }

                // Add the new comment to the list of comments
                // This will trigger a re-render of the Comments component
                // which will display the new comment
                // setComments([...comments, data.comment]);
            });

        setComment("");
        setIsFocused(false);
    };

    return (
        <div className="w-full">
            <form
                className="flex flex-col mt-1 mb-6"
                onSubmit={handleSubmit}
            >
                <div className={`rounded-md ${isFocused ? "h-24" : "h-12"}`}>
                    <textarea
                        value={comment}
                        onChange={e => {
                            setComment(e.target.value);
                        }}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="Write a comment..."
                        className={`comment-input p-2 rounded-md resize-y w-full min-h-12 focus:outline-none`}
                    />
                    {isFocused && (
                        <div className="comment-input border-t flex gap-2 pt-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setComment("");
                                    setIsFocused(false);
                                }}
                                className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-2 py-1 text-white rounded bg-cyan-700 hover:bg-cyan-800"
                            >
                                Submit
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};