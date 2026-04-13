import { connectDB } from "@/src/config/dbConfig";
import User from "@/src/models/user";
import Store from "@/src/models/store";
import { VerifyToken } from "@/src/utils/VerifyToken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        const admin = await User.findById(userId);
        if (!admin || admin.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized. Admin access only.", success: false }, { status: 403 });
        }

        const totalUsers = await User.countDocuments();
        const totalStores = await Store.countDocuments();

        // Get monthly registration data for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const userMonthly = await User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            { $group: { 
                _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                count: { $sum: 1 }
            }},
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const storeMonthly = await Store.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            { $group: { 
                _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                count: { $sum: 1 }
            }},
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Format data for Recharts
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const chartData = [];
        
        for (let i = 0; i < 6; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - (5 - i));
            const m = date.getMonth() + 1;
            const y = date.getFullYear();
            
            const userCount = userMonthly.find(u => u._id.month === m && u._id.year === y)?.count || 0;
            const storeCount = storeMonthly.find(s => s._id.month === m && s._id.year === y)?.count || 0;
            
            chartData.push({
                name: months[date.getMonth()],
                users: userCount,
                stores: storeCount
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                totalUsers,
                totalStores,
                chartData,
                admin: {
                    name: admin.name,
                    email: admin.email
                }
            }
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}
