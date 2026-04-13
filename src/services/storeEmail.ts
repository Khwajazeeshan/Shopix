import nodemailer from "nodemailer";

interface StoreEmailParams {
    email: string;
    sellerName: string;
    storeName: string;
}

interface AdminStoreNotificationParams {
    adminEmail: string;
    sellerName: string;
    sellerEmail: string;
    storeName: string;
    storeDescription: string;
}

interface StoreRejectionEmailParams extends StoreEmailParams {
    reason?: string;
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
            &copy; ${new Date().getFullYear()} Shopix. All rights reserved.
        </div>
    </div>
</div>
`;

export const sendStoreCreationEmail = async ({ email, sellerName, storeName }: StoreEmailParams) => {
    try {
        const transport = createTransport();

        const content = `
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="font-size: 24px; font-weight: 700; margin: 0; color: #10b981;">Store Published! 🎉</h2>
            </div>
            <p style="color: #a1a1aa; font-size: 15px; margin-bottom: 12px; line-height: 1.6;">Hello ${sellerName},</p>
            <p style="color: #a1a1aa; font-size: 15px; margin-bottom: 24px; line-height: 1.6;">
                We're excited to inform you that your store, <strong style="color: #ffffff;">${storeName}</strong>, has been successfully created and is now live on Shopix.
            </p>
            <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <p style="color: #ffffff; font-weight: 600; margin-top: 0; margin-bottom: 12px;">Next steps for your success:</p>
                <ul style="color: #a1a1aa; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
                    <li style="margin-bottom: 6px;">Add your first set of products</li>
                    <li style="margin-bottom: 6px;">Set up your payment methods</li>
                    <li style="margin-bottom: 6px;">Customize your store appearance</li>
                    <li>Share your store link with customers</li>
                </ul>
            </div>
            <div style="text-align: center; margin: 32px 0;">
                <a href="${getDomain()}/store/dashboard" style="display: inline-block; background-color: #ffffff; color: #000000; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">Go to Seller Dashboard</a>
            </div>
        `;

        const mailOption = {
            from: `"Shopix for Business" <${process.env.GMAIL}>`,
            to: email,
            subject: `Store Published: ${storeName} is Live! 🏪`,
            html: baseTemplate(content)
        };

        return await transport.sendMail(mailOption);
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const sendStoreDeletionEmail = async ({ email, sellerName, storeName }: StoreEmailParams) => {
    try {
        const transport = createTransport();

        const content = `
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="font-size: 24px; font-weight: 700; margin: 0; color: #ef4444;">Store Closed</h2>
            </div>
            <p style="color: #a1a1aa; font-size: 15px; margin-bottom: 12px; line-height: 1.6;">Hello ${sellerName},</p>
            <p style="color: #a1a1aa; font-size: 15px; margin-bottom: 24px; line-height: 1.6;">
                This is a confirmation that your store <strong style="color: #ffffff;">${storeName}</strong> has been successfully deleted from Shopix. All associated data has been removed.
            </p>
            <p style="color: #a1a1aa; font-size: 15px; margin-bottom: 24px; line-height: 1.6;">
                If this was a mistake, or if you'd like to open a new store, you can always do so from your account dashboard.
            </p>
        `;

        const mailOption = {
            from: `"Shopix for Business" <${process.env.GMAIL}>`,
            to: email,
            subject: `Store Deleted: ${storeName}`,
            html: baseTemplate(content)
        };

        return await transport.sendMail(mailOption);
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const sendProductsClearedEmail = async ({ email, sellerName, storeName }: StoreEmailParams) => {
    try {
        const transport = createTransport();

        const content = `
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="font-size: 24px; font-weight: 700; margin: 0; color: #f59e0b;">Inventory Cleared</h2>
            </div>
            <p style="color: #a1a1aa; font-size: 15px; margin-bottom: 12px; line-height: 1.6;">Hello ${sellerName},</p>
            <p style="color: #a1a1aa; font-size: 15px; margin-bottom: 24px; line-height: 1.6;">
                This is a notification that all products have been removed from your store <strong style="color: #ffffff;">${storeName}</strong>. 
                Your store is currently empty and will not show any products to customers.
            </p>
            <p style="color: #a1a1aa; font-size: 15px; margin-bottom: 24px; line-height: 1.6;">
                Ready to restock? Head over to your dashboard to add new items.
            </p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="${getDomain()}/store/dashboard" style="display: inline-block; background-color: #ffffff; color: #000000; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">Add New Products</a>
            </div>
        `;

        const mailOption = {
            from: `"Shopix for Business" <${process.env.GMAIL}>`,
            to: email,
            subject: `All Products Removed - ${storeName}`,
            html: baseTemplate(content)
        };

        return await transport.sendMail(mailOption);
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const sendAdminStoreNotificationEmail = async ({ adminEmail, sellerName, sellerEmail, storeName, storeDescription }: AdminStoreNotificationParams) => {
    try {
        const transport = createTransport();

        const content = `
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="font-size: 24px; font-weight: 700; margin: 0; color: #60a5fa;">New Store Pending Approval 🚀</h2>
            </div>
            <p style="color: #a1a1aa; font-size: 15px; margin-bottom: 24px; line-height: 1.6;">A new store request has been submitted to the platform and requires your review.</p>
            
