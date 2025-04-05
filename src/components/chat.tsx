import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    async function fetchContent() {
      let systemPrompt = `Sử dụng các bài viết được cung cấp được phân cách bằng ba dấu ngoặc kép để trả lời câu hỏi. Nếu không tìm thấy câu trả lời trong các bài viết, chủ động bổ sung thông tin hữu ích. Tìm từ đầy đủ cho từ viết tắt, đánh dấu các từ khóa và thuật ngữ và giải nghĩa bằng từ ngữ phổ thông. Luôn cung cấp câu trả lời rõ ràng, chính xác, và tinh tế.
Ví dụ cách trả lời: 
- """\`NextDNS\` là dịch vụ phân giải tên miền \`Domain Name System resolver\`, chuyển đổi tên miền thành địa chỉ \`IP\`. Ưu điểm của NextDNS là hỗ trợ các giao thức bảo mật như \`DNS over HTTPS (DoH)\` và \`DNS over TLS (DoT)\`, giúp mã hóa các truy vấn DNS và ngăn chặn việc theo dõi. Dịch vụ có máy chủ tại \`Việt Nam\` giúp giảm độ trễ \`ping\`."""
- """WARP là một dịch vụ \`VPN\` tích hợp trong ứng dụng \`1.1.1.1\` của \`Cloudflare\`, cung cấp trải nghiệm truy cập \`Internet\` an toàn và nhanh chóng. Dịch vụ này sử dụng giao thức \`WireGuard\` thông qua \`BoringTun\` để mã hóa toàn bộ lưu lượng truy cập."""
- """\`Mô hình ngôn ngữ lớn (LLM)\` là một mô hình \`thống kê\` được huấn luyện trên một lượng \`dữ liệu\` khổng lồ, có thể được sử dụng để tạo ra và \`dịch văn bản\` cũng như các nội dung khác, và thực hiện các nhiệm vụ \`xử lý ngôn ngữ tự nhiên (NLP)\` ."""
      `;
      // Build prompt based on cardData if provided
      const promptContent =
        cardData && cardData.length > 0
          ? "Các bài viết: \n" +
          cardData
            .map(item => `- """${item.text}"""`)
            .join("\n")
            + `\nCâu hỏi: """${searchTerm}"""`
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
    fetchContent();
  }, [cardData]);

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
      <ReactMarkdown>{displayedText || "Loading..."}</ReactMarkdown>
    </div>
  );
}

export default Chat;