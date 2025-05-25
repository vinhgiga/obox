import React from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useState, FormEvent, useEffect } from "react";
import { logger, generateId } from "../utils/helpers";
import { useNavigate } from "react-router-dom";
import { MessageData, ThreadData } from "../typing";
import { useAppContext } from "../context/AppContext";
import { IconButton } from "./icon-button";
import searchSourceIcon from "../assets/search-source.svg?raw";
import reasonIcon from "../assets/reason.svg?raw";
import submitIcon from "../assets/submit.svg?raw";
import { useKeyboardDetection } from "../hooks/useKeyboardDetection";

const QueryBar: React.FC<{
  threadId?: string;
  isGenerating?: boolean;
  suggestedQuery?: string;
  onSuggestionUsed?: () => void;
}> = ({
  threadId,
  isGenerating = false,
  suggestedQuery = "",
  onSuggestionUsed,
}) => {
  const [userQuery, setUserQuery] = useState("");
  const navigate = useNavigate();
  const isVirtualKeyboard = useKeyboardDetection();
  const {
    isSearchEnable,
    setIsSearchEnable,
    isReasonEnable,
    setIsReasonEnable,
    setPendingMessage,
    setChatAction,
    setThreads,
  } = useAppContext();

  const isEmptyQuery = userQuery.trim() === "";
    const isExceedingMaxLength = userQuery.length > 5000;
    const isSubmitDisabled =
      isEmptyQuery || isExceedingMaxLength || isGenerating;

  const handleQuery = (query: string) => {
    const isEmptyQuery = query.trim() === "";
    const isExceedingMaxLength = query.length > 5000;
    const isSubmitDisabled =
      isEmptyQuery || isExceedingMaxLength || isGenerating;
    if (isSubmitDisabled) {
      return;
    }
    logger("info", "User query submitted:", query);

    // 1. Create user message
    const messageId = generateId();
    let currentThreadId = threadId;

    if (!currentThreadId) {
      logger("info", "Creating new thread");
      // Create new thread
      currentThreadId = generateId();
      const newThread: ThreadData = {
        id: currentThreadId,
        title: query.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      // Save new thread to localStorage
      const existingThreads = JSON.parse(
        localStorage.getItem("threads") || "[]",
      );
      const updatedThreads = [...existingThreads, newThread];
      setThreads(updatedThreads);
      localStorage.setItem("threads", JSON.stringify(updatedThreads));

      setChatAction("new");
      // Navigate to thread
      navigate(`/c/${currentThreadId}`);
    } else {
      setChatAction("append");
    }

    // Create the message object and set as pending message
    const newMessage: MessageData = {
      id: messageId,
      threadId: currentThreadId,
      text: query,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    // Update pending message instead of directly adding to chatMessages
    setPendingMessage(newMessage);

    // Clear input
    setUserQuery("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleQuery(userQuery);
  };

  // Handle suggestion from HomePage
  useEffect(() => {
    if (suggestedQuery) {
      setUserQuery(suggestedQuery);
      if (onSuggestionUsed) {
        onSuggestionUsed();
      }
      logger("info", "Using suggested query:", suggestedQuery);
      handleQuery(suggestedQuery);
    }
  }, [suggestedQuery, onSuggestionUsed]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (isVirtualKeyboard) {
        // For virtual keyboards: let Enter key add newlines naturally
        return;
      } else if (!e.shiftKey) {
        // For physical keyboards: Enter submits, Shift+Enter adds new line
        e.preventDefault();
        handleSubmit(e as unknown as FormEvent);
      }
    }
  };

  return (
    <label
      className="z-1 max-xs:[--force-hide-label:none] relative flex max-w-full cursor-text flex-col"
      htmlFor="query-textarea"
    >
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="query-form relative flex w-full flex-col rounded-[28px] border bg-clip-padding p-3 shadow-sm contain-inline-size sm:shadow-lg">
          <div className="w-full">
            <div className="relative -mb-1 -mr-3 max-h-[25dvh] overflow-auto pb-3 pe-3 [scrollbar-width:thin]">
              <TextareaAutosize
                id="query-textarea"
                className="block h-10 w-full resize-none border-transparent bg-transparent text-base outline-none focus:ring-0 focus-visible:ring-0"
                autoFocus
                placeholder="Hỏi bất kỳ điều gì"
                data-virtualkeyboard="true"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              ></TextareaAutosize>
            </div>
          </div>
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex gap-2">
              <IconButton
                onClick={() => {
                  setIsSearchEnable(!isSearchEnable);
                }}
                icon={searchSourceIcon}
                text="Tìm nguồn"
                className={`icon-btn ${isSearchEnable ? "btn-on" : "btn-off"} `}
              />
              <IconButton
                onClick={() => {
                  setIsReasonEnable(!isReasonEnable);
                }}
                icon={reasonIcon}
                text="Suy luận"
                className={`icon-btn ${isReasonEnable ? "btn-on" : "btn-off"}`}
                disabled={isGenerating}
              />
            </div>
            <IconButton
              className={`btn h-9 w-9 opacity-50 ${!isSubmitDisabled ? "btn-tertiary !opacity-100" : "border-[var(--color-input-border)]"}`}
              disabled={isSubmitDisabled}
              icon={submitIcon}
            />
          </div>
        </div>
      </form>
    </label>
  );
};

export default QueryBar;
