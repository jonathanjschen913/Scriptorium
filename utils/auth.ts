import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10");

export interface TokenPayload extends JwtPayload {
    username: string;
    uId: number;
    role: string;
}

export interface OtherResponse {
    accessToken?: string;
    error?: string;
    details?: string;
}

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
}

export function generateToken(obj: TokenPayload) {
    return jwt.sign(obj, process.env.TOKEN_SECRET || "", { expiresIn: process.env.TOKEN_EXPIRES_IN });
}

export function generateRefreshToken(obj: TokenPayload) {
    return jwt.sign(obj, process.env.REFRESH_TOKEN_SECRET || "", { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });
}

export async function verifyAccessToken(accessToken: string, refreshToken: string): Promise<TokenPayload | OtherResponse> {
    if (!accessToken?.startsWith("Bearer ")) {
        return { error: "Access token doesn't start with Bearer" };
    }

    const token = accessToken.split(" ")[1];

    try {
        // Attempt to verify the access token
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET || "") as TokenPayload;
        return decoded;  // Access token is valid
    } catch (err) {
        // If the access token is expired, check the refresh token
        if (err instanceof jwt.TokenExpiredError) {
            try {
                // Verify the refresh token
                const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "");

                // Find the user in the database
                const user = await prisma.user.findUnique({
                    where: { uId: parseInt((decodedRefresh as jwt.JwtPayload).uId) }
                });

                if (!user) {
                    return { error: 'No user found with this token' };
                }

                // Calculate expiration time in seconds for the new access token
                const tokenExpiresIn = process.env.TOKEN_EXPIRES_IN || "1h";
                const extensionSeconds = parseInt(tokenExpiresIn.replace('h', '')) * 60 * 60;

                const payload = {
                    username: user.username,
                    uId: user.uId,
                    role: user.role,
                };

                // Generate a new access token
                const newAccessToken = jwt.sign(payload, process.env.TOKEN_SECRET || "", { expiresIn: extensionSeconds });

                return { payload, accessToken: "Bearer " + newAccessToken };
            } catch (refreshError) {
                if (refreshError instanceof jwt.TokenExpiredError) {
                    return { error: 'Refresh token has expired' };
                } else {
                    return { error: 'Invalid refresh token', details: (refreshError as Error).message };
                }
            }
        } else {
            return { error: "Access token verification failed" };
        }
    }
}

export async function userAuthentication(rawAccessToken: any, rawRefreshToken: string | string[] | undefined) {
    const accessToken = Array.isArray(rawAccessToken) ? rawAccessToken[0] : rawAccessToken;
    const refreshToken = Array.isArray(rawRefreshToken) ? rawRefreshToken[0] : rawRefreshToken;
    if (!accessToken || !refreshToken) {
        return { error: 'Authorization headers are missing' };
    }

    const userDecoded = await verifyAccessToken(accessToken, refreshToken);
    
    return userDecoded;
}