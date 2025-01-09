import { type FC } from "react";

interface TemplateTagProps {
    tag: string;
}

export const TemplateTag: FC<TemplateTagProps> = ({ tag }) => {
    return (
        <div className="blog-tag px-2 py-1 bg-cyan-900 rounded-md text-xs">
            {tag}
        </div>
    );
};