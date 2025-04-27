import React from "react";
import "./App.css";
import Header from "./components/header";
import SearchResults from "./components/searchResults";
import Chat from "./components/chat";
import { useAppContext } from "./context/AppContext";
import QueryBar from "./components/queryBar";

const App: React.FC = () => {
  const { searchState, handleSearch } = useAppContext();
  const { searchTerm, searchData, isLoading, error } = searchState;

  // Check if search has been initiated (searchTerm exists)
  const hasSearched = searchTerm && searchTerm.length > 0;

  // Example search terms to help new users
  const exampleSearchTerms = [
    "nextdns",
    "web tải nhạc",
    "so sánh deepseek với chatgpt",
    "ngành xây dựng",
    "ngân hàng tốt nhất",
    "ưu điểm ví momo",
    "chrome extension",
    "đánh giá iphone 16e",
    "RAG là gì",
  ];

  const handleExampleSearch = (term: string) => {
    handleSearch(term);
  };

  return (
    <div className="w-full">
      <Header />
      <div className="m-20">
        <QueryBar />
      </div>
      <div className="my-[100px] ml-2 mr-2 flex flex-wrap-reverse items-end gap-2 lg:ml-[210px]">
        {/* SearchResults Component */}
        {hasSearched ? (
          <div className="w-full max-w-[700px] flex-[6] sm:min-w-[400px]">
            {error && <div className="my-2 text-sm text-red-500">{error}</div>}
            {isLoading ? (
              <div>Searching...</div>
            ) : (
              <SearchResults searchTerm={searchTerm} searchData={searchData} />
            )}
          </div>
        ) : (
          <div className="w-full max-w-[700px] flex-[6] sm:min-w-[400px]">
            <div className="mt-4 text-center">
              <h2 className="mb-3 text-lg font-semibold">Thử tìm kiếm:</h2>
              <div className="flex flex-wrap justify-center gap-2">
                {exampleSearchTerms.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleSearch(term)}
                    className="rounded-full bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Component - only show when search completed successfully */}
        {hasSearched && !isLoading && searchData && searchData.length > 0 && (
          <div className="scrollbar-thin h-[60vh] w-full min-w-[280px] flex-[4] overflow-y-auto border-b-2 border-t-2 border-black pb-2 pt-2 text-xs sm:rounded-md sm:border-2 sm:border-gray-200 sm:p-2 lg:max-w-[400px]">
            <Chat searchTerm={searchTerm} cardData={searchData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
