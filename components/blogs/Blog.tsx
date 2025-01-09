import { type FC, useState } from "react";
import { BlogPost, BlogPostTag, User, Comment } from "@prisma/client";
import { DownvoteIcon, UpvoteIcon } from "@/icons";
import { Comments } from "@/components/comments";
import { useReportContext } from "@/hooks";
import { ReportModal } from "@/components/reports";
import { BlogTag } from "./BlogTag";
import { useRouter } from "next/router";

interface CommentNoReplies extends Comment {
    author: {
        username: string;
        avatar: string;
    },
    upvotes: User[],
    downvotes: User[],
}

interface CommentExtended extends Comment {
    author: {
        username: string;
        avatar: string;
    },
    upvotes: User[],
    downvotes: User[],
    replies: CommentNoReplies[],
}

interface BlogPostExtended extends BlogPost {
    author: {
        username: string;
        avatar: string;
    };
    tags: BlogPostTag[];
    upvotes: User[];
    downvotes: User[];
    comments: CommentExtended[];
}

interface Blog {
    data: BlogPostExtended | undefined;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
}

export const Blog: FC<Blog> = ({ data, createdAt, updatedAt}) => {
    const router = useRouter();

    const username = localStorage.getItem("username");

    const { ReportButton } = useReportContext();
    const [showReportModal, setShowReportModal] = useState(false);

    const [netvote, setNetvote] = useState((data?.upvotes?.length ?? 0) - (data?.downvotes?.length ?? 0));
    const [upvoted, setUpvoted] = useState(data?.upvotes.some(user => user.username === username) ?? false);
    const [downvoted, setDownvoted] = useState(data?.downvotes.some(user => user.username === username) ?? false);

    const handleAuthorClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        router.push(`/users/${data?.author?.username}`);
    };

    const handleUpvote = (event: React.MouseEvent) => {
        event.stopPropagation();

        fetch(`/api/blogPost/vote?blogPostId=${data?.postId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("accessToken") || "",
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

        fetch(`/api/blogPost/vote?blogPostId=${data?.postId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("accessToken") || "",
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

    return (
        <>
            <div className="flex flex-wrap items-center justify-between">
                <div className="flex flex-wrap items-center">
                    <img
                        src={data?.author.avatar}
                        className="w-12 h-12 rounded-full mr-2"
                    />

                    <div className="flex flex-col">
                        <p
                            className="mr-10 hover:underline cursor-pointer"
                            onClick={handleAuthorClick}
                        >
                            {data?.author.username}
                        </p>
                        <p className="blog-date text-xs">
                            {createdAt?.toLocaleDateString()}
                            {"  "}
                            {createdAt?.toLocaleDateString() !== updatedAt?.toLocaleDateString() &&
                                `Edited: ${updatedAt?.toLocaleDateString()}`}
                        </p>
                    </div>
                </div>

                <div className="blog-bubble-info flex items-center gap-1">
                <button onClick={handleUpvote} className="" disabled={!username || data?.author.username === username}>
                        <UpvoteIcon
                            className={`${!username || data?.author.username === username ? "vote-icon-disabled" : "vote-icon"} w-5 h-5 shrink-0 ${upvoted ? "fill-green-700" : ""}`}
                        />
                    </button>
                    {netvote}{" "}
                    <button onClick={handleDownvote} className="" disabled={!username || data?.author.username === username}>
                        <DownvoteIcon
                            className={`${!username || data?.author.username === username ? "vote-icon-disabled" : "vote-icon"} w-5 h-5 shrink-0 ${downvoted ? "fill-red-700" : ""}`}
                        />
                    </button>
                </div>
            </div>

            <div className="mt-7">
                <div className="flex flex-row justify-between gap-2">
                    <h1 className="blog-title text-2xl font-semibold">{data?.title}</h1>
                    {ReportButton(5, setShowReportModal)}
                    {showReportModal && <ReportModal postId={data?.postId} contentType={"blogPost"} setShowReportModal={setShowReportModal} />}
                </div>

                <p className="mt-1 text-sm text-gray-500">{data?.description}</p>
                <p className="mt-5">{data?.body}</p>

                <div className="flex flex-row flex-wrap my-5 gap-2">
                    {data?.tags.map((tag, index) => (
                        <BlogTag
                            key={index}
                            tag={tag.tag}
                        />
                    ))}
                </div>
            </div>

            <div className="blog-comment-border w-full border-t mt-16 p-8">
                <h1 className="text-lg font-semibold mb-2">
                    {data?.comments.length === 0
                        ? "No comments on this post yet."
                        : `Comments (${data?.comments.length})`}
                </h1>

                {data?.comments && data?.postId !== undefined && <Comments blogPostId={data.postId} comments={data.comments} />}
            </div>
        </>
    );
};
