import { NextApiRequest, NextApiResponse } from "next";
import { generateToken, generateRefreshToken, comparePassword, prisma } from "@/utils";
import { ErrorResponse } from "@/types";

interface LoginResponse {
    user: {
        uId: number;
        username: string;
        avatar: string;
        role: string;
    };
    accessToken: string;
    refreshToken: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<LoginResponse | ErrorResponse>) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Missing username or password" });
    }

    const user = await prisma.user.findUnique({
        where: {
            username,
        },
    });

    if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
    }

    if (!(await comparePassword(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken({
        username: username,
        uId: user.uId,
        role: user.role,
    });

    const refreshToken = generateRefreshToken({
        username: username,
        uId: user.uId,
        role: user.role,
    });

    res.status(200).json({
        user: { username: user.username, uId:user.uId, avatar: user.avatar, role: user.role },
        accessToken: "Bearer " + token,
        refreshToken: refreshToken,
    });
}
