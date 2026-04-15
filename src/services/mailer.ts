import nodemailer from "nodemailer";
import User from "@/src/models/user"
import crypto from "crypto";

interface SendEmailParams {
    email: string;
    emailType: "VERIFY" | "RESET";
    userId: string;
}

export const sendEmail = async ({ email, emailType, userId }: SendEmailParams) => {
    try {
        const hashedToken = crypto.randomBytes(32).toString("hex");

        if (emailType === "VERIFY") {
            await User.findByIdAndUpdate(userId, {
                verifyToken: hashedToken,
                verifyTokenExpiry: new Date(Date.now() + 3600000) // 1 hour
            })
        } else if (emailType === "RESET") {
            await User.findByIdAndUpdate(userId, {
                forgotPasswordToken: hashedToken,
                forgotPasswordTokenExpiry: new Date(Date.now() + 3600000) // 1 hour
            })
        }

        const transport = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.GMAIL,
                pass: process.env.PASSWORD,
            },
        });

        const subject = emailType === "VERIFY" ? "Verify your email - Shopix" : "Reset Your Password - Shopix";
        const actionText = emailType === "VERIFY" ? "verify your email" : "reset your password";
        const path = emailType === "VERIFY" ? "/auth/verifyemail" : "/auth/newpassword";

        // Handle possible trailing slash in DOMAIN
        const domain = process.env.NEXTAUTH_URL?.endsWith("/")
            ? process.env.NEXTAUTH_URL.slice(0, -1)
            : process.env.NEXTAUTH_URL;

        const mailOption = {
            from: `"Shopix" <${process.env.GMAIL}>`,
            to: email,
            subject: subject,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; padding: 20px 12px; color: #ffffff; width: 100% !important; min-width: 100% !important; box-sizing: border-box;">
                    <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 28px 20px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4); box-sizing: border-box;">
                        <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #27272a;">
                            <h1 style="font-size: 24px; font-weight: 900; margin: 0; letter-spacing: -1px;">SHOPIX</h1>
                        </div>
                        <div style="margin-bottom: 24px;">
                            <h2 style="font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 14px;">Protect Your Account</h2>
                            <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 10px; line-height: 1.6;">Hello,</p>
                            <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 20px; line-height: 1.6;">Please click the button below to ${actionText}. This secure link will expire in 1 hour.</p>
                            <div style="text-align: center; margin: 28px 0;">
                                <a href="${domain}${path}?token=${hashedToken}" 
                                   style="display: inline-block; background-color: #ffffff; color: #000000; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none; width: auto; max-width: 100%; box-sizing: border-box;">
                                    ${emailType === "VERIFY" ? "Verify Email" : "Reset Password"}
                                </a>
                            </div>
                            <p style="color: #71717a; font-size: 12px; margin: 0; line-height: 1.5; word-break: break-word;">If you did not request this email, you can safely ignore it. Your account remains completely secure.</p>
                        </div>
                        <div style="border-top: 1px solid #27272a; padding-top: 16px; text-align: center; color: #71717a; font-size: 11px;">
                            &copy; ${new Date().getFullYear()} Shopix Security Systems. All rights reserved.
                        </div>
                    </div>
                </div>
            `
        }

        const mailResponse = await transport.sendMail(mailOption)
        return mailResponse
    } catch (error: any) {
        throw new Error(error.message)
    }
}