import { type FC, useState, useRef } from "react";
import { Comment, User } from "@prisma/client";
import { CommentCard, CommentInput } from "@/components/comments";

interface Interval {
    label: string;
    seconds: number;
}

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

interface CommentsProps {
    blogPostId: number;
    comments: CommentExtended[];
}

export const Comments: FC<CommentsProps> = ({ blogPostId, comments }) => {
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
        <div>
            <CommentInput blogPostId={blogPostId} />

            {comments.filter(comment => comment.depth === 0).map((comment, index) => (
                <CommentCard key={index} blogPostId={blogPostId} comment={comment} timeSince={timeSince} />
            ))}
        </div>
    );
};
