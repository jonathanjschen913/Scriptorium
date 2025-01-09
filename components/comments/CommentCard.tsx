import { type FC, useState } from "react";
import { Comment, User } from "@prisma/client";
import { DeleteIcon, DownvoteIcon, UpvoteIcon } from "@/icons";
import { CommentInput } from "./CommentInput";
import { useReportContext } from "@/hooks";
import { ReportModal } from "@/components/reports";
import { useRouter } from "next/router";

interface CommentNoReplies extends Comment {
    author: {
        username: string;
        avatar: string;
    };
    upvotes: User[];
    downvotes: User[];
}

interface CommentExtended extends Comment {
    author: {
        username: string;
        avatar: string;
    };
    upvotes: User[];
    downvotes: User[];
    replies: CommentNoReplies[];
}

interface CommentCardProps {
    blogPostId: number;
    comment: CommentExtended | CommentNoReplies;
    timeSince: (dateString: string) => string;
}

export const CommentCard: FC<CommentCardProps> = ({ blogPostId, comment, timeSince }) => {
    const router = useRouter();

    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    const { ReportButton } = useReportContext();
    const [showReportModal, setShowReportModal] = useState(false);

    const [netvote, setNetvote] = useState((comment.upvotes.length ?? 0) - (comment.downvotes.length ?? 0));
    const [upvoted, setUpvoted] = useState(comment.upvotes.some(user => user.username === username) ?? false);
    const [downvoted, setDownvoted] = useState(comment.downvotes.some(user => user.username === username) ?? false);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [isHovered, setIsHovered] = useState(false);


    const handleReplyClick = () => {
        setShowReplyInput(!showReplyInput);
    };

    const handleAuthorClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        router.push(`/users/${comment.author.username}`);
    };

    const handleUpvote = (event: React.MouseEvent) => {
        event.stopPropagation();

        fetch(`/api/comment/vote?id=${comment.commentId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: localStorage.getItem("accessToken") || "",
                "Refresh-Token": localStorage.getItem("refreshToken") || "",
            },
            body: JSON.stringify({ voteType: "upvote" }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    return;
                }

                if (upvoted) {
                    setUpvoted(false);
                    setNetvote(netvote - 1);
                } else {
                    setUpvoted(true);

                    if (downvoted) {
                        setDownvoted(false);
                        setNetvote(netvote + 2);
                    } else {
                        setNetvote(netvote + 1);
                    }
                }
            });
    };

    const handleDownvote = (event: React.MouseEvent) => {
        event.stopPropagation();

        fetch(`/api/comment/vote?commentId=${comment.commentId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: localStorage.getItem("accessToken") || "",
                "Refresh-Token": localStorage.getItem("refreshToken") || "",
            },
            body: JSON.stringify({ voteType: "downvote" }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    return;
                }

                if (downvoted) {
                    setDownvoted(false);
                    setNetvote(netvote + 1);
                } else {
                    setDownvoted(true);

                    if (upvoted) {
                        setUpvoted(false);
                        setNetvote(netvote - 2);
                    } else {
                        setNetvote(netvote - 1);
                    }
                }
            });
    };

    const handleDelete = async () => {
        try {
            await fetch("/api/comment/delete", {
                method: "DELETE",
                body: JSON.stringify({ commentId: comment.commentId }),
            });
            router.reload(); // Reload the page to reflect the changes
        } catch (error) {
            console.error("Failed to delete comment:", error);
        }
    };

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`mb-5 ${"replies" in comment && "border-b"}`}
        >
            <div className="flex flex-row gap-2 items-center mb-2">
                <img
                    src={comment.author.avatar}
                    className="w-7 h-7 rounded-full"
                />
                <p
                    className="hover:underline cursor-pointer"
                    onClick={handleAuthorClick}
                >
                    {comment.author.username}
                </p>
                <p className="blog-date">{timeSince(comment.createdAt.toString())}</p>
            </div>

            <p>{comment.body}</p>

            <div className="flex items-center gap-3 mt-2">
                <div className="comment-vote flex items-center w-fit p-1 gap-1 rounded-full">
                    <button
                        onClick={handleUpvote}
                        className=""
                        disabled={!username || comment.author.username === username}
                    >
                        <UpvoteIcon
                            className={`${
                                !username || comment.author.username === username ? "vote-icon-disabled" : "vote-icon"
                            } w-5 h-5 shrink-0 ${upvoted ? "fill-green-700" : ""}`}
                        />
                    </button>
                    {netvote}{" "}
                    <button
                        onClick={handleDownvote}
                        className=""
                        disabled={!username || comment.author.username === username}
                    >
                        <DownvoteIcon
                            className={`${
                                !username || comment.author.username === username ? "vote-icon-disabled" : "vote-icon"
                            } w-5 h-5 shrink-0 ${downvoted ? "fill-red-700" : ""}`}
                            onClick={handleDownvote}
                        />
                    </button>
                </div>

                {"replies" in comment && (
                    <button
                        onClick={handleReplyClick}
                        className="comment-vote reply-button py-1 px-2 h-8 rounded-full"
                    >
                        Reply
                    </button>
                )}

                {ReportButton(4, setShowReportModal)}
                {showReportModal && (
                    <ReportModal
                        commentId={comment.commentId}
                        contentType={"comment"}
                        setShowReportModal={setShowReportModal}
                    />
                )}

                {comment.author.username === username && isHovered && (
                    <button
                        onClick={handleDelete}
                        className="p-1 text-white rounded-md"
                    >
                        <DeleteIcon className="w-4 h-4 fill-red-600" />
                    </button>
                )}
            </div>

            {showReplyInput && (
                <CommentInput
                    blogPostId={blogPostId}
                    parentId={comment.commentId}
                />
            )}

            <div className="ml-16 mt-3">
                {"replies" in comment &&
                    comment.replies.map((reply, index) => (
                        <CommentCard
                            key={index}
                            blogPostId={blogPostId}
                            comment={reply}
                            timeSince={timeSince}
                        />
                    ))}
            </div>
        </div>
    );
};