import { useState, useEffect, useRef } from "react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import { mockChunks } from "../data/mockData";
import copyIcon from "../assets/copy.svg";
import refreshIcon from "../assets/refresh.svg";
import tickIcon from "../assets/tick.svg";

// Define ChatProps to accept cardData
interface ChatProps {
  searchTerm?: string;
  cardData?: {
    md_hash: string;
    title: string;
    text: string;
    created_at: string;
    url: string;
  }[];
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

function Chat({ searchTerm, cardData }: ChatProps) {
  const [generatedText, setGeneratedText] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [copied, setCopied] = useState(false);
  const hasFetched = useRef(false); // added flag

  // Moved fetchContent outside of useEffect for reuse.
  async function fetchContent() {
    if (hasFetched.current) return; // prevent duplicate call
    hasFetched.current = true;

    let systemPrompt = `Bạn sẽ được cung cấp một truy vấn và các bài viết. Suy nghĩ theo quy trình: Tự bạn giải quyết vấn đề. Chỉ đưa ra câu trả lời khi đã giải quyết xong. Sau đó, từ các bài viết, bổ sung thông tin toàn diện cho vấn đề.
Diễn đạt phải chi tiết, đầy đủ và toàn diện. Phân tích sâu sắc các khái niệm và thông tin liên quan bằng từ ngữ phổ biến. Đánh dấu từ khóa, thuật ngữ, từ đầy đủ của từ viết tắt trong dấu backtick. 
Ví dụ về định dạng câu trả lời: "WARP là một dịch vụ \`VPN\` tích hợp trong ứng dụng \`1.1.1.1\` của \`Cloudflare\`, cung cấp trải nghiệm truy cập \`Internet\` an toàn và nhanh chóng. Dịch vụ này sử dụng giao thức \`WireGuard\` thông qua \`BoringTun\` để mã hóa toàn bộ lưu lượng truy cập..."`;

    // Build prompt based on cardData if provided
    const promptContent =
      cardData && cardData.length > 0
        ? `Truy vấn: """${searchTerm}"""\n` + `Các bài viết: """` +
        cardData
          .map(item => `${item.text}`)
          .join("\n---\n") + `"""`
        : "Explain how AI works in detail, including examples, technical insights, and a thorough discussion of underlying algorithms and data processing.";

    console.log("Prompt Content:", promptContent); // Debugging line

    if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
      // Using mock API response to save api cost with longer text
      for (const chunk of mockChunks) {
        // Append chunk only if not duplicate
        setGeneratedText(prev =>
          prev.slice(-chunk.length) === chunk ? prev : prev + chunk
        );
        await new Promise(resolve => setTimeout(resolve, 300)); // simulate delay
      }
    } else {
      const response = await ai.models.generateContentStream({
        model: "gemini-2.0-flash",
        contents: promptContent,
        config: {
          systemInstruction: systemPrompt,
        }
      });
      for await (const chunk of response) {
        setGeneratedText(prev => {
          const text = chunk.text ?? "";
          return prev.slice(-text.length) === text ? prev : prev + text;
        });
      }
    }
  }

  // Re-run fetchContent on cardData changes.
  useEffect(() => {
    // Reset state on new cardData
    setGeneratedText("");
    setDisplayedText("");
    hasFetched.current = false;
    fetchContent();
  }, [cardData, searchTerm]);

  // Refresh: reset text and re-run fetchContent.
  const refreshHandler = () => {
    setGeneratedText("");
    setDisplayedText("");
    hasFetched.current = false;
    fetchContent();
  };

  // Copy generated text to clipboard.
  const copyHandler = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Typing animation: gradually update displayedText until it catches up with generatedText
  useEffect(() => {
    if (displayedText.length < generatedText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(generatedText.slice(0, displayedText.length + 1));
      }, 5);
      return () => clearTimeout(timeout);
    }
  }, [generatedText, displayedText]);

  return (
    <div>
      <ReactMarkdown>{displayedText || "Generating..."}</ReactMarkdown>
  
      {displayedText === generatedText && generatedText !== "" && (
        <div className="flex mt-2 gap-2">
          <button onClick={copyHandler} title={copied ? "Copied" : "Copy to clipboard"}>
            {copied ? (
              <img src={tickIcon}></img>
            ) : (
            
              <img src={copyIcon}></img>
            )}
          </button>
          <button onClick={refreshHandler} title="Refresh">
            <img src={refreshIcon}></img>
          </button>
        </div>
      )}
    </div>
  );
}

export default Chat;