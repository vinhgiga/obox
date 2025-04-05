import { useState, useEffect, useRef } from "react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import { mockChunks } from "../data/mockData";

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
              // Tick icon
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg" className="icon-md-heavy">
                <path fillRule="evenodd" clipRule="evenodd"
                  d="M18.0633 5.67387C18.5196 5.98499 18.6374 6.60712 18.3262 7.06343L10.8262 18.0634C10.6585 18.3095 10.3898 18.4679 10.0934 18.4957C9.79688 18.5235 9.50345 18.4178 9.29289 18.2072L4.79289 13.7072C4.40237 13.3167 4.40237 12.6835 4.79289 12.293C5.18342 11.9025 5.81658 11.9025 6.20711 12.293L9.85368 15.9396L16.6738 5.93676C16.9849 5.48045 17.607 5.36275 18.0633 5.67387Z"
                  fill="currentColor"></path>
              </svg>
            ) : (
              // Copy icon
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg" className="icon-md-heavy">
                <path fillRule="evenodd" clipRule="evenodd"
                  d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z"
                  fill="currentColor"></path>
              </svg>
            )}
          </button>
          <button onClick={refreshHandler} title="Refresh">
            {/* Refresh icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg" className="icon-md">
              <path d="M3.06957 10.8763C3.62331 6.43564 7.40967 3 12 3C14.2824 3 16.4028 3.85067 18.0118 5.25439V4C18.0118 3.44772 18.4595 3 19.0118 3C19.5641 3 20.0118 3.44772 20.0118 4V8C20.0118 8.55228 19.5641 9 19.0118 9H15C14.4477 9 14 8.55228 14 8C14 7.44772 14.4477 7 15 7H16.9571C15.6757 5.76379 13.9101 5 12 5C8.43108 5 5.48466 7.67174 5.0542 11.1237C4.98586 11.6718 4.48619 12.0607 3.93815 11.9923C3.39011 11.924 3.00123 11.4243 3.06957 10.8763ZM20.0618 12.0077C20.6099 12.076 20.9988 12.5757 20.9304 13.1237C20.3767 17.5644 16.5903 21 12 21C9.72322 21 7.60762 20.1535 5.99999 18.7559V20C5.99999 20.5523 5.55228 21 4.99999 21C4.44771 21 3.99999 20.5523 3.99999 20V16C3.99999 15.4477 4.44771 15 4.99999 15H8.99999C9.55228 15 9.99999 15.4477 9.99999 16C9.99999 16.5523 9.55228 17 8.99999 17H7.04285C8.32433 18.2362 10.0899 19 12 19C15.5689 19 18.5153 16.3283 18.9458 12.8763C19.0141 12.3282 19.5138 11.9393 20.0618 12.0077Z"
                fill="currentColor"></path>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default Chat;