import React, { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import { mockChunks } from "../data/mockData";

// Define ChatProps to accept cardData
interface ChatProps {
  cardData?: {
    md_hash: string;
    title: string;
    text: string;
    created_at: string;
    url: string;
  }[];
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

function Chat({ cardData }: ChatProps) {
  const [generatedText, setGeneratedText] = useState("");
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    async function fetchContent() {
      // Build prompt based on cardData if provided
      const promptContent =
        cardData && cardData.length > 0
          ? "Provide insights on the following items: " +
          cardData
            .map(item => `${item.title} - ${item.text}`)
            .join("; ")
          : "Explain how AI works in detail, including examples, technical insights, and a thorough discussion of underlying algorithms and data processing.";

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