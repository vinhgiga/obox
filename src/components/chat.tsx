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

function Chat({ searchTerm, cardData }: ChatProps) {
  logger("info", "Rendering Chat component");
  const [generatedText, setGeneratedText] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const hasFetched = useRef(false); // added flag
  const abortController = useRef<AbortController | null>(null);

  async function fetchContent() {
    if (hasFetched.current) return; // prevent duplicate call
    hasFetched.current = true;
    setError("");

    // Create a new AbortController for this request.
    abortController.current = new AbortController();

    try {
      let systemPrompt = `Bạn sẽ được cung cấp một truy vấn và các bài viết. Suy nghĩ theo quy trình: Tự bạn giải quyết vấn đề. Chỉ đưa ra câu trả lời khi đã giải quyết xong. Sau đó, từ các bài viết, bổ sung thông tin toàn diện cho vấn đề.
      Diễn đạt phải chi tiết, đầy đủ và toàn diện. Phân tích sâu sắc các khái niệm và thông tin liên quan bằng từ ngữ phổ biến. Đánh dấu từ khóa, thuật ngữ, từ đầy đủ của từ viết tắt trong dấu backtick. 
      Ví dụ về định dạng câu trả lời: "WARP là một dịch vụ \`VPN\` tích hợp trong ứng dụng \`1.1.1.1\` của \`Cloudflare\`, cung cấp trải nghiệm truy cập \`Internet\` an toàn và nhanh chóng. Dịch vụ này sử dụng giao thức \`WireGuard\` thông qua \`BoringTun\` để mã hóa toàn bộ lưu lượng truy cập..."`;

      // Build prompt based on cardData if provided
      const promptContent =
        cardData && cardData.length > 0
          ? `Truy vấn: """${searchTerm}"""\n` +
          `Các bài viết: """` +
          cardData.map(item => `${item.text}`).join("\n---\n") +
          `"""`
          : "Explain how AI works in detail, including examples, technical insights, and a thorough discussion of underlying algorithms and data processing.";

      logger("info", "Prompt content:", promptContent);

      // Get API key either from cookie or fallback to env variable.
      const apiKey = getCookie("geminiApiKey") || import.meta.env.VITE_GEMINI_API_KEY;

      if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
        for (const chunk of mockChunks) {
          setGeneratedText(prev =>
            prev.slice(-chunk.length) === chunk ? prev : prev + chunk
          );
          await new Promise(resolve => setTimeout(resolve, 300)); // simulate delay
        }
      } else {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site"
          },
          body: JSON.stringify({
            "system_instruction": {
              "parts": [
                { text: systemPrompt }
              ]
            },
            contents: [
              { parts: [{ text: promptContent }] }
            ]
          }),
          signal: abortController.current.signal
        });
        if (!response.ok) {
          // Update error message with instructions.
          throw new Error("Gemini API key appears broken or limit reached. Get API key from https://aistudio.google.com/apikey and enter your API key below.");
        }
        if (!response.body) {
          throw new Error("Response body is null");
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          const chunk = decoder.decode(value, { stream: true });
          chunk.split("\n\n").forEach(message => {
            if (message.startsWith("data: ")) {
              const dataStr = message.replace("data: ", "").trim();
              if (dataStr === "[DONE]") return;
              try {
                const dataObj = JSON.parse(dataStr);
                let candidateText = "";
                if (dataObj.candidates && dataObj.candidates.length > 0) {
                  candidateText = dataObj.candidates[0]?.content?.parts
                    ?.map((part: { text: any; }) => part.text)
                    .join("") || "";
                } else if (dataObj.text) {
                  candidateText = dataObj.text;
                }
                if (candidateText) {
                  setGeneratedText(prev =>
                    prev.endsWith(candidateText) ? prev : prev + candidateText
                  );
                }
              } catch (error) {
                console.error("JSON parse error:", error);
              }
            }
          });
        }
      }
    } catch (err) {
      setError(String(err));
    }
  }

  useEffect(() => {
    abortController.current?.abort();
    hasFetched.current = false;
    setGeneratedText("");
    setDisplayedText("");
    setError("");
    fetchContent();
    return () => abortController.current?.abort();
  }, [cardData]);

  const refreshHandler = () => {
    setGeneratedText("");
    setDisplayedText("");
    setError("");
    hasFetched.current = false;
    fetchContent();
  };

  const copyHandler = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (displayedText.length < generatedText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(generatedText.slice(0, displayedText.length + 1));
      }, 5);
      return () => clearTimeout(timeout);
    }
  }, [generatedText, displayedText]);

  // Handler to update and store new API key via cookie
  const handleApiKeySubmit = () => {
    if (newApiKey.trim() !== "") {
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `geminiApiKey=${newApiKey}; path=/; expires=${expires}`;
      setError("");
      setNewApiKey("");
      refreshHandler();
    }
  };

  return (
    <div>
      {error && error.includes("Gemini API key") ? (
        <div style={{ marginBottom: '10px' }}>
          Gemini API key appears broken or limit reached. Get API key from{" "}
          <a className="text-blue-500 hover:underline"
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
          >
            https://aistudio.google.com/apikey
          </a>{" "}
          and enter your API key below.
          <div className="mt-2 flex gap-2">
            <input className="flex-1 border-2 border-gray-300 rounded-md p-1 focus:border-blue-500 focus:outline-none"
              type="password"
              placeholder="Enter new API key"
              value={newApiKey}
              onChange={e => setNewApiKey(e.target.value)}
            />
            <button className="bg-blue-500 text-white rounded-md p-1 hover:bg-blue-600"
              onClick={handleApiKeySubmit}>Save API Key</button>
          </div>
        </div>
      ) : error ? (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      ) : null}
      <ReactMarkdown>{displayedText || "Generating..."}</ReactMarkdown>
      {displayedText === generatedText && generatedText !== "" && (
        <div className="flex mt-2 gap-2">
          <button onClick={copyHandler} title={copied ? "Copied" : "Copy to clipboard"}>
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