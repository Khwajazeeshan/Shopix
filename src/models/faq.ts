import mongoose from "mongoose";

const faqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        default: "General",
    }
}, { timestamps: true });

const FAQ = mongoose.models.FAQs || mongoose.model("FAQs", faqSchema);

export default FAQ;
