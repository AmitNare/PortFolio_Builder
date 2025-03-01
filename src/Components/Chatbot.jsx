import { useState } from "react";
import axios from "axios";

export default function Chatbot() {
    const [message, setMessage] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim()) return;
        setLoading(true);
        setResponse("Thinking...");

        try {
            const res = await axios.post(
                "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
                { inputs: message },
                { headers: { Authorization: "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" } } // Replace with your API key
            );
            setResponse(res.data.generated_text || "No response.");
        } catch (error) {
            setResponse("Error: Unable to get response.");
        }

        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center p-4">
            <input
                type="text"
                placeholder="Ask AI anything..."
                className="border p-2 w-80 rounded"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
            />
            <button
                onClick={handleSubmit}
                className="mt-2 bg-blue-500 text-white p-2 rounded"
                disabled={loading}
            >
                {loading ? "Loading..." : "Send"}
            </button>
            <textarea
                className="border p-2 w-80 mt-4 h-20"
                value={response}
                readOnly
            />
        </div>
    );
}
