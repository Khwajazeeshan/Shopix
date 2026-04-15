import nodemailer from "nodemailer";

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

interface OrderNotificationParams {
    sellerEmail: string;
    sellerName: string;
    customerName: string;
    customerEmail: string;
    orderId: string;
    items: OrderItem[];
    totalAmount: number;
    shippingAddress?: string;
}

interface OrderStatusUpdateParams {
    customerEmail: string;
    customerName: string;
    orderId: string;
    status: string;
    productName: string;
}

interface ReturnRequestParams {
    sellerEmail: string;
    sellerName: string;
    customerName: string;
    orderId: string;
    productName: string;
    reason: string;
}

interface ReturnOutcomeParams {
    customerEmail: string;
    customerName: string;
    orderId: string;
    productName: string;
    outcome: 'successful' | 'failed';
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
            &copy; ${new Date().getFullYear()} Shopix. All rights reserved.
        </div>
    </div>
</div>
`;

export const sendOrderNotificationToSeller = async ({
    sellerEmail,
    sellerName,
    customerName,
    customerEmail,
    orderId,
    items,
    totalAmount,
    shippingAddress
}: OrderNotificationParams) => {
    try {
        const transport = createTransport();

        const itemsHtml = items.map(item => `
            <tr>
                <td style="padding: 10px 4px; color: #ffffff; border-bottom: 1px solid #27272a; font-size: 13px; word-break: break-word;">${item.name}</td>
                <td style="padding: 10px 4px; color: #a1a1aa; text-align: center; border-bottom: 1px solid #27272a; font-size: 13px; white-space: nowrap;">${item.quantity}</td>
                <td style="padding: 10px 4px; color: #ffffff; text-align: right; border-bottom: 1px solid #27272a; font-size: 13px; white-space: nowrap;">$${item.price.toFixed(2)}</td>
            </tr>
        `).join("");

        const content = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="display: inline-block; background-color: #10b9811a; color: #10b981; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 999px; margin-bottom: 14px; border: 1px solid #10b98133;">New Sale</div>
                <h2 style="font-size: 20px; font-weight: 700; margin: 0; color: #ffffff;">Hello ${sellerName},</h2>
            </div>
            <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 20px; line-height: 1.6; text-align: center;">You've just received a new order! Here are the details for your prompt attention.</p>
            
            <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; margin-bottom: 20px; box-sizing: border-box;">
                <h3 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #71717a; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid #27272a; padding-bottom: 8px;">Customer Details</h3>
                <p style="color: #ffffff; font-size: 14px; margin: 0 0 4px; font-weight: 600; word-break: break-word;">${customerName}</p>
                <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 10px; word-break: break-all;">${customerEmail}</p>
                ${shippingAddress ? `<p style="color: #a1a1aa; font-size: 13px; margin: 0; line-height: 1.5; word-break: break-word;"><strong style="color: #71717a;">Shipping:</strong><br>${shippingAddress}</p>` : ""}
            </div>

            <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; margin-bottom: 24px; box-sizing: border-box;">
                <h3 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #71717a; margin-top: 0; margin-bottom: 14px;">Order Summary (#${orderId.slice(-6).toUpperCase()})</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; table-layout: fixed;">
                    <thead>
                        <tr>
                            <th style="padding: 0 4px 10px; color: #71717a; text-align: left; font-weight: 600; border-bottom: 1px solid #27272a; font-size: 12px; width: 50%;">Product</th>
                            <th style="padding: 0 4px 10px; color: #71717a; text-align: center; font-weight: 600; border-bottom: 1px solid #27272a; font-size: 12px; width: 20%;">Qty</th>
                            <th style="padding: 0 4px 10px; color: #71717a; text-align: right; font-weight: 600; border-bottom: 1px solid #27272a; font-size: 12px; width: 30%;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 14px 4px 0; color: #71717a; text-align: left; font-weight: 600; font-size: 13px;">Total Amount:</td>
                            <td style="padding: 14px 4px 0; color: #10b981; text-align: right; font-weight: 800; font-size: 16px;">$${totalAmount.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div style="text-align: center;">
                <a href="${getDomain()}/store/track-orders" style="display: inline-block; background-color: #ffffff; color: #000000; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none; max-width: 100%; box-sizing: border-box;">Manage Orders</a>
            </div>
        `;

        const mailOption = {
            from: `"Shopix Orders" <${process.env.GMAIL}>`,
            to: sellerEmail,
            subject: `New Order Received! #${orderId.slice(-6).toUpperCase()}`,
            html: baseTemplate(content)
        };

        return await transport.sendMail(mailOption);
    } catch (error: any) {
        console.error("Error sending order notification to seller:", error);
        throw new Error(error.message);
    }
};

