import React from "react";
import "./App.css";
import Header from "./components/header";
import Card from "./components/card";
import Chat from "./components/chat";
import { useAppContext } from "./context/AppContext";

const App: React.FC = () => {
  const { searchState, handleSearch } = useAppContext();
  const { searchTerm, searchData, isLoading, error } = searchState;

  // Check if search has been initiated (searchTerm exists)
  const hasSearched = searchTerm && searchTerm.length > 0;

  return (
    <div className="w-full">
      <title>Obox</title>
      <Header onSearch={handleSearch} />
      <div className="ml-2 mr-2 mt-[100px] flex flex-wrap-reverse items-end gap-2 lg:ml-[210px]">
        {/* Card Component */}
        {hasSearched && (
          <div className="w-full max-w-[700px] flex-[6] sm:min-w-[400px]">
            {isLoading ? (
              <div className="mb-2 flex flex-col border-b-2 sm:rounded-md sm:border-2 sm:p-2">
                <p className="py-4">Searching...</p>
              </div>
            ) : (
              <Card searchTerm={searchTerm} searchData={searchData} />
            )}
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
