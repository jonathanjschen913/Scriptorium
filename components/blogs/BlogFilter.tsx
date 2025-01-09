import { type FC, useState } from "react";

interface BlogFilterProps {
    onFilter: (filters: {
        searchTitle?: string;
        searchDescription?: string;
        searchTags?: string[];
        wantCodeTemplates?: boolean;
        searchCodeTemplateTitle?: string;
        page?: number;
        pageSize?: number;
    }) => void;
}

export const BlogFilter: FC<BlogFilterProps> = ({ onFilter }) => {
    const [searchTitle, setSearchTitle] = useState("");
    const [searchDescription, setSearchDescription] = useState("");
    const [searchTags, setSearchTags] = useState<string[]>([]);
    const [wantCodeTemplates, setWantCodeTemplates] = useState(false);
    const [searchCodeTemplateTitle, setSearchCodeTemplateTitle] = useState("");
    const [sortBy, setSortBy] = useState<"asc" | "desc" | "">("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTags(value.split(",").map(tag => tag.trim()));
        console.log(searchTags);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const filters: { [key: string]: any } = {};

        if (searchTitle) filters.searchTitle = searchTitle;
        if (searchDescription) filters.searchDescription = searchDescription;
        if (searchTags.length > 0) filters.searchTags = searchTags;
        if (sortBy) filters.sortBy = sortBy;
        if (wantCodeTemplates) filters.wantCodeTemplates = wantCodeTemplates;
        if (searchCodeTemplateTitle) filters.searchCodeTemplateTitle = searchCodeTemplateTitle;

        onFilter(filters);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="py-4 pr-4"
        >
            <h2 className="text-lg font-semibold mb-4">Filter Blogs</h2>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                    type="text"
                    value={searchTitle}
                    placeholder="Search by title..."
                    onChange={e => setSearchTitle(e.target.value)}
                    className="blog-input mt-1 block w-full rounded-md focus:outline-none px-2 py-1"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                    type="text"
                    value={searchDescription}
                    placeholder="Search by description..."
                    onChange={e => setSearchDescription(e.target.value)}
                    className="blog-input mt-1 block w-full rounded-md focus:outline-none px-2 py-1"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                <input
                    type="text"
                    value={searchTags.join(", ")}
                    placeholder="Search by tags..."
                    onChange={handleTagChange}
                    className="blog-input mt-1 block w-full rounded-md focus:outline-none px-2 py-1"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Sort by</label>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "" | "asc" | "desc")}
                    className="blog-input mt-1 px-2 py-1.5 block w-full rounded-md bg-white"
                >
                    <option value="">Date created</option>
                    <option value="desc">Top</option>
                    <option value="asc">Controversial</option>
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Include Code Templates</label>
                <input
                    type="checkbox"
                    checked={wantCodeTemplates}
                    onChange={e => setWantCodeTemplates(e.target.checked)}
                    className="mt-1"
                />
            </div>
            {wantCodeTemplates && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Code Template Title</label>
                    <input
                        type="text"
                        value={searchCodeTemplateTitle}
                        placeholder="Search by template title..."
                        onChange={e => setSearchCodeTemplateTitle(e.target.value)}
                        className="blog-input mt-1 block w-full rounded-md focus:outline-none px-2 py-1"
                    />
                </div>
            )}
            <button
                type="submit"
                className="filter-button px-4 py-2 text-white rounded-md w-full"
            >
                Filter
            </button>
        </form>
    );
};
