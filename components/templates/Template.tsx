import { type FC, useState } from "react";
import { CodeTemplate, CodeTemplateTag, Code } from "@prisma/client";
import Editor from "@monaco-editor/react";
import { useReportContext } from "@/hooks";
import { ReportModal } from "@/components/reports";
import { TemplateTag } from "@/components/templates";
import { EditIcon, ForkIcon } from "@/icons";
import { useRouter } from "next/router";
import { CodePlayground } from "../code";

interface CodeTemplateExtended extends CodeTemplate {
    author: {
        username: string;
        avatar: string;
    };
    tags: CodeTemplateTag[];
    forks: CodeTemplate[];
    code: Code;
}

interface TemplateProps {
    template: CodeTemplateExtended | undefined;
}

export const Template: FC<TemplateProps> = ({ template }) => {
    const router = useRouter();

    const username = localStorage.getItem("username");

    const { ReportButton } = useReportContext();
    const [showReportModal, setShowReportModal] = useState(false);
    const [showCodePlayground, setShowCodePlayground] = useState(false);

    const handleAuthorClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        router.push(`/users/${template?.author.username}`);
    };

    const handleFork = async () => {
        try {
            const response = await fetch(`/api/codeTemplate/fork?codeTemplateId=${template?.templateId}`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": localStorage.getItem("accessToken") || "",
                    "Refresh-Token": localStorage.getItem("refreshToken") || "",
                },

            });

            const result = await response.json();
            if (result.error) {
                console.error(result.error);
                return;
            }

            router.push(`/templates/${result.forkedTemplateId}`);
        } catch (err) {
                    console.error((err as Error).message);
        }
    };

    return (
        <>
            <div className="flex flex-wrap items-center justify-between">
                <div className="flex flex-wrap items-center">
                    <img
                        src={template?.author.avatar}
                        className="w-12 h-12 rounded-full mr-2"
                    />

                    <div className="flex flex-col">
                        <p
                            className="mr-10 hover:underline cursor-pointer"
                            onClick={handleAuthorClick}
                        >
                            {template?.author.username}
                        </p>
                        <p className="blog-date text-xs">{new Date(template?.createdAt ?? "").toLocaleDateString()}</p>
                    </div>

                    {/* fork button */}
                    <button
                        className="blog-bubble-info ml-2 px-2 py-1 rounded-md flex gap-1 hover:underline cursor-pointer"
                        onClick={handleFork}
                    >
                        <ForkIcon className="vote-icon w-5 h-5" /> Fork
                    </button>

                    {username === template?.author.username && (
                        <button
                            className="blog-bubble-info ml-2 px-2 py-1 rounded-md"
                            onClick={() => { setShowCodePlayground(!showCodePlayground) }}
                        >
                            <EditIcon className="vote-icon w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="blog-bubble-info flex items-center gap-1">
                    {/* forked from */}
                    {template?.forkedFromId && (
                        <div className="flex items-center gap-1 mr-4">
                            <ForkIcon className="w-5 h-5" />
                            <p className="text-xs">
                                Forked from{" "}
                                <a
                                    href={`/templates/${template.forkedFromId}`}
                                    className="hover:underline"
                                >
                                    {template.forkedFromId}
                                </a>
                            </p>
                        </div>
                    )}

                    <ForkIcon className="w-5 h-5" />
                    <p className="">{template?.forks.length}</p>
                </div>
            </div>

            <div className="mt-7">
                <div className="flex flex-row justify-between gap-2">
                    <h1 className="blog-title text-2xl font-semibold">{template?.title}</h1>
                    {ReportButton(5, setShowReportModal)}
                    {showReportModal && (
                        <ReportModal
                            templateId={template?.templateId}
                            contentType={"codeTemplate"}
                            setShowReportModal={setShowReportModal}
                        />
                    )}
                </div>

                <p className="mt-1 text-sm text-gray-500">{template?.explanation}</p>

                <div className="flex flex-row flex-wrap my-5 gap-2">
                    {template?.tags.map((tag, index) => (
                        <TemplateTag
                            key={index}
                            tag={tag.tag}
                        />
                    ))}
                </div>


                
                {template?.code && (
                    showCodePlayground ? (
                        template.code.body ? (
                            <CodePlayground templateId={template.templateId} language={template.language} code={template.code.body} />
                        ) : null
                    ) : (
                        template.code.body ? (
                            <Editor
                                height="400px"
                                defaultLanguage={template.language}
                                defaultValue={template.code.body}
                                theme="vs-dark"
                                options={{ readOnly: true }}
                            />
                        ) : null
                    )
                )}
                {!template?.code && template?.language && (
                    showCodePlayground ? (
                    <CodePlayground templateId={template?.templateId} language={template?.language} />
                ) : null)}
            </div>
        </>
    );
};
