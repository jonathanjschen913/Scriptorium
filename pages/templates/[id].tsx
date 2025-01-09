import { type FC, useState, useEffect } from "react";
import { CodeTemplate, CodeTemplateTag, Code } from "@prisma/client";
import { useRouter } from "next/router";
import { Template } from "@/components/templates";

interface CodeTemplateExtended extends CodeTemplate {
    author: {
        username: string;
        avatar: string;
    };
    tags: CodeTemplateTag[];
    forks: CodeTemplate[];
    code: Code;
}

export const Templates: FC = () => {
    const router = useRouter();
    const { id } = router.query;

    const [codeTemplate, setCodeTemplate] = useState<CodeTemplateExtended>();

    useEffect(() => {
        if (!id) {
            return;
        }

        fetch(`/api/codeTemplate/${id}`, {
            method: "GET",
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    return;
                }

                setCodeTemplate(data);
            });
    }, [id]);

    return (
        <div className="py-10 px-10 sm:px-24 md:px-56">
            {codeTemplate && "error" in codeTemplate ? (
                <p className="py-10 text-gray-400">Post not found.</p>
            ) : codeTemplate ? (
                <Template template={codeTemplate} />
            ) : (
                <p className="py-10 text-gray-400">
                    If retrieving the blog post is taking longer than expected, try reloading your page.
                </p>
            )}
        </div>
    );
};

export default Templates;
