import { connectDB } from "@/src/config/dbConfig";
import FAQ from "@/src/models/faq";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { question } = await request.json();

        if (!question) {
            return NextResponse.json({ error: "Question is required" }, { status: 400 });
        }

        // Fetch FAQs for context
        const faqs = await FAQ.find({});
        const faqContext = faqs.map(f => `Q: ${f.question} A: ${f.answer}`).join("\n");

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
        }

        const systemPrompt = `You are a helpful AI assistant for the Shopix E-commerce project. 
        Your goal is to provide concise answers (maximum 2 lines) based on the provided FAQ context and general project knowledge.
        Project Functionalities: Marketplace for buying, Store management for sellers, AI analytics, and automated email systems.
        
        FAQ Context:
        ${faqContext}
        
        Rules:
        1. Answer in exactly 1 or 2 lines. Never longer.
        2. If information is not in FAQ or general context, answer politely that you are focusing on Shopix related queries.
        3. Maintain a professional yet friendly tone.`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: question }
                ],
                max_tokens: 100,
                temperature: 0.5
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Groq API Error:", errorData);
            return NextResponse.json({ error: "AI service is currently busy. Please try again later." }, { status: 503 });
        }

        const data = await response.json();
        const answer = data.choices[0]?.message?.content?.trim() || "I'm sorry, I couldn't process that.";

        return NextResponse.json({ success: true, answer });

    } catch (error: any) {
        console.error("Chatbot Error:", error);
        return NextResponse.json({ error: "An unexpected error occurred. Please try again later." }, { status: 500 });
    }
}
