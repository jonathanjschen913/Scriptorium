import { type FC, useState, useEffect } from "react";
import { CodeTemplate, CodeTemplateTag } from "@prisma/client";
import { useRouter } from "next/router";
import { TemplateTag } from "@/components/templates";
import { ForkIcon } from "@/icons";

interface Interval {
    label: string;
    seconds: number;
}

interface CodeTemplateExtended extends CodeTemplate {
    author: {
        username: string;
        avatar: string;
    };
    tags: CodeTemplateTag[];
    forks: CodeTemplate[];
}

interface CodeTemplateCardProps {
    template: CodeTemplateExtended;
}

export const TemplateCard: FC<CodeTemplateCardProps> = ({ template }) => {
    const router = useRouter();

    const handleTemplateClick = () => {
        router.push(`/templates/${template.templateId}`);
    };

    const handleAuthorClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        router.push(`/users/${template.author.username}`);
    };

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
            onClick={handleTemplateClick}
        >
            {/* Template Header */}
            <div className="flex mb-3 items-center justify-between">
                {/* Author Info */}
                <div className="flex items-center text-xs">
                    <img
                        src={template.author.avatar}
                        className="w-5 h-5 rounded-full mr-2"
                    />
                    <p
                        className="mr-2 hover:underline"
                        onClick={handleAuthorClick}
                    >
                        {template.author.username}
                    </p>
                    <p className="blog-date">{timeSince(template.createdAt.toString())}</p>
                </div>

                {/* Template Stats */}
                <div className="flex items-center gap-2">
                    <div className="blog-bubble-info p-1 flex flex-row gap-1 items-center">
                        {template.forks.length}
                        <ForkIcon className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Template Body */}
            <h2 className="blog-title text-xl font-semibold">{template.title}</h2>
            <p className="text-gray-500 text-xs mb-3">{template.language}</p>

            <p className="blog-body mb-4">
                {template.explanation.length > 98 ? `${template.explanation.slice(0, 98)}...` : template.explanation}
            </p>

            {/* Blog Tags */}
            <div className="flex flex-row my-2 text-xs gap-2 overflow-x-auto">
                {template.tags.map((tag, index) => (
                    <TemplateTag
                        key={index}
                        tag={tag.tag}
                    />
                ))}
            </div>
        </div>
    );
};
