import { type FC, useState, useEffect } from "react";
import { CodeTemplate, CodeTemplateTag } from "@prisma/client";
import { LeftCaret, RightCaret } from "@/icons";
import { TemplateCard } from "@/components/templates";

interface CodeTemplateExtended extends CodeTemplate {
    author: {
        username: string;
        avatar: string;
    };
    tags: CodeTemplateTag[];
    forks: CodeTemplate[];
}

interface Filters {
    [key: string]: any;
}

export const CodeTemplates: FC = () => {
    const [codeTemplates, setCodeTemplates] = useState<CodeTemplateExtended[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalTemplates, setTotalTemplates] = useState<number>(0);
    const [filters, setFilters] = useState<Filters>({});

    const fetchCodeTemplates = async () => {
        await fetch(`/api/codeTemplate/searchAll`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    return;
                }

                setCodeTemplates(data.codeTemplates);
                setCurrentPage(data.currentPage);
                setTotalPages(data.totalPages);
                setTotalTemplates(data.totalTemplates);
            });
    };

    useEffect(() => {
        fetchCodeTemplates();
    }, []);

    const handleFilter = (newFilters: any) => {
        // Fetch filtered blog posts from the API
        fetch(`/api/codeTemplate?${new URLSearchParams(newFilters as Record<string, string>).toString()}`, {
            method: "GET",
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    return;
                }

                setCodeTemplates(data.codeTemplates);
                setCurrentPage(data.currentPage);
                setTotalPages(data.totalPages);
                setTotalTemplates(data.totalTemplates);
            });

        setFilters(newFilters);
    };

    const handlePreviousPage = () => {
        // Fetch previous page of blog posts from the API
        if (codeTemplates && currentPage > 1) {
            fetch(
                `/api/blogPost?page=${currentPage - 1}&${new URLSearchParams(
                    filters as Record<string, string>
                ).toString()}`,
                {
                    method: "GET",
                }
            )
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        return;
                    }

                    setCodeTemplates(data.codeTemplates);
                    setCurrentPage(data.currentPage);
                    setTotalPages(data.totalPages);
                    setTotalTemplates(data.totalTemplates);
                });
        }
    };

    const handleNextPage = () => {
        // Fetch next page of blog posts from the API
        if (codeTemplates && currentPage < totalPages) {
            fetch(
                `/api/blogPost?page=${currentPage + 1}&${new URLSearchParams(
                    filters as Record<string, string>
                ).toString()}`,
                {
                    method: "GET",
                }
            )
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        return;
                    }

                    setCodeTemplates(data.codeTemplates);
                    setCurrentPage(data.currentPage);
                    setTotalPages(data.totalPages);
                    setTotalTemplates(data.totalTemplates);
                });
        }
    };

    return (
        <div className="flex-none md:flex sm:flex-row">
            <div className="w-full md:w-4/5">
                <div className="flex mt-10 items-center justify-between">
                    <h1 className="text-xl ml-10 md:ml-16">View users created code templates</h1>

                    <div className="mr-10 md:mr-17">
                        <button
                            disabled={!(codeTemplates && currentPage > 1)}
                            onClick={handlePreviousPage}
                        >
                            <LeftCaret
                                className={`w-10 h-10 ${
                                    !(codeTemplates && currentPage > 1)
                                        ? "fill-cyan-950"
                                        : "fill-cyan-700 hover:fill-cyan-800"
                                }`}
                            />
                        </button>
                        <button
                            disabled={!(codeTemplates && currentPage < totalPages)}
                            onClick={handleNextPage}
                        >
                            <RightCaret
                                className={`w-10 h-10 ${
                                    !(codeTemplates && currentPage < totalPages)
                                        ? "fill-cyan-950"
                                        : "fill-cyan-700 hover:fill-cyan-800"
                                }`}
                            />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 mx-16 mb-12 mt-6 md:mt-10 gap-5">
                    {codeTemplates && codeTemplates.length > 0 ? (
                        codeTemplates.map((template, index) => (
                            <TemplateCard
                                key={index}
                                template={template}
                            />
                        ))
                    ) : codeTemplates && codeTemplates.length === 0 ? (
                        <p className="py-10 text-gray-400 col-span-full">No code templates to be found.</p>
                    ) : (
                        <p className="py-10 text-gray-400 col-span-full">
                            If retrieving the blog posts is taking longer than expected, try reloading your page.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CodeTemplates;
