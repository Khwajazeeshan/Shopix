import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.Refresh_Key!;

export const GenerateToken = (userId: any) => {
    const accessToken = jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: "2d",
    });

    const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, {
        expiresIn: "5d",
    });

    return { accessToken, refreshToken };
};
