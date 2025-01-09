import { type FC, useState, useEffect } from "react";
import { BlogPost, BlogPostTag, User, Comment } from "@prisma/client";
import { useRouter } from "next/router";
import { BlogTag } from "./BlogTag";
import { CommentIcon, DownvoteIcon, UpvoteIcon } from "@/icons";

interface BlogPostExtended extends BlogPost {
    author: {
        username: string;
        avatar: string;
    };
    tags: BlogPostTag[];
    upvotes: User[];
    downvotes: User[];
    comments: Comment[];
}

interface BlogCardProps {
    blog: BlogPostExtended;
}

export const BlogCard: FC<BlogCardProps> = ({ blog }) => {
    const router = useRouter();
    const username = localStorage.getItem("username");

    const [netvote, setNetvote] = useState(0);
    const [upvoted, setUpvoted] = useState(false);
    const [downvoted, setDownvoted] = useState(false);

    useEffect(() => {
        setNetvote(blog.upvotes.length - blog.downvotes.length);
        setUpvoted(blog.upvotes.some(user => user.username === username));
        setDownvoted(blog.downvotes.some(user => user.username === username));
    }, [blog.upvotes, blog.downvotes]);

    const handleBlogClick = () => {
        router.push(`/blogs/${blog.postId}`);
    };

    const handleAuthorClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        router.push(`/users/${blog.author?.username}`);
    };

    const handleUpvote = (event: React.MouseEvent) => {
        event.stopPropagation();

        fetch(`/api/blogPost/vote?blogPostId=${blog.postId}`, {
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

        fetch(`/api/blogPost/vote?blogPostId=${blog.postId}`, {
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

    interface Interval {
        label: string;
        seconds: number;
    }

    function timeSince(dateString: string): string {
        const date: Date = new Date(dateString); // Convert the string to a Date object
        const now: Date = new Date(); // Current date and time
        const seconds: number = Math.floor((now.getTime() - date.getTime()) / 1000); // Difference in seconds

        const intervals: Interval[] = [
            { label: "year", seconds: 31536000 },
            { label: "month", seconds: 2592000 },
            { label: "week", seconds: 604800 },
            { label: "day", seconds: 86400 },
            { label: "hour", seconds: 3600 },
            { label: "minute", seconds: 60 },
            { label: "second", seconds: 1 },
        ];

        for (const interval of intervals) {
            const count: number = Math.floor(seconds / interval.seconds);
            if (count > 0) {
                return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
            }
        }

        return "Just now";
    }

    return (
        <div
            className="blog-card p-4 w-full cursor-pointer rounded-lg"
            onClick={handleBlogClick}
        >
            {/* Blog Header */}
            <div className="flex mb-3 items-center justify-between">
                {/* Author Info */}
                <div className="flex items-center text-xs">
                    <img
                        src={blog.author.avatar}
                        className="w-5 h-5 rounded-full mr-2"
                    />
                    <p
                        className="mr-2 hover:underline"
                        onClick={handleAuthorClick}
                    >
                        {blog.author.username}
                    </p>
                    <p className="blog-date">{timeSince(blog.createdAt.toString())}</p>
                </div>

                {/* Blog Stats */}
                <div className="flex items-center gap-2">
                    <div className="blog-bubble-info p-1 flex flex-row gap-2">
                        {blog.comments.length}
                        <CommentIcon className="w-5 h-5" />
                    </div>

                    <div className="blog-bubble-info p-1 flex gap-1 items-center">
                    <button onClick={handleUpvote} className="" disabled={!username || blog.author.username === username}>
                        <UpvoteIcon
                            className={`${!username || blog.author.username === username ? "vote-icon-disabled" : "vote-icon"} w-5 h-5 shrink-0 ${upvoted ? "fill-green-700" : ""}`}
                        />
                    </button>
                    {netvote}{" "}
                    <button onClick={handleDownvote} className="" disabled={!username || blog.author.username === username}>
                        <DownvoteIcon
                            className={`${!username || blog.author.username === username ? "vote-icon-disabled" : "vote-icon"} w-5 h-5 shrink-0 ${downvoted ? "fill-red-700" : ""}`}
                            onClick={handleDownvote}
                        />
                    </button>
                    </div>
                </div>
            </div>

            {/* Blog Body */}
            <h2 className="blog-title text-xl font-semibold">{blog.title}</h2>
            <p className="text-gray-500 text-xs mb-3">
                {blog.description.length > 98 ? `${blog.description.slice(0, 98)}...` : blog.description}
            </p>

            <p className="blog-body mb-4">
                {blog.body.length > 98 ? `${blog.body.slice(0, 98)}...` : blog.body}
            </p>

            {/* Blog Tags */}
            <div className="flex flex-row my-2 text-xs gap-2 overflow-x-auto">
                {blog.tags.map((tag, index) => (
                    <BlogTag
                        key={index}
                        tag={tag.tag}
                    />
                ))}
            </div>
        </div>
    );
};
