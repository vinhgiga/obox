import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QueryBar from "../components/queryBar";
import { Status, MessageData, ThreadData, SectionData } from "../typing";
import ChatDisplay from "../components/chat-display";

import {
  logger,
  generateId,
  fetchSections,
  generateContentStream,
  animatedResponseGenerator,
} from "../utils/helpers";
import { useAppContext } from "../context/AppContext";
import Header from "../components/header";
import SideBar from "../components/sidebar";
import Section from "../components/section";
import { IconButton } from "../components/icon-button";
import closeIcon from "../assets/close.svg?raw";

const ChatPage: React.FC = () => {
  const {
    isSearchEnable,
    isReasonEnable,
    searchId,
    setSearchId,
    isSourceBarOpen,
    setIsSourceBarOpen,
    sidebarOpen,
    toggleSidebar,
    pendingMessage,
    setPendingMessage,
    chatAction,
  } = useAppContext();

  const { id } = useParams<{ id: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingMessageId, setProcessingMessageId] = useState<string | null>(
    null,
  );

  const [chatMessages, setChatMessages] = useState<MessageData[]>([]);
  const [sources, setSources] = useState<SectionData[]>([]);

  const [chatMessageStatus, setMessageStatus] = useState<Status>(
    Status.Loading,
  );
  const [sourceStatus, setSourceStatus] = useState<Status>(Status.Loading);

  const createEmptyModelMessage = (): MessageData => {
    if (!id) {
      throw new Error("Thread ID is required to create an empty model message");
    }
    return {
      id: generateId(),
      threadId: id,
      text: "",
      role: "model",
      createdAt: new Date().toISOString(),
    };
  };

  const handleCloseSourceBar = () => {
    setIsSourceBarOpen(false);
    setSearchId(null);
  };

  // Process model response generation
  const generateModelResponse = async (
    chatMessages: MessageData[],
    processingMessage: MessageData | null,
  ) => {
    if (!id)
      throw new Error("Thread ID is required to generate model response");
    if (!processingMessage) throw new Error("Processing message is required");

    setProcessingMessageId(processingMessage.id);

    logger("info", "Generating model response for message:", processingMessage);
    if (isGenerating) return;
    setIsGenerating(true);
    let systemInstruction: string = `"Bạn là trợ lý Obox. Tập trung trả lời truy vấn theo các hướng dẫn sau:
- Diễn đạt phải chi tiết, đầy đủ và toàn diện. Phân tích sâu sắc các khái niệm và thông tin liên quan bằng từ ngữ phổ thông. Đánh dấu từ khóa, thuật ngữ, từ đầy đủ của từ viết tắt trong dấu backtick. 
Ví dụ về định dạng: "1. WARP là một mạng riêng ảo (\`Virtual Private Network, VPN\`) tích hợp trong ứng dụng \`1.1.1.1\` của \`Cloudflare\`..."`;

    // find & slice against the chosen array
    const processingIndex = chatMessages.findIndex(
      (msg) => msg.id === processingMessage.id,
    );
    if (processingIndex < 0) {
      throw new Error("Processing message not found in chat messages");
    }
    let messagesForModel = chatMessages.slice(0, processingIndex + 1);
    // Remove consecutive messages of the same role (keep only the last message in each sequence)
    // Also remove the last message if it's a model message
    messagesForModel = messagesForModel.filter((msg, index, array) => {
      // For the last message, keep it only if it's NOT a model message
      if (index === array.length - 1) return msg.role !== "model";

      // Keep the message only if the next message has a different role
      return msg.role !== array[index + 1].role;
    });

    // 3. Format messages for the API
    const formattedMessages = messagesForModel.map((msg) => ({
      role: msg.role as "user" | "model",
      parts: [{ text: msg.text }],
    }));

    // 4. Add search context if enabled
    const lastUserMessage = formattedMessages[formattedMessages.length - 1];
    const lastUserMessageText = lastUserMessage.parts[0].text;
    if (isSearchEnable) {
      // perform search
      try {
        const searchResults = await fetchSections(lastUserMessageText);
        logger("info", "Search results:", searchResults);

        if (!searchResults || searchResults.length === 0) {
          logger("info", "No search results found");
        } else {
          const newsearchId = generateId();
          // update the processing message with the searchId
          processingMessage.searchId = newsearchId;
          setChatMessages((prev) =>
            prev.map((msg) =>
              msg.id === processingMessage.id ? processingMessage : msg,
            ),
          );
          // save search results to localStorage
          localStorage.setItem(
            `search_${newsearchId}`,
            JSON.stringify(searchResults),
          );
          setSearchId(newsearchId);
          // update the last formatted message with the search results
          const updatedPrompt =
            `Truy vấn: """${lastUserMessageText}"""\n\n<sources>\n` +
            searchResults
              .map((section: SectionData) => section.text)
              .join("\n---\n") +
            "\n</sources>";
          logger("info", "Updated prompt:", updatedPrompt);
          lastUserMessage.parts[0].text = updatedPrompt;
          // update system instruction
          systemInstruction = `Bạn là trợ lý Obox. Bạn được cung cấp tài liệu ngẫu nhiên được đặt trong thẻ XML có định dạng sau:
<sources>
Nguồn 1
---
Nguồn 2
</sources>.

Tập trung trả lời truy vấn đặt trong ba dấu nháy kép (""") theo các hướng dẫn sau:
- Đầu tiên, trả lời truy vấn bằng kiến thức của bạn.
- Nếu không có tài liệu liên quan đến truy vấn, hãy trả lời truy vấn bằng kiến thức của bạn.
- Đảm bảo câu trả lời phải liên quan đến truy vấn.
- Diễn đạt chi tiết, đầy đủ và toàn diện. Phân tích làm rõ sâu sắc các khái niệm và thông tin liên quan bằng từ ngữ phổ thông. Đánh dấu từ khóa, thuật ngữ, từ đầy đủ của từ viết tắt trong dấu backtick. 
Ví dụ về định dạng: "1. WARP là một mạng riêng ảo (\`Virtual Private Network, VPN\`) tích hợp trong ứng dụng \`1.1.1.1\` của \`Cloudflare\`..."`;
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    }

    const modelName = isReasonEnable
      ? "gemini-2.5-flash-preview-04-17"
      : "gemini-2.0-flash";

    // 4. Generate response
    try {
      await animatedResponseGenerator(
        async function* () {
          const stream = generateContentStream(
            systemInstruction,
            formattedMessages,
            { signal: new AbortController().signal, modelName: modelName },
          );

          for await (const chunk of stream) {
            yield chunk;
          }
        },
        {
          onUpdate: (fullText) => {
            // Update the model's message with the accumulated text
            setChatMessages((prev) =>
              prev.map((msg) =>
                msg.id === processingMessage.id
                  ? { ...msg, text: fullText }
                  : msg,
              ),
            );
          },
          onFinish: (fullText) => {
            logger("info", "Save final response:\n", fullText);
            // Save final response
            setChatMessages((prev) => {
              const updatedMessages = prev.map((msg) =>
                msg.id === processingMessage.id
                  ? { ...msg, text: fullText }
                  : msg,
              );

              // Save to localStorage
              localStorage.setItem(
                `messages_${id}`,
                JSON.stringify(updatedMessages),
              );
              return updatedMessages;
            });

            setIsGenerating(false);
            // Clear pending message after processing
            setPendingMessage(null);
          },
          onError: (error) => {
            console.error("Error generating response:", error);
            setChatMessages((prev) =>
              prev.map((msg) =>
                msg.id === processingMessage.id
                  ? {
                      ...msg,
                      text: "Error generating response. Please try again.",
                    }
                  : msg,
              ),
            );
            setIsGenerating(false);
            setPendingMessage(null);
          },
        },
      );
    } catch (error) {
      console.error("Error in model response generation:", error);
      setIsGenerating(false);
      setPendingMessage(null);
    }
  };

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [chatMessages]);

  useEffect(() => {
    setIsSourceBarOpen(false);
    setSearchId(null);
    setSources([]);
    // Load chat messages from localStorage for existing threads
    logger("info", "Loading messages for thread ID:", id);
    try {
      const savedMessages = localStorage.getItem(`messages_${id}`);
      if (savedMessages) {
        const messages = JSON.parse(savedMessages) as MessageData[];
        logger("info", "Loaded messages:", messages);
        setChatMessages(messages);
      } else {
        // New empty thread
        setChatMessages([]);
      }
      setMessageStatus(Status.FinishedSuccessfully);
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 200);

      // Clear timeout on cleanup
      return () => clearTimeout(timeoutId);
    } catch (error) {
      setMessageStatus(Status.FinishedError);
      throw new Error("Error loading messages:" + String(error));
    }
  }, [id]);

  // Listen for changes searchId
  useEffect(() => {
    if (!searchId) {
      logger("info", "No searchId to process");
      return;
    }
    // Fetch search results from localStorage
    const searchResults = localStorage.getItem(`search_${searchId}`);
    if (searchResults) {
      const parsedResults = JSON.parse(searchResults) as SectionData[];
      logger("info", "Parsed search results:", parsedResults);
      setSources(parsedResults);
      setSourceStatus(Status.FinishedSuccessfully);
    } else {
      logger("info", "No search results found for searchId:", searchId);
    }
  }, [searchId]);

  // Listen for pending chat
  useEffect(() => {
    if (!pendingMessage) {
      logger("info", "No pending message to process");
      return;
    }
    if (!chatAction) {
      logger("info", "No chat action to process");
      return;
    }
    logger("info", "Pending message:", pendingMessage);

    let messages: MessageData[] = [];
    let processingMessage: MessageData | null = null;

    if (chatAction === "new") {
      const modelMessage = createEmptyModelMessage();
      messages = [pendingMessage, modelMessage];
      setChatMessages(messages);
      processingMessage = modelMessage;
    } else if (chatAction === "append") {
      logger("info", "Appending message action:", pendingMessage);
      const modelMessage = createEmptyModelMessage();
      messages = [...chatMessages, pendingMessage, modelMessage];
      setChatMessages(messages);
      processingMessage = modelMessage;
    } else if (chatAction === "user_refresh") {
      logger("info", "Refreshing user message action:", pendingMessage);
    } else if (chatAction === "bot_refresh") {
      logger("info", "Refreshing bot message action:", pendingMessage);
      const pendingIndex = chatMessages.findIndex(
        (msg) => msg.id === pendingMessage.id,
      );
      // append model message after the pending message
      if (pendingIndex >= 0) {
        const modelMessage = createEmptyModelMessage();
        messages = [
          ...chatMessages.slice(0, pendingIndex + 1),
          modelMessage,
          ...chatMessages.slice(pendingIndex + 1),
        ];
        setChatMessages(messages);
        processingMessage = modelMessage;
      }
    } else {
      throw new Error("Invalid chat action");
    }
    generateModelResponse(messages, processingMessage);
    return;
  }, [chatAction, pendingMessage]);

  return (
    <div className="relative flex overflow-hidden">
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-20 ${sidebarOpen ? "" : "hidden"} bg-black bg-opacity-70 md:hidden`}
        onClick={toggleSidebar}
      ></div>
      {/* Sidebar */}
      <div
        className={`sidebar fixed inset-0 shrink-0 transform duration-300 md:z-0 ${sidebarOpen ? "z-30 max-md:translate-x-0" : "max-md:-translate-x-full"}`}
      >
        <SideBar />
      </div>
      {/* Main Content */}
      <div
        className={`main-content z-10 flex h-screen w-full flex-1 grow flex-col transition-[margin] duration-300 ease-in-out ${isSourceBarOpen ? "lg:mr-[400px]" : "mr-0"} ${sidebarOpen ? "md:ml-[var(--sidebar-width)]" : "ml-0"}`}
      >
        <div className="scrollbar-gutter w-full">
          <Header />
        </div>
        <div className="scrollbar-gutter flex-1">
          <div className="mx-auto mb-16 max-w-2xl">
            {/* Render chat messages here */}
            {chatMessageStatus !== Status.Loading && (
              <ChatDisplay
                messages={chatMessages}
                isGenerating={isGenerating}
                processingMessageId={processingMessageId}
              />
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="scrollbar-gutter sticky bottom-0 z-20 w-full">
          <div className="flex w-full flex-col items-center">
            <div className="w-full max-w-2xl pb-1">
              <QueryBar threadId={id} isGenerating={isGenerating} />
            </div>
            <div className="m-2 text-xs">
              {chatMessages.length > 0 &&
                `${chatMessages.length} messages${isGenerating ? " • Generating..." : ""}`}
              {chatMessages.length === 0 &&
                chatMessageStatus !== Status.Loading &&
                "Start a conversation"}
            </div>
          </div>
        </div>
      </div>

      {/* Source bar */}
      {sourceStatus !== Status.Loading && (
        <>
          {/* Source overlay */}
          <div
            className={`fixed inset-0 z-30 ${isSourceBarOpen ? "" : "hidden"} bg-black bg-opacity-70 lg:hidden`}
            onClick={handleCloseSourceBar}
          ></div>
          <div
            className={`surface-primary fixed flex shrink-0 flex-col ${isSourceBarOpen ? "" : "hidden"} border-primary top-1/2 z-[40] h-[70vh] min-h-[300px] overflow-hidden rounded-xl max-lg:inset-x-4 max-lg:-translate-y-1/2 max-lg:transform lg:right-0 lg:top-0 lg:z-0 lg:h-full lg:w-[400px] lg:rounded-none lg:border-l`}
          >
            <div className="scrollbar-gutter flex h-[70px] shrink-0 items-center justify-between overflow-hidden">
              <h2 className="text-lg font-bold">Nguồn</h2>
              <IconButton
                icon={closeIcon}
                iconSize="0.875rem"
                className="icon-btn h-6 w-6"
                onClick={handleCloseSourceBar}
              />
            </div>
            <div className="scrollbar-gutter section-container my-2">
              {sources.length > 0 ? (
                sources.map((section, idx) => (
                  <div
                    className={`animate-fade-in opacity-0`}
                    key={idx}
                    style={{
                      animationDuration: "200ms",
                      animationDelay: `${idx * 50 + 300}ms`,
                      animationFillMode: "forwards",
                      animationIterationCount: 1,
                    }}
                  >
                    <Section
                      key={idx}
                      title={section.title}
                      url={section.url}
                      text={section.text}
                    />
                  </div>
                ))
              ) : (
                <p>No sources found.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatPage;
