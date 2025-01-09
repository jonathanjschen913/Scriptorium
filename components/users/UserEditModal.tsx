import React, { type FC, useState, useRef, useEffect } from "react";
import { XIcon } from "@/icons";

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

interface UserEditModalProps {
    user: {
        username: string;
        email: string;
        phoneNumber: string;
        firstName: string;
        lastName: string;
        avatar: number;
    };
    originalUser: UserSimplified;
    setShowEditModal: (show: boolean) => void;
}

export const UserEditModal: FC<UserEditModalProps> = ({ user, originalUser, setShowEditModal }) => {
    const userId = localStorage.getItem("userId");

    const [username, setUsername] = useState(user.username);
    const [email, setEmail] = useState(user.email);
    const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [avatar, setAvatar] = useState(user.avatar);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const avatarNumberMatch = originalUser.avatar.match(/\/avatars\/(\d+)/);
    const avatarNumber = avatarNumberMatch ? avatarNumberMatch[1] : null;

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();

        const request: Partial<typeof user> = {};

        if (username !== originalUser.username) request.username = username;
        if (email !== originalUser.email) request.email = email;
        if (phoneNumber !== originalUser.phoneNumber) request.phoneNumber = phoneNumber;
        if (firstName !== originalUser.firstName) request.firstName = firstName;
        if (lastName !== originalUser.lastName) request.lastName = lastName;
        if (avatar !== Number(avatarNumber)) request.avatar = avatar;

        if (Object.keys(request).length === 0) {
            return;
        }

        setLoading(true);

        fetch(`/api/users/edit?userId=${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("accessToken") || "",
                "Refresh-Token": localStorage.getItem("refreshToken") || "",
            },
            body: JSON.stringify(request),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    return;
                }

                if (data.accessToken) {
                    localStorage.setItem("accessToken", data.accessToken);
                }

                setLoading(false);
                setDone(true);

                if (data.user.username !== originalUser.username) {
                    localStorage.setItem("username", data.user.username);
                }

                if (data.user.avatar !== originalUser.avatar) {
                    localStorage.setItem("avatar", data.user.avatar);
                }

                window.location.href = `/users/${data.user.username}`;
            });
    };

    // Close popup on escape key press
    useEffect(() => {
        const closeOnEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setShowEditModal(false);
            }
        };

        window.addEventListener("keydown", closeOnEscape);

        return () => window.removeEventListener("keydown", closeOnEscape);
    }, []);

    // Close popup on background click
    const bgRef = useRef(null);
    const closeOnBgClick = (e: React.MouseEvent) => {
        if (e.target === bgRef.current) {
            setShowEditModal(false);
        }
    };

    return (
        <div
            ref={bgRef}
            onClick={closeOnBgClick}
            className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex justify-center items-center"
        >
            <div className="report-modal flex flex-col gap-5 rounded p-10 bg-white">
                <div className="flex justify-between items-center">
                    <h1 className="text-lg font-semibold">Edit Profile</h1>
                    <button
                        onClick={() => setShowEditModal(false)}
                        className="flex items-center hover:underline text-xs"
                    >
                        Close <XIcon className="modal-exit w-4 h-4" />
                    </button>
                </div>

                <form
                    onSubmit={handleEdit}
                    className="text-sm mx-10"
                >
                    <label className="mb-2">
                        Username: <br />
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                            className="modal-input mb-3 mt-2 p-1 px-2 w-full rounded-md focus:outline-none"
                        />
                    </label>
                    <label className="mb-2">
                        Email: <br />
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="modal-input mb-3 mt-2 p-1 px-2 w-full rounded-md focus:outline-none"
                        />
                    </label>
                    <label className="mb-2">
                        Phone Number: <br />
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={e => setPhoneNumber(e.target.value)}
                            placeholder="Enter your phone number"
                            required
                            className="modal-input mb-3 mt-2 p-1 px-2 w-full rounded-md focus:outline-none"
                        />
                    </label>
                    <label className="mb-2">
                        First Name: <br />
                        <input
                            type="text"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            placeholder="Enter your first name"
                            required
                            className="modal-input mb-3 mt-2 p-1 px-2 w-full rounded-md focus:outline-none"
                        />
                    </label>
                    <label className="mb-2">
                        Last Name: <br />
                        <input
                            type="text"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            placeholder="Enter your last name"
                            required
                            className="modal-input mb-3 mt-2 p-1 px-2 w-full rounded-md focus:outline-none"
                        />
                    </label>
                    <label className="mb-8">
                        Pick your avatar:
                        <div className="flex flex-wrap gap-5 justify-center mt-2">
                            {[1, 2, 3, 4, 5].map(num => (
                                <label
                                    key={num}
                                    className="flex flex-col items-center"
                                >
                                    <input
                                        type="radio"
                                        value={num}
                                        checked={avatar === num}
                                        onChange={e => setAvatar(Number(e.target.value))}
                                        className="hidden"
                                    />
                                    <img
                                        src={`/avatars/${num}.png`}
                                        alt={`Avatar ${num}`}
                                        className={`h-20 w-20 border-2 ${
                                            avatar === num ? "border-cyan-700" : "border-transparent"
                                        } rounded-full cursor-pointer`}
                                    />
                                </label>
                            ))}
                        </div>
                    </label>
                    <button
                        type="submit"
                        className={`text-white rounded p-2 w-full mt-4 ${
                            !username ||
                            !email ||
                            !phoneNumber ||
                            !firstName ||
                            !lastName ||
                            done ||
                            (username === originalUser.username &&
                                email === originalUser.email &&
                                phoneNumber === originalUser.phoneNumber &&
                                firstName === originalUser.firstName &&
                                lastName === originalUser.lastName &&
                                avatar === Number(avatarNumber))
                                ? "bg-cyan-950"
                                : "bg-cyan-700 hover:bg-cyan-800"
                        }`}
                        disabled={
                            !username ||
                            !email ||
                            !phoneNumber ||
                            !firstName ||
                            !lastName ||
                            done ||
                            (username === originalUser.username &&
                                email === originalUser.email &&
                                phoneNumber === originalUser.phoneNumber &&
                                firstName === originalUser.firstName &&
                                lastName === originalUser.lastName &&
                                avatar === Number(avatarNumber))
                        }
                    >
                        {loading ? "Updating..." : done ? "Profile updated!" : "Update Profile"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserEditModal;
