import { NextResponse } from "next/server"

export async function GET() {
    const response = NextResponse.json(
        { message: "Logout successful", success: true },
        { status: 200 }
    )

    response.cookies.set("Accesstoken", "", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 0, // ✅ correct way
    })

    response.cookies.set("RefreshToken", "", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 0, // ✅ correct way
    })

    return response
}
