import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const VerifyToken = (request: NextRequest) => {
    try {
        const token = request.cookies.get("Accesstoken")?.value || "";
        if (!token) {
            throw new Error("Token not found");
        }
        const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET!);
        return decodedToken.id;
    } catch (error: any) {
        throw new Error(error.message);
    }
}
