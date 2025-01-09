import { NextApiRequest, NextApiResponse } from "next";
import { hashPassword, prisma } from "@/utils";
import path from "path";
import { ErrorResponse } from "@/types";

interface UserResponse {
    message: string;
    user: {
        uId: number;
        username: string;
        role: string;
    };
}

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse<UserResponse | ErrorResponse>
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { username, password, email, phoneNumber, firstName, lastName, avatar, role } = req.body;

    if (!username || !password || !email || !phoneNumber || !firstName || !lastName || !avatar) {
        return res.status(400).json({ error: "Missing required fields." +
            "Make sure your username, password, email, phone number, first and last name are all filled."
            });
    }

    if (await prisma.user.findUnique({ where: { username } })) {
        return res.status(400).json({ error: "Username already exists" });
    }

    let newRole = role;
    if (!newRole) {
        newRole = "USER";
    }

    if (newRole !== "ADMIN" && newRole !== "USER") {
        return res.status(400).json({ error: "Invalid role" });
    }

    const hashedPassword = await hashPassword(password);

    const avatarPath = path.join("/avatars/", `${avatar}.png`);

    const user = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
            email: email,
            phoneNumber: phoneNumber,
            firstName: firstName,
            lastName: lastName,
            avatar: avatarPath,
            role: newRole,
        },
        select : {
            uId: true,
            username: true,
            role: true,
        }
    });

    res.status(201).json({ message: "User created", user: user });
}