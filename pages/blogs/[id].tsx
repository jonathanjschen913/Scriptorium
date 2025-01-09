import { type FC, useState, useEffect } from "react";
import { BlogPost, BlogPostTag, User, Comment } from "@prisma/client";
import { BlogTag } from "@/components/blogs";
import { useRouter } from "next/router";
import { Blog } from "@/components/blogs";
import { ErrorResponse } from "@/types";

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

export const Blogs: FC = () => {
    const router = useRouter();
    const { id } = router.query;

    const [data, setData] = useState<BlogPostExtended | ErrorResponse>();
    const [createdAt, setCreatedAt] = useState<Date>();
    const [updatedAt, setUpdatedAt] = useState<Date>();

    useEffect(() => {
        if (!id) {
            return;
        }

        fetch(`/api/blogPost/${id}`, {
            method: "GET",
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    setData(data);
                    return;
                }

                setCreatedAt(new Date(data.createdAt));
                setUpdatedAt(new Date(data.updatedAt));

                setData(data);
            });
    }, [router.isReady]);

    return (
        <div className="py-10 px-10 sm:px-24 md:px-56">
            {data && "error" in data ? (
                <p className="py-10 text-gray-400">
                    Post not found.
                </p>
            ) : data ? (
                <Blog data={data} createdAt={createdAt} updatedAt={updatedAt} />
            ) : (
                <p className="py-10 text-gray-400">
                    If retrieving the blog post is taking longer than expected, try reloading your page.
                </p>
            )}
        </div>
    );
};

export default Blogs;
