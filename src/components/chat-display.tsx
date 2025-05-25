import React, { useState, useRef, useEffect } from "react";
import { MessageData } from "../typing";
import { useAppContext } from "../context/AppContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // GitHub Flavored Markdown support
import rehypeRaw from "rehype-raw"; // Allows rendering of HTML in markdown
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { logger } from "../utils/helpers";
import { IconButton } from "./icon-button";
import replayIcon from "../assets/replay.svg?raw";
import copyIcon from "../assets/copy.svg?raw";
import tickIcon from "../assets/tick.svg?raw"; // Add tick/checkmark icon

interface ChatDisplayProps {
  messages: MessageData[];
  isGenerating: boolean;
  processingMessageId?: string | null;
  onRegenerateMessage?: (messageId: string) => void;
}

interface ProcessedMessage extends MessageData {
  hasMultiple: boolean;
  previousMessages: MessageData[];
}

function processMessagesForDisplay(
  messages: MessageData[],
): ProcessedMessage[] {
  if (!messages || messages.length === 0) return [];

  // Use messages directly without sorting - assuming they're already in desired order
  const messagesArray = [...messages];

  const result: ProcessedMessage[] = [];
  let i = 0;

  while (i < messagesArray.length) {
    const currentMsg = messagesArray[i];
    let nextIndex = i + 1;

    // Find consecutive messages with the same role
    const sameRoleMessages = [currentMsg];
    while (
      nextIndex < messagesArray.length &&
      messagesArray[nextIndex].role === currentMsg.role
    ) {
      sameRoleMessages.push(messagesArray[nextIndex]);
      nextIndex++;
    }

    // Get the message with the latest createdAt timestamp from the same role group
    const latestMsg = sameRoleMessages.reduce((latest, current) => {
      // Optimize by directly returning objects if timestamps are missing
      if (!latest.createdAt) return current;
      if (!current.createdAt) return latest;

      // Only convert timestamps when both values exist
      const latestTime = new Date(latest.createdAt).getTime();
      const currentTime = new Date(current.createdAt).getTime();
      return currentTime > latestTime ? current : latest;
    }, sameRoleMessages[0]);

    // Add the latest message to the result
    const hasMultiple = sameRoleMessages.length > 1;
    result.push({
      ...latestMsg,
      hasMultiple,
      previousMessages: hasMultiple
        ? sameRoleMessages
            .filter((msg) => msg.id !== latestMsg.id)
            .sort((a, b) => {
              // Apply the same optimization to sorting
              if (!a.createdAt) return 1; // Move items without timestamps to the end
              if (!b.createdAt) return -1;

              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            })
        : [],
    });

    // Move to the next group of messages
    i = nextIndex;
  }

  return result;
}