export const sendOrderStatusUpdateToCustomer = async ({
    customerEmail,
    customerName,
    orderId,
    status,
    productName
}: OrderStatusUpdateParams) => {
    try {
        const transport = createTransport();

        let statusTitle = "Order Updated";
        let statusMessage = `Your order status has been updated to ${status}.`;
        let statusColor = "#3b82f6";
        let statusBg = "#3b82f61a";

        if (status === "shipped") {
            statusTitle = "Your Order has Shipped! 🚚";
            statusMessage = `Great news! Your order for <strong style="color: #ffffff;">${productName}</strong> has been shipped and is on its way to you.`;
        } else if (status === "completed") {
            statusTitle = "Order Delivered! 🎉";
            statusMessage = `Your order for <strong style="color: #ffffff;">${productName}</strong> has been successfully delivered. We hope you enjoy your purchase!`;
            statusColor = "#10b981";
            statusBg = "#10b9811a";
        }

        const content = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="font-size: 20px; font-weight: 700; margin: 0; color: ${statusColor}; word-break: break-word;">${statusTitle}</h2>
            </div>
            <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 20px; line-height: 1.6; word-break: break-word;">
                Hello ${customerName},<br><br>
                ${statusMessage}
            </p>
            
            <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px; box-sizing: border-box;">
                <p style="color: #71717a; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px;">Order Number</p>
                <p style="color: #ffffff; font-size: 16px; font-weight: 800; letter-spacing: 1px; margin: 0; word-break: break-all;">#${orderId.toUpperCase()}</p>
            </div>

            <div style="text-align: center; margin-bottom: 24px;">
                <a href="${getDomain()}/products/my-orders" style="display: inline-block; background-color: #ffffff; color: #000000; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none; max-width: 100%; box-sizing: border-box;">Track My Order</a>
            </div>

            <p style="color: #71717a; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">
                If you have any questions, feel free to reply to this email or contact our support team.
            </p>
        `;

        const mailOption = {
            from: `"Shopix Updates" <${process.env.GMAIL}>`,
            to: customerEmail,
            subject: `${statusTitle} (Order #${orderId.slice(-6).toUpperCase()})`,
            html: baseTemplate(content)
        };

        return await transport.sendMail(mailOption);
    } catch (error: any) {
        console.error("Error sending order status update to customer:", error);
        throw new Error(error.message);
    }
};

export const sendReturnRequestToSeller = async ({
    sellerEmail,
    sellerName,
    customerName,
    orderId,
    productName,
    reason
}: ReturnRequestParams) => {
    try {
        const transport = createTransport();

        const content = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="display: inline-block; background-color: #f59e0b1a; color: #f59e0b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 999px; margin-bottom: 14px; border: 1px solid #f59e0b33;">Action Required</div>
                <h2 style="font-size: 20px; font-weight: 700; margin: 0; color: #ffffff;">Return Request</h2>
            </div>
            <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 20px; line-height: 1.6; word-break: break-word;">Hello ${sellerName}, a customer has submitted a request to return <strong style="color: #ffffff;">${productName}</strong> from their order.</p>
            
            <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; margin-bottom: 24px; box-sizing: border-box;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tr>
                        <td style="padding: 6px 0; color: #71717a; width: 35%;">Customer:</td>
                        <td style="padding: 6px 0; color: #ffffff; font-weight: 600; word-break: break-word;">${customerName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #71717a;">Order ID:</td>
                        <td style="padding: 6px 0; color: #ffffff; font-weight: 600; word-break: break-all;">#${orderId}</td>
                    </tr>
                </table>
                <div style="margin-top: 14px; border-top: 1px dashed #27272a; padding-top: 14px;">
                    <p style="color: #71717a; font-size: 12px; font-weight: 600; margin: 0 0 6px;">Reason for Return:</p>
                    <p style="color: #a1a1aa; font-size: 13px; margin: 0; line-height: 1.5; font-style: italic; word-break: break-word;">"${reason}"</p>
                </div>
            </div>

            <div style="text-align: center;">
                <a href="${getDomain()}/store/return-orders" style="display: inline-block; background-color: #ffffff; color: #000000; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none; max-width: 100%; box-sizing: border-box;">Review Request</a>
            </div>
        `;

        const mailOption = {
            from: `"Shopix Returns" <${process.env.GMAIL}>`,
            to: sellerEmail,
            subject: `Return Request for Order #${orderId.slice(-6).toUpperCase()}`,
            html: baseTemplate(content)
        };

        return await transport.sendMail(mailOption);
    } catch (error: any) {
        console.error("Error sending return request email:", error);
        throw new Error(error.message);
    }
};

export const sendReturnOutcomeToCustomer = async ({
    customerEmail,
    customerName,
    orderId,
    productName,
    outcome
}: ReturnOutcomeParams) => {
    try {
        const transport = createTransport();

        const isSuccess = outcome === 'successful';
        const color = isSuccess ? '#10b981' : '#ef4444';
        const title = isSuccess ? 'Return Accepted' : 'Return Declined';
        const message = isSuccess
            ? `Your return request for <strong style="color: #ffffff;">${productName}</strong> has been accepted. Your refund is being processed and will be credited soon.`
            : `After reviewing your case, the seller has declined the return request for <strong style="color: #ffffff;">${productName}</strong>.`;

        const content = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="font-size: 20px; font-weight: 700; margin: 0; color: ${color};">${title}</h2>
            </div>
            <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 20px; line-height: 1.6; word-break: break-word;">
                Hello ${customerName},<br><br>
                ${message}
            </p>
            
            <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px; box-sizing: border-box;">
                <p style="color: #71717a; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px;">Order Number</p>
                <p style="color: #ffffff; font-size: 16px; font-weight: 800; letter-spacing: 1px; margin: 0; word-break: break-all;">#${orderId}</p>
            </div>

            <div style="text-align: center;">
                <a href="${getDomain()}/products/my-orders" style="display: inline-block; background-color: #ffffff; color: #000000; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none; max-width: 100%; box-sizing: border-box;">View Order Status</a>
            </div>
        `;

        const mailOption = {
            from: `"Shopix Returns" <${process.env.GMAIL}>`,
            to: customerEmail,
            subject: `${title}: Order #${orderId.slice(-6).toUpperCase()}`,
            html: baseTemplate(content)
        };

        return await transport.sendMail(mailOption);
    } catch (error: any) {
        console.error("Error sending return outcome email:", error);
        throw new Error(error.message);
    }
};