            <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td style="padding: 8px 0; color: #71717a; width: 120px;">Store Name:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-weight: 600;">${storeName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #71717a;">Seller Name:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-weight: 600;">${sellerName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #71717a;">Seller Email:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-weight: 600;">${sellerEmail}</td>
                    </tr>
                </table>
                <div style="margin-top: 16px; border-top: 1px dashed #27272a; padding-top: 16px;">
                    <p style="color: #71717a; font-size: 13px; margin: 0 0 8px;">Description:</p>
                    <p style="color: #a1a1aa; font-size: 14px; margin: 0; line-height: 1.5; font-style: italic;">"${storeDescription}"</p>
                </div>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="${getDomain()}/admin/stores" style="display: inline-block; background-color: #60a5fa; color: #000000; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">Review Request</a>
            </div>
        `;

        const mailOption = {
            from: `"Shopix System" <${process.env.GMAIL}>`,
            to: adminEmail,
            subject: `New Store Pending Approval: ${storeName} 🚀`,
            html: baseTemplate(content)
        };

        return await transport.sendMail(mailOption);
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const sendStoreRejectionEmail = async ({ email, sellerName, storeName, reason }: StoreRejectionEmailParams) => {
    try {
        const transport = createTransport();

        const content = `
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="font-size: 24px; font-weight: 700; margin: 0; color: #ef4444;">Store Application Declined</h2>
            </div>
            <p style="color: #a1a1aa; font-size: 15px; margin-bottom: 12px; line-height: 1.6;">Hello ${sellerName},</p>
            <p style="color: #a1a1aa; font-size: 15px; margin-bottom: 24px; line-height: 1.6;">
                Thank you for your interest in selling on Shopix. After reviewing your store application for <strong style="color: #ffffff;">${storeName}</strong>, we unfortunately cannot approve it at this time.
            </p>
            
            ${reason ? `
            <div style="background-color: #ef44441a; border: 1px solid #ef444433; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <p style="color: #ef4444; font-weight: 600; font-size: 14px; margin: 0 0 8px;">Reason for decision:</p>
                <p style="color: #fca5a5; font-size: 14px; margin: 0; line-height: 1.5;">${reason}</p>
            </div>
            ` : ""}
            
            <p style="color: #a1a1aa; font-size: 15px; margin-bottom: 24px; line-height: 1.6;">
                You can update your store details and resubmit for approval at any time from your seller dashboard.
            </p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="${getDomain()}/store/dashboard" style="display: inline-block; background-color: #ffffff; color: #000000; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">View Dashboard</a>
            </div>
        `;

        const mailOption = {
            from: `"Shopix Support" <${process.env.GMAIL}>`,
            to: email,
            subject: `Update regarding your store: ${storeName}`,
            html: baseTemplate(content)
        };

        return await transport.sendMail(mailOption);
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const sendStoreFrozenEmail = async ({ email, sellerName, storeName, reason }: StoreRejectionEmailParams) => {
    try {
        const transport = createTransport();

        const content = `
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="font-size: 24px; font-weight: 700; margin: 0; color: #f59e0b;">Action Required: Account Restricted</h2>
            </div>
            <p style="color: #a1a1aa; font-size: 15px; margin-bottom: 12px; line-height: 1.6;">Hello ${sellerName},</p>
            <p style="color: #a1a1aa; font-size: 15px; margin-bottom: 24px; line-height: 1.6;">
                This is a notification that your store <strong style="color: #ffffff;">${storeName}</strong> has been frozen by our administration team. 
                During this period, your store and products will not be visible to customers on the marketplace.
            </p>
            
            <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <p style="color: #f59e0b; font-weight: 600; font-size: 14px; margin: 0 0 8px;">Reason for restriction:</p>
                <p style="color: #a1a1aa; font-size: 14px; margin: 0; line-height: 1.5;">${reason || "Your account is under review for compliance with our platform policies."}</p>
            </div>
            
            <p style="color: #a1a1aa; font-size: 15px; margin-bottom: 24px; line-height: 1.6;">
                If you believe this is an error or would like to appeal this decision, please contact our support team.
            </p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="mailto:support@shopix.com" style="display: inline-block; background-color: #ffffff; color: #000000; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">Contact Support</a>
            </div>
        `;

        const mailOption = {
            from: `"Shopix Security" <${process.env.GMAIL}>`,
            to: email,
            subject: `Action Required: Your store ${storeName} has been frozen`,
            html: baseTemplate(content)
        };

        return await transport.sendMail(mailOption);
    } catch (error: any) {
        throw new Error(error.message);
    }
};
