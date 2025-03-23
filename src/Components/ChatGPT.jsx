import { Loader2, Rocket, Sparkles } from "lucide-react";
import { useState } from "react";
import Groq from "groq-sdk";
import { content } from "./prompt";
import { Button } from "./ui/button";
// import { content } from "~/routes/prompt";

const groq = new Groq({
  apiKey: import.meta.env.VITE_APP_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});
const systemPrompt = content;

export default function ChatGPT() {
  const [input, setInput] = useState("");
  const [loader, setLoader] = useState(false);

  const handleGenerateAIContent = async () => {
    if (!input || !input.trim() || loader) return;

    // hit API
    try {
      setLoader(true);

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: input,
          },
        ],
        model: "llama3-70b-8192",
        stream: false,
        temperature: 1,
        max_tokens: 8192,
        top_p: 0.95,
      });

      const response = completion.choices[0];
      console.log("Chat Response: ", response);
      setInput(response?.message?.content);
    } catch (error) {
      console.log("Failed to generate AI response: ", error);
      alert("Failed to generate content.");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div  className="flex justify-center h-fit w-full ">
      <div className="flex flex-col justify-start gap-3 p-2 rounded-lg w-full relative">
        {/* <label htmlFor="content" className="block">
          Enter Content:{" "}
        </label> */}
        <textarea
          id="content"
          value={input}
          placeholder="Enter here"
          onChange={(e) => setInput(e.target.value)}
          className="w-full min-h-96 resize border block rounded-lg bg-background text-foreground text-sm font-normal tracking-wide p-2"
        ></textarea>

<button
  onClick={handleGenerateAIContent}
  className="absolute w-fit right-5 bottom-5 p-2 text-white z-20 flex justify-center items-center active:scale-95 duration-100 transition-all cursor-pointer disabled:bg-gray-400 disabled:active:scale-100 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
  disabled={!input || !input.trim() || loader}
>
  {loader ? (
    <Loader2  className="animate-spin text-button hover:text-button" />
  ) : (
    <Rocket  className="text-button hover:text-button" />
  )}
</button>
      </div>
    </div>
  );
}