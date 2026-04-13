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
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; padding: 40px 20px; color: #ffffff;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);">
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #27272a;">
            <h1 style="font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -1px; color: #ffffff;">SHOPIX</h1>
        </div>
        <div style="margin-bottom: 30px;">
            ${content}
        </div>
        <div style="border-top: 1px solid #27272a; padding-top: 20px; text-align: center; color: #71717a; font-size: 12px; line-height: 1.5;">
            <p style="margin: 0 0 8px;">&copy; ${new Date().getFullYear()} Shopix Inc. All rights reserved.</p>
            <div>
                <a href="${getDomain()}/privacy" style="color: #a1a1aa; text-decoration: none; margin: 0 8px;">Privacy Policy</a>
                <a href="${getDomain()}/terms" style="color: #a1a1aa; text-decoration: none; margin: 0 8px;">Terms of Service</a>
            </div>
        </div>
    </div>
</div>
`;

export const sendWelcomeEmail = async ({ email, username }: WelcomeEmailParams) => {
    try {
        const transport = createTransport();

        const content = `
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="font-size: 24px; font-weight: 700; margin: 0; color: #ffffff;">Welcome aboard, ${username}! 🚀</h2>
            </div>
            <p style="color: #a1a1aa; font-size: 15px; margin-bottom: 16px; line-height: 1.6;">
                We're absolutely thrilled to have you join the Shopix community. You've just taken the first step towards a more seamless and personalized shopping journey.
            </p>
            <p style="color: #a1a1aa; font-size: 15px; margin-bottom: 24px; line-height: 1.6;">
                At Shopix, we curate the best products just for you. Whether you're looking for the latest trends or everyday essentials, we've got you covered.
            </p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="${getDomain()}" style="display: inline-block; background-color: #ffffff; color: #000000; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">Start Exploring</a>
            </div>
            <p style="color: #71717a; font-size: 14px; margin-bottom: 8px; line-height: 1.5;">
                If you have any questions, our support team is always here to help. Just reply to this email!
            </p>
            <p style="color: #71717a; font-size: 14px; margin: 0; line-height: 1.5;">
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
            <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background-color: #ef44441a; color: #ef4444; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 999px; margin-bottom: 16px; border: 1px solid #ef444433;">Security Alert</div>
                <h2 style="font-size: 20px; font-weight: 700; margin: 0; color: #ffffff;">New login to your account</h2>
            </div>
            <p style="color: #a1a1aa; font-size: 15px; margin-bottom: 24px; line-height: 1.6;">Hello ${username}, we detected a new login to your Shopix account. Below are the details for your review:</p>
            
            <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td style="padding: 8px 0; color: #71717a; width: 120px;">Time:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-weight: 600;">${loginTime}</td>
                    </tr>
                    ${deviceInfo ? `
                    <tr>
                        <td style="padding: 8px 0; color: #71717a;">Device:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-weight: 600;">${deviceInfo}</td>
                    </tr>
                    ` : ""}
                </table>
            </div>
            
            <p style="color: #71717a; font-size: 14px; margin-bottom: 24px; line-height: 1.5;">If this was you, you can safely ignore this email. If you don't recognize this activity, we recommend changing your password immediately to secure your account.</p>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="${getDomain()}/auth/newpassword" style="display: inline-block; background-color: #ef4444; color: #ffffff; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">Secure My Account</a>
            </div>
            <p style="color: #71717a; font-size: 12px; margin: 0; text-align: center;">You're receiving this because it's a mandatory security notification for your account.</p>
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
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="font-size: 24px; font-weight: 700; margin: 0; color: #ffffff;">We're sorry to see you go</h2>
            </div>
            <p style="color: #a1a1aa; font-size: 15px; margin-bottom: 16px; line-height: 1.6;">
                Hello ${username}, this email is to confirm that your Shopix account has been successfully deleted. 
                As per your request, all your personal data has been removed from our active systems.
            </p>
            <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; text-align: center;">
                <p style="color: #71717a; font-size: 14px; margin: 0; line-height: 1.5;">
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
