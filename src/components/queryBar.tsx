import React from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useState, useRef, FormEvent } from "react";
import { logger } from "../utilities/helpers";
import { useAppContext } from "../context/AppContext";

const QueryBar: React.FC = () => {
  logger("info", "Rendering Header component");
  const { handleSearch: contextHandleSearch } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e?: FormEvent) => {
    e?.preventDefault();
    if (contextHandleSearch) {
      contextHandleSearch(searchTerm);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <label
      className="z-1 max-xs:[--force-hide-label:none] relative flex h-full max-w-full flex-1 cursor-text flex-col"
      htmlFor="query-textarea"
    >
      <form className="w-full">
        <div className="relative flex w-full flex-col items-center justify-center overflow-clip rounded-[28px] border bg-clip-padding p-2 shadow-sm contain-inline-size sm:shadow-lg">
          <div className="w-full flex-1">
            <div className="mb-2 max-h-[25dvh] w-full overflow-auto px-2 [scrollbar-width:thin]">
              <TextareaAutosize
                id="query-textarea"
                className="block w-full resize-none border-transparent bg-transparent px-2 text-base outline-none focus:ring-0 focus-visible:ring-0"
                autoFocus
                placeholder="Hỏi bất kỳ điều gì"
                data-virtualkeyboard="true"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              ></TextareaAutosize>
            </div>
          </div>
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex gap-2">
              <button className="rounded-full border p-2 text-xs text-gray-600">
                Tìm kiếm
              </button>
              <button className="rounded-full border p-2 text-xs text-gray-600">
                Suy luận
              </button>
            </div>
            <button className="rounded-full border p-2 text-xs text-gray-600">
              World
            </button>
          </div>
        </div>
      </form>
    </label>
  );
};

export default QueryBar;
