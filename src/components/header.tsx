import brand from "../assets/react.svg";
import { useState, useRef, FormEvent } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { logger } from "../utilities/helpers";
import { useAppContext } from "../context/AppContext";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  logger("info", "Rendering Header component");
  const { handleSearch: contextHandleSearch } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSearch = (e?: FormEvent) => {
    e?.preventDefault();
    if (contextHandleSearch) {
      contextHandleSearch(searchTerm);
    } else if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div
      className="z-50 w-full lg:min-w-[684px]"
      style={{ position: "absolute", top: "20px" }}
    >
      <div className="flex justify-between">
        <form
          className="ml-2 mr-2 max-w-[861px] flex-grow lg:ml-[210px]"
          onSubmit={handleSearch}
        >
          <div className="relative m-auto w-full">
            <div className="absolute left-[-160px] top-[12px] pl-8 pr-8">
              <img
                className="relative overflow-hidden"
                src={brand}
                alt="Brand Logo"
              />
            </div>
            <div className="relative z-[3] flex min-h-[44px] rounded-[24px] border border-solid border-transparent bg-[#fff] shadow-[0px_2px_8px_0px_rgba(60,64,67,0.25)] hover:shadow-[0px_2px_8px_1px_rgba(64,60,67,0.24)]">
              <div className="flex flex-[1] pr-[4px] pt-0">
                <div className="flex flex-[1] flex-wrap pl-[10px]">
                  <TextareaAutosize
                    ref={textareaRef}
                    maxRows={4}
                    className="scrollbar-custom flex-grow resize-none overflow-hidden overflow-y-auto overflow-x-hidden whitespace-nowrap border-0 border-b-[8px] border-transparent bg-transparent px-2 pb-[3px] pt-[11px] text-[16px] leading-[22px] outline-none focus:ring-0 focus-visible:ring-0"
                    placeholder="Search Google or type a URL"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                {searchTerm.length > 0 && (
                  <div className="flex h-[44px] flex-row items-stretch">
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="flex h-[44px] w-[40px] cursor-pointer items-center justify-center border-none bg-transparent"
                    >
                      <div className="m-auto h-[20px] w-[20px] text-[#70757a]">
                        <span className="relative h-[20px] w-[20px] fill-current leading-[20px]">
                          <svg
                            focusable="false"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                          </svg>
                        </span>
                      </div>
                    </button>
                    <span className="mx-0 my-auto h-[65%] border-l border-[#dadce0]"></span>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="flex h-[44px] w-[44px] cursor-pointer items-center justify-center border-none bg-transparent"
                onClick={handleSearch}
              >
                <div className="m-auto h-[24px] w-[24px] text-[#4285f4]">
                  <span className="relative h-[24px] w-[24px] fill-current leading-[24px]">
                    <svg
                      focusable="false"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                    </svg>
                  </span>
                </div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Header;
