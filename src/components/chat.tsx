import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { mockChunks } from "../data/mockData";
import tickIcon from "../assets/tick.svg";
import copyIcon from "../assets/copy.svg";
import refreshIcon from "../assets/refresh.svg";
import { logger } from "../utilities/helpers";

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

// Helper function to get cookie value by name:
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return "";
}

function formatApiKey(apiKey: string): string {
  if (apiKey.length <= 6) return apiKey;
  return apiKey.slice(0, 2) + "..." + apiKey.slice(-4);
}

function Chat({ searchTerm, cardData }: ChatProps) {
  logger("info", "Rendering Chat component");
  const [generatedText, setGeneratedText] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null); // remains for copy timeout

  async function fetchContent(signal: AbortSignal) {
    setIsGenerating(true);
    
    if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
      for (const chunk of mockChunks) {
        setGeneratedText((prev) =>
          prev.slice(-chunk.length) === chunk ? prev : prev + chunk,
        );
        await new Promise((resolve) => setTimeout(resolve, 300)); // simulate delay
      }
      setIsGenerating(false);
      return;
    }

    try {
      let systemPrompt = `Bạn sẽ được cung cấp các tài liệu ngẫu nhiên được đặt trong ba dấu nháy ("""). Tập trung trả lời truy vấn theo các hướng dẫn sau:
      - Đầu tiên, trả lời bằng kiến thức của bạn.
      - Nếu không có tài liệu nào liên quan, hãy trả lời bằng kiến thức của bạn.
      - Bổ sung thông tin tổng quan cho vấn đề.
      Diễn đạt phải chi tiết, đầy đủ và toàn diện. Phân tích sâu sắc các khái niệm và thông tin liên quan bằng từ ngữ phổ thông. Đánh dấu từ khóa, thuật ngữ, từ đầy đủ của từ viết tắt trong dấu backtick. 
      Ví dụ về định dạng: "1. WARP là một mạng riêng ảo (\`Virtual Private Network, VPN\`) tích hợp trong ứng dụng \`1.1.1.1\` của \`Cloudflare\`..."`;

      const promptContent =
        cardData && cardData.length > 0
          ? `Truy vấn: """${searchTerm}"""\n` +
            `Các bài viết: """` +
            cardData.map((item) => `${item.text}`).join("\n---\n") +
            `"""`
          : "Explain how AI works";

      logger("info", "Prompt content:", promptContent);

      const apiKey =
        getCookie("geminiApiKey") || import.meta.env.VITE_GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [{ parts: [{ text: promptContent }] }],
        }),
        signal,
      });
      if (!response.ok) {
        throw new Error(
          "Gemini API key appears broken or limit reached. Get API key from https://aistudio.google.com/apikey and enter your API key below.",
        );
      }
      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      try {
        while (!done) {
          if (signal.aborted) break;
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          const chunk = decoder.decode(value, { stream: true });
          // Process each message in the chunk
          chunk.split("\n\n").forEach((message) => {
            if (signal.aborted) return;
            if (message.startsWith("data: ")) {
              const dataStr = message.replace("data: ", "").trim();
              if (dataStr === "[DONE]") return;
              try {
                const dataObj = JSON.parse(dataStr);
                let candidateText = "";
                if (dataObj.candidates && dataObj.candidates.length > 0) {
                  candidateText =
                    dataObj.candidates[0]?.content?.parts
                      ?.map((part: { text: any }) => part.text)
                      .join("") || "";
                } else if (dataObj.text) {
                  candidateText = dataObj.text;
                }
                if (candidateText) {
                  setGeneratedText((prev) =>
                    prev.endsWith(candidateText) ? prev : prev + candidateText,
                  );
                }
              } catch (error) {
                console.error("JSON parse error:", error);
              }
            }
          });
        }
      } finally {
        reader.releaseLock();
      }
      setIsGenerating(false);
    } catch (err: any) {
      if (!signal.aborted) {
        setError(String(err));
        setIsGenerating(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    setGeneratedText("");
    setDisplayedText("");
    setError("");
    fetchContent(controller.signal);
    return () => {
      controller.abort();
    };
  }, [cardData]);

  const refreshHandler = () => {
    const controller = new AbortController();
    setGeneratedText("");
    setDisplayedText("");
    setError("");
    fetchContent(controller.signal);
  };

  const copyHandler = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = window.setTimeout(() => {
      setCopied(false);
      copyTimeoutRef.current = null;
    }, 2000);
  };

  useEffect(() => {
    let animationFrame: number | null = null;
    let isActive = true;
    let currentText = displayedText;
    let remainingText = generatedText.slice(displayedText.length);
    const animate = () => {
      if (!isActive) return;
      if (remainingText.length > 0) {
        const chunkSize = Math.max(1, Math.round(remainingText.length / 60));
        const textChunk = remainingText.slice(0, chunkSize);
        currentText += textChunk;
        setDisplayedText(currentText);
        remainingText = remainingText.slice(chunkSize);
        animationFrame = requestAnimationFrame(animate);
      }
    };

    if (displayedText.length < generatedText.length) {
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      isActive = false;
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [generatedText, displayedText]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleApiKeySubmit = () => {
    if (newApiKey.trim() !== "") {
      const expires = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toUTCString();
      document.cookie = `geminiApiKey=${newApiKey}; path=/; expires=${expires}`;
      setError("");
      setNewApiKey("");
      refreshHandler();
    }
  };

  return (
    <div>
      {error && error.includes("Gemini API key") ? (
        <div style={{ marginBottom: "10px" }}>
          Gemini API key tạm thời không khả dụng. Truy cập <br></br>
          <a
            className="text-blue-500 hover:underline"
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
          >
            https://aistudio.google.com/apikey
          </a><br></br>
          và nhập API key của bạn vào đây:
          <div className="mt-2 flex gap-2">
            <input
              className="flex-1 rounded-md border-2 border-gray-300 p-1 focus:border-blue-500 focus:outline-none"
              type="text"
              placeholder="Nhập API key"
              value={newApiKey ? formatApiKey(newApiKey) : ""}
              onChange={(e) => setNewApiKey(e.target.value)}
            />
            <button
              className="rounded-md bg-blue-500 p-1 text-white hover:bg-blue-600"
              onClick={handleApiKeySubmit}
            >
              Lưu
            </button>
          </div>
        </div>
      ) : error ? (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      ) : null}
      <ReactMarkdown>{displayedText || "Generating..."}</ReactMarkdown>
      {generatedText && displayedText === generatedText && !isGenerating && (
        <div className="mt-2 flex gap-2">
          <button
            onClick={copyHandler}
            title={copied ? "Copied" : "Copy to clipboard"}
          >
            {copied ? (
              <img src={tickIcon} alt="tick icon" />
            ) : (
              <img src={copyIcon} alt="copy icon" />
            )}
          </button>
          <button onClick={refreshHandler} title="Refresh">
            <img src={refreshIcon} alt="refresh icon" />
          </button>
        </div>
      )}
    </div>
  );
}

export default Chat;
