import { type FC, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { User } from "@/components/users";
import { ErrorResponse } from "@/types";

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

export const Users: FC = () => {
    const router = useRouter();
    const { id } = router.query;

    const [data, setData] = useState<UserSimplified | ErrorResponse>();

    useEffect(() => {
        if (!id) {
            return;
        }

        fetch(`/api/users/${id}`, {
            method: "GET",
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    setData(data);
                    return;
                }

                setData(data);
            });
    }, [router.isReady]);

    return (
        <div className="py-10 px-10 sm:px-24 ">
            {data && "error" in data ? (
                <h1>User Not Found</h1>
            ) : data && "uId" in data ? (
                <User user={data} />
            ) : (
                <p className="py-10 text-gray-400">
                    If retrieving the blog post is taking longer than expected, try reloading your page.
                </p>
            )}
        </div>
    );
};

export default Users;