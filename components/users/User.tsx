import { type FC, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { EditIcon } from "@/icons";
import { UserEditModal } from "./UserEditModal";
import { BlogCreateModal } from "@/components/blogs";
import { TemplateCreateModal } from "@/components/templates";

interface UserSimplified {
    uId: number;
    username: string;
    avatar: string;
    createdAt: string;
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    blogPosts: any[];
    codeTemplates: any[];
}

interface UserProps {
    user: UserSimplified;
}

export const User: FC<UserProps> = ({ user }) => {
    const router = useRouter();
    const { id } = router.query;

    const username = localStorage.getItem("username");
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateBlogModal, setShowCreateBlogModal] = useState(false);
    const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);

    const avatarNumberMatch = user.avatar.match(/\/avatars\/(\d+)/);
    const avatarNumber = avatarNumberMatch ? avatarNumberMatch[1] : null;

    const editInfo = {
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: Number(avatarNumber),
    }

    const handleBlogClick = (postId: number) => {
        router.push(`/blogs/${postId}`);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:justify-between items-center mt-10 mb-10">
                <div>
                    {username === user.username ? (
                        <h1 className="flex text-2xl mb-1 items-center">
                            <span className="text-4xl font-semibold">{id} </span>
                            <button
                                className="blog-bubble-info"
                                onClick={() => {setShowEditModal(true);}}
                            >
                                <EditIcon className="vote-icon w-6 h-6 ml-2 cursor-pointer" />
                            </button>
                            {showEditModal && <UserEditModal user={editInfo} originalUser={user} setShowEditModal={setShowEditModal} />}
                        </h1>
                    ) : (
                        <h1 className="text-4xl font-semibold mb-1">{id}</h1>
                    )}
                    <p className="mb-3">{user.firstName} {user.lastName}</p>
                    <p className="blog-date sm: mb-7">Profile created: {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>

                <img
                    src={user.avatar}
                    alt={user.username}
                    className="h-60 w-60 rounded-full"
                />
            </div>

            <div className="w-full mb-10 p-4 rounded-md">
                <h2 className="text-2xl font-semibold mb-2 flex items-center">
                    Blog Posts
                    {username === user.username && (
                        <button
                            className="blog-bubble-info"
                            onClick={() => {setShowCreateBlogModal(true);}}
                        >
                            <EditIcon className="vote-icon w-5 h-5 ml-2 cursor-pointer" />
                        </button>
                    )}
                </h2>

                {showCreateBlogModal && <BlogCreateModal setShowCreateModal={setShowCreateBlogModal} />}
                
                <div className="flex flex-wrap gap-5 w-full justify-center sm:justify-start">
                    {user.blogPosts.length === 0 ? (
                        <p className="blog-date px-5 py-3">No blog posts found</p>
                    ) : (
                        user.blogPosts.map((post, index) => (
                            <div
                                key={index}
                                className="blog-card px-5 py-3 w-72 rounded-md cursor-pointer"
                                onClick={() => {
                                    handleBlogClick(post.postId);
                                }}
                            >
                                <h3 className="text-xl font-semibold">{post.title}</h3>
                                <p className="text-gray-500 text-xs mb-3">
                                    {post.description.length > 50
                                        ? `${post.description.slice(0, 50)}...`
                                        : post.description}
                                </p>
                                <p className="blog-date">{new Date(post.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="w-full mb-10 p-4 rounded-md">
                <h2 className="text-2xl font-semibold mb-2 flex items-center">
                    Code Templates
                    {username === user.username && (
                        <button
                            className="blog-bubble-info"
                            onClick={() => {setShowCreateTemplateModal(true)}}
                        >
                            <EditIcon className="vote-icon w-5 h-5 ml-2 cursor-pointer" />
                        </button>
                    )}
                </h2>

                {showCreateTemplateModal && <TemplateCreateModal setShowCreateModal={setShowCreateTemplateModal} />}
                
                <div className="flex flex-wrap gap-5 w-full justify-center sm:justify-start">
                    {user.codeTemplates.length === 0 ? (
                        <p className="blog-date px-5 py-3">No code templates found</p>
                    ) : (
                        user.codeTemplates.map((template, index) => (
                            <div
                                key={index}
                                className="blog-card px-5 py-3 w-72 rounded-md cursor-pointer"
                                onClick={() => {
                                    router.push(`/templates/${template.templateId}`);
                                }}
                            >
                                <h3 className="text-xl font-semibold">{template.title}</h3>
                                <p className="text-gray-500 text-xs mb-3">
                                    {template.explanation.length > 50
                                        ? `${template.explanation.slice(0, 50)}...`
                                        : template.explanation}
                                </p>
                                <p className="blog-date">Posted: {new Date(template.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