const ChatDisplay: React.FC<ChatDisplayProps> = ({
  messages,
  isGenerating,
  processingMessageId,
}) => {
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<string>>(
    new Set(),
  );
  const [copiedMessageIds, setCopiedMessageIds] = useState<Set<string>>(
    new Set(),
  );

  // Create a ref to store timeout IDs for each message
  const timeoutRefsMap = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup timeouts when component unmounts
  useEffect(() => {
    return () => {
      // Clear all timeouts when component unmounts
      timeoutRefsMap.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
    };
  }, []);

  const {
    isSourceBarOpen,
    setIsSourceBarOpen,
    searchId,
    setSearchId,
    setPendingMessage,
    setChatAction,
  } = useAppContext();

  const processedMessages = processMessagesForDisplay(messages);

  const toggleExpand = (messageId: string) => {
    setExpandedMessageIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handleRegenerate = (message: MessageData) => {
    setPendingMessage(message);
    setChatAction("bot_refresh");
  };

  const handleCopy = (message: MessageData) => {
    // Clear any existing timeout for this message
    if (timeoutRefsMap.current.has(message.id)) {
      clearTimeout(timeoutRefsMap.current.get(message.id));
      timeoutRefsMap.current.delete(message.id);
    }

    navigator.clipboard
      .writeText(message.text)
      .then(() => {
        // Set this message as copied
        setCopiedMessageIds((prev) => new Set(prev).add(message.id));

        // Set new timeout and store the reference
        const timeoutId = setTimeout(() => {
          setCopiedMessageIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(message.id);
            return newSet;
          });
          // Remove the timeout reference after it completes
          timeoutRefsMap.current.delete(message.id);
        }, 3000);

        // Store the timeout ID in our map
        timeoutRefsMap.current.set(message.id, timeoutId);

        logger("info", "Text copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const handleShowSource = (messageSearchId: string | undefined) => {
    logger(
      "info",
      "handleShowSource called with messageSearchId:",
      messageSearchId,
    );
    logger("info", "Current searchId:", searchId);
    if (isSourceBarOpen && messageSearchId === searchId) {
      setIsSourceBarOpen(false);
      setSearchId("");
      return;
    }
    logger(
      "info",
      "Showing source for message with searchId:",
      messageSearchId,
    );
    setIsSourceBarOpen(true);
    setSearchId(messageSearchId);
  };

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4">
        <p className="text-primary">No messages yet. Start a conversation!</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-4">
        {processedMessages.map((message) => (
          <div
            key={message.id}
            className="text-primary mb-4 flex max-w-4xl flex-col items-end"
          >
            {message.role === "user" ? (
              <div className="bg-user-message text-message relative flex min-h-8 max-w-[70%] flex-col whitespace-normal break-words rounded-3xl px-5 py-2.5 text-start text-base">
                {message.text}
              </div>
            ) : (
              <div className="flex w-full flex-col items-start">
                {/* Assistant message */}
                {isGenerating && processingMessageId === message.id && (
                  <div className="flex w-full">
                    <div className="loading-shimmer">Đang thực hiện</div>
                  </div>
                )}
                {message.searchId && (
                  <button
                    className="icon-btn"
                    onClick={() => handleShowSource(message.searchId)}
                  >
                    Nguồn
                  </button>
                )}

                <div className="w-full">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const [isCopied, setIsCopied] = useState(false);

                        const handleCopyCode = () => {
                          const code = String(children).replace(/\n$/, "");
                          navigator.clipboard
                            .writeText(code)
                            .then(() => {
                              setIsCopied(true);
                              setTimeout(() => setIsCopied(false), 2000);
                            })
                            .catch((err) =>
                              console.error("Failed to copy code:", err),
                            );
                        };

                        return !inline && match ? (
                          <div className="relative">
                            <button
                              onClick={handleCopyCode}
                              className="absolute right-2 top-2 z-10 rounded bg-gray-700 px-2 py-1 text-xs text-white hover:bg-gray-600"
                            >
                              {isCopied ? "Copied!" : "Copy"}
                            </button>
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code
                            className="rounded bg-[var(--color-highlight)] px-1"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      ol({ ordered, ...props }) {
                        return (
                          <ol className="my-2 ml-6 list-decimal" {...props} />
                        );
                      },
                      ul({ ...props }) {
                        return (
                          <ul className="my-2 ml-6 list-disc" {...props} />
                        );
                      },
                      li({ ...props }) {
                        return <li className="mb-1" {...props} />;
                      },
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                </div>
                {/* Chat controls */}
                <div className="mt-2 flex h-[40px] gap-2">
                  {!isGenerating && (
                    <>
                      <IconButton
                        icon={replayIcon}
                        className="icon-btn"
                        onClick={() => handleRegenerate(message)}
                        text="Viết lại"
                      />
                      <IconButton
                        icon={
                          copiedMessageIds.has(message.id) ? tickIcon : copyIcon
                        }
                        className="icon-btn"
                        onClick={() => handleCopy(message)}
                        text={
                          copiedMessageIds.has(message.id) ? "Đã lưu!" : "Sao chép"
                        }
                      />
                    </>
                  )}
                </div>

                {/* Previous messages (if any) */}
                {message.hasMultiple && (
                  <div className="mt-2 w-full">
                    <button
                      onClick={() => toggleExpand(message.id)}
                      className="btn-text-action"
                    >
                      {expandedMessageIds.has(message.id) ? "Hide" : "Show"}{" "}
                      {message.previousMessages.length} previous message
                      {message.previousMessages.length > 1 ? "s" : ""}
                    </button>

                    {expandedMessageIds.has(message.id) && (
                      <div>
                        {message.previousMessages.map((prevMsg) => (
                          <div key={prevMsg.id} className="block-quote">
                            {prevMsg.searchId && (
                              <IconButton
                                className="icon-btn"
                                onClick={() =>
                                  handleShowSource(prevMsg.searchId)
                                }
                                text="Nguồn"
                              />
                            )}
                            <div>
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                  code({
                                    node,
                                    inline,
                                    className,
                                    children,
                                    ...props
                                  }) {
                                    const match = /language-(\w+)/.exec(
                                      className || "",
                                    );
                                    const [isCopied, setIsCopied] =
                                      useState(false);

                                    const handleCopyCode = () => {
                                      const code = String(children).replace(
                                        /\n$/,
                                        "",
                                      );
                                      navigator.clipboard
                                        .writeText(code)
                                        .then(() => {
                                          setIsCopied(true);
                                          setTimeout(
                                            () => setIsCopied(false),
                                            2000,
                                          );
                                        })
                                        .catch((err) =>
                                          console.error(
                                            "Failed to copy code:",
                                            err,
                                          ),
                                        );
                                    };

                                    return !inline && match ? (
                                      <div className="relative">
                                        <button
                                          onClick={handleCopyCode}
                                          className="absolute right-2 top-2 z-10 rounded bg-gray-700 px-2 py-1 text-xs text-white hover:bg-gray-600"
                                        >
                                          {isCopied ? "Copied!" : "Copy"}
                                        </button>
                                        <SyntaxHighlighter
                                          style={vscDarkPlus}
                                          language={match[1]}
                                          PreTag="div"
                                          {...props}
                                        >
                                          {String(children).replace(/\n$/, "")}
                                        </SyntaxHighlighter>
                                      </div>
                                    ) : (
                                      <code
                                        className="rounded bg-[var(--color-surface-secondary)] px-1"
                                        {...props}
                                      />
                                    );
                                  },
                                  ol({ ordered, ...props }) {
                                    return (
                                      <ol
                                        className="my-2 ml-6 list-decimal"
                                        {...props}
                                      />
                                    );
                                  },
                                  ul({ ...props }) {
                                    return (
                                      <ul
                                        className="my-2 ml-6 list-disc"
                                        {...props}
                                      />
                                    );
                                  },
                                  li({ ...props }) {
                                    return <li className="mb-1" {...props} />;
                                  },
                                }}
                              >
                                {prevMsg.text}
                              </ReactMarkdown>
                            </div>
                            {!isGenerating && (
                              <IconButton
                                icon={
                                  copiedMessageIds.has(prevMsg.id)
                                    ? tickIcon
                                    : copyIcon
                                }
                                className="icon-btn"
                                onClick={() => handleCopy(prevMsg)}
                                text={
                                  copiedMessageIds.has(prevMsg.id)
                                    ? "Đã lưu!"
                                    : "Sao chép"
                                }
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatDisplay;
