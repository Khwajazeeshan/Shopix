import connectDB from "@/src/config/dbConfig";
import User from "@/src/models/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { sendAccountDeletionEmail } from "@/src/services/welcome";

export async function DELETE(request: NextRequest) {
    await connectDB();

    try {
        const { userId, password } = await request.json();

        const user = await User.findById(userId).select("+password");
        if (!user) {
            return NextResponse.json({ message: "User not found", success: false }, { status: 404 });
        }

        if (user.role === "admin") {
            return NextResponse.json({ message: "Admin accounts cannot be deleted", success: false }, { status: 403 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ message: "Incorrect Password", success: false }, { status: 401 });
        }

        const userEmail = user.email;
        const userName = user.name;

        await User.findByIdAndDelete(userId);

        // Send deletion confirmation email
        await sendAccountDeletionEmail({
            email: userEmail,
            username: userName
        });

        const response = NextResponse.json(
            { message: "Account Deleted Successfully", success: true },
            { status: 200 }
        );

        response.cookies.set("Accesstoken", "", { maxAge: 0 });
        response.cookies.set("RefreshToken", "", { maxAge: 0 });

        return response;

    } catch (error: any) {
        return NextResponse.json(
            { error: "Internal Server Error", success: false },
            { status: 500 }
        );
    }
}
