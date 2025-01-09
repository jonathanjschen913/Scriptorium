import { type FC } from "react";

interface BlogTagProps {
    tag: string;
}

export const BlogTag: FC<BlogTagProps> = ({ tag }) => {
    return (
        <div className="blog-tag px-2 py-1 bg-cyan-900 rounded-md text-xs">
            {tag}
        </div>
    );
};