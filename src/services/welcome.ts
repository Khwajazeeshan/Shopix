import nodemailer from "nodemailer";

interface WelcomeEmailParams {
    email: string;
    username: string;
}

interface LoginEmailParams {
    email: string;
    username: string;
    loginTime: string;
    deviceInfo?: string;
}

interface AccountDeletionEmailParams {
    email: string;
    username: string;
}

const getDomain = () => {
    return process.env.NEXTAUTH_URL?.endsWith("/")
        ? process.env.NEXTAUTH_URL.slice(0, -1)
        : process.env.NEXTAUTH_URL;
};

const createTransport = () => {
    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.GMAIL,
            pass: process.env.PASSWORD,
        },
    });
};

const baseTemplate = (content: string) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; padding: 20px 12px; color: #ffffff; width: 100% !important; min-width: 100% !important; box-sizing: border-box;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 28px 20px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4); box-sizing: border-box;">
        <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #27272a;">
            <h1 style="font-size: 24px; font-weight: 900; margin: 0; letter-spacing: -1px; color: #ffffff;">SHOPIX</h1>
        </div>
        <div style="margin-bottom: 24px;">
            ${content}
        </div>
        <div style="border-top: 1px solid #27272a; padding-top: 16px; text-align: center; color: #71717a; font-size: 11px; line-height: 1.5;">
            <p style="margin: 0 0 6px;">&copy; ${new Date().getFullYear()} Shopix Inc. All rights reserved.</p>
            <div>
                <a href="${getDomain()}/privacy" style="color: #a1a1aa; text-decoration: none; margin: 0 6px; font-size: 11px;">Privacy Policy</a>
                <a href="${getDomain()}/terms" style="color: #a1a1aa; text-decoration: none; margin: 0 6px; font-size: 11px;">Terms of Service</a>
            </div>
        </div>
    </div>
</div>
`;

export const sendWelcomeEmail = async ({ email, username }: WelcomeEmailParams) => {
    try {
        const transport = createTransport();

        const content = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="font-size: 20px; font-weight: 700; margin: 0; color: #ffffff; word-break: break-word;">Welcome aboard, ${username}! 🚀</h2>
            </div>
            <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 14px; line-height: 1.6;">
                We're absolutely thrilled to have you join the Shopix community. You've just taken the first step towards a more seamless and personalized shopping journey.
            </p>
            <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 20px; line-height: 1.6;">
                At Shopix, we curate the best products just for you. Whether you're looking for the latest trends or everyday essentials, we've got you covered.
            </p>
            <div style="text-align: center; margin: 24px 0;">
                <a href="${getDomain()}" style="display: inline-block; background-color: #ffffff; color: #000000; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none; max-width: 100%; box-sizing: border-box;">Start Exploring</a>
            </div>
            <p style="color: #71717a; font-size: 13px; margin-bottom: 6px; line-height: 1.5;">
                If you have any questions, our support team is always here to help. Just reply to this email!
            </p>
            <p style="color: #71717a; font-size: 13px; margin: 0; line-height: 1.5;">
                Happy Shopping,<br>The Shopix Team
            </p>
        `;

        const mailOption = {
            from: `"Shopix" <${process.env.GMAIL}>`,
            to: email,
            subject: "Welcome to Shopix! 🚀",
            html: baseTemplate(content)
        };

        return await transport.sendMail(mailOption);
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const sendLoginEmail = async ({ email, username, loginTime, deviceInfo }: LoginEmailParams) => {
    try {
        const transport = createTransport();

        const content = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="display: inline-block; background-color: #ef44441a; color: #ef4444; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 999px; margin-bottom: 14px; border: 1px solid #ef444433;">Security Alert</div>
                <h2 style="font-size: 18px; font-weight: 700; margin: 0; color: #ffffff;">New login to your account</h2>
            </div>
            <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 20px; line-height: 1.6; word-break: break-word;">Hello ${username}, we detected a new login to your Shopix account. Below are the details for your review:</p>
            
            <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; margin-bottom: 20px; box-sizing: border-box;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tr>
                        <td style="padding: 6px 0; color: #71717a; width: 35%;">Time:</td>
                        <td style="padding: 6px 0; color: #ffffff; font-weight: 600; word-break: break-word;">${loginTime}</td>
                    </tr>
                    ${deviceInfo ? `
                    <tr>
                        <td style="padding: 6px 0; color: #71717a;">Device:</td>
                        <td style="padding: 6px 0; color: #ffffff; font-weight: 600; word-break: break-word;">${deviceInfo}</td>
                    </tr>
                    ` : ""}
                </table>
            </div>
            
            <p style="color: #71717a; font-size: 13px; margin-bottom: 20px; line-height: 1.5;">If this was you, you can safely ignore this email. If you don't recognize this activity, we recommend changing your password immediately to secure your account.</p>
            
            <div style="text-align: center; margin: 24px 0;">
                <a href="${getDomain()}/auth/newpassword" style="display: inline-block; background-color: #ef4444; color: #ffffff; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none; max-width: 100%; box-sizing: border-box;">Secure My Account</a>
            </div>
            <p style="color: #71717a; font-size: 11px; margin: 0; text-align: center;">You're receiving this because it's a mandatory security notification for your account.</p>
        `;

        const mailOption = {
            from: `"Shopix Security" <${process.env.GMAIL}>`,
            to: email,
            subject: "New Login Notification - Shopix",
            html: baseTemplate(content)
        };

        return await transport.sendMail(mailOption);
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const sendAccountDeletionEmail = async ({ email, username }: AccountDeletionEmailParams) => {
    try {
        const transport = createTransport();

        const content = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="font-size: 20px; font-weight: 700; margin: 0; color: #ffffff;">We're sorry to see you go</h2>
            </div>
            <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 14px; line-height: 1.6; word-break: break-word;">
                Hello ${username}, this email is to confirm that your Shopix account has been successfully deleted. 
                As per your request, all your personal data has been removed from our active systems.
            </p>
            <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; text-align: center; box-sizing: border-box;">
                <p style="color: #71717a; font-size: 13px; margin: 0; line-height: 1.5; word-break: break-word;">
                    If you didn't mean to delete your account or if you change your mind in the future, 
                    you're always welcome to <a href="${getDomain()}/auth/signup" style="color: #ffffff; font-weight: 600; text-decoration: underline;">create a new account</a>.
                </p>
            </div>
        `;

        const mailOption = {
            from: `"Shopix" <${process.env.GMAIL}>`,
            to: email,
            subject: "Account Deleted Successfully - Shopix",
            html: baseTemplate(content)
        };

        return await transport.sendMail(mailOption);
    } catch (error: any) {
        throw new Error(error.message);
    }
};
