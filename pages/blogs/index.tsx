import { type FC, useState, useEffect } from "react";
import { BlogPost, BlogPostTag, User, Comment } from "@prisma/client";
import { BlogCard, BlogFilter } from "@/components/blogs";
import { LeftCaret, RightCaret } from "@/icons";

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

interface BlogPostResponse {
    blogPosts: BlogPostExtended[];
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
}

interface Filters {
    sortBy?: string;
    [key: string]: any;
}

export const BlogHome: FC = () => {
    const [data, setData] = useState<BlogPostResponse>();
    const [filters, setFilters] = useState<Filters>({});

    const fetchBlogs = async () => {
        const res = await fetch(`/api/blogPost`, {
            method: "GET",
        });
        const data = await res.json();
        if (data.error) {
            return;
        }

        setData(data);
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleFilter = (newFilters: any) => {
        // Fetch filtered blog posts from the API
        fetch(`/api/blogPost?${new URLSearchParams(newFilters as Record<string, string>).toString()}`, {
            method: "GET",
        })
            .then(response => response.json())
            .then(data => setData(data));

        setFilters(newFilters);
    };

    const handlePreviousPage = () => {
        // Fetch previous page of blog posts from the API
        if (data && data.currentPage > 1) {
            fetch(
                `/api/blogPost?page=${data.currentPage - 1}&${new URLSearchParams(
                    filters as Record<string, string>
                ).toString()}`,
                {
                    method: "GET",
                }
            )
                .then(response => response.json())
                .then(data => setData(data));
        }
    };

    const handleNextPage = () => {
        // Fetch next page of blog posts from the API
        if (data && data.currentPage < data.totalPages) {
            fetch(
                `/api/blogPost?page=${data.currentPage + 1}&${new URLSearchParams(
                    filters as Record<string, string>
                ).toString()}`,
                {
                    method: "GET",
                }
            )
                .then(response => response.json())
                .then(data => setData(data));
        }
    };

    return (
        <div className="flex-none md:flex sm:flex-row">
            <div className="w-full md:w-4/5">
                <div className="flex mt-10 items-center justify-between">
                    <h1 className="text-xl ml-10 md:ml-16">View users created blog posts</h1>

                    <div className="mr-10 md:mr-17">
                        <button
                            disabled={!(data && data.currentPage > 1)}
                            onClick={handlePreviousPage}
                        >
                            <LeftCaret
                                className={`w-10 h-10 ${
                                    !(data && data.currentPage > 1)
                                        ? "fill-cyan-950"
                                        : "fill-cyan-700 hover:fill-cyan-800"
                                }`}
                            />
                        </button>
                        <button
                            disabled={!(data && data.currentPage < data.totalPages)}
                            onClick={handleNextPage}
                        >
                            <RightCaret
                                className={`w-10 h-10 ${
                                    !(data && data.currentPage < data.totalPages)
                                        ? "fill-cyan-950"
                                        : "fill-cyan-700 hover:fill-cyan-800"
                                }`}
                            />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 mx-16 mb-12 mt-6 md:mt-10 gap-5">
                    {data?.blogPosts && data?.blogPosts.length > 0 ? (
                        data?.blogPosts.map((blog, index) => (
                            <BlogCard
                                key={index}
                                blog={blog}
                            />
                        ))
                    ) : data?.blogPosts && data?.blogPosts.length === 0 ? (
                        <p className="py-10 text-gray-400 col-span-full">No blogs to be found.</p>
                    ) : (
                        <p className="py-10 text-gray-400 col-span-full">
                            If retrieving the blog posts is taking longer than expected, try reloading your page.
                        </p>
                    )}
                </div>
            </div>

            <div className="w-full md:w-1/5 items-center md:mr-2">
                <div className="sticky top-20 mx-auto px-7 mb-6 md:px-0 md:mb-0">
                    <BlogFilter onFilter={handleFilter} />
                </div>
            </div>
        </div>
    );
};

export default BlogHome;
