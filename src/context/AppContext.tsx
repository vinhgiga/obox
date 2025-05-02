import React, { createContext, useState, useContext, ReactNode } from "react";
import { mockData } from "../data/mockData";
// Define the shape of our search state
interface SearchState {
  searchTerm: string;
  searchData: any[];
  isLoading: boolean;
  error: string | null;
}

// Define the shape of our context
interface AppContextType {
  searchState: SearchState;
  setSearchTerm: (term: string) => void;
  setSearchData: (data: any[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  handleSearch: (query: string) => Promise<void>;
}

// Create the context with default values
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchData, setSearchData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    // Reset states
    setIsLoading(true);
    setError(null);
    setSearchTerm(query);

    try {
      const apiUrl = `https://left-controlling-boats-advocacy.trycloudflare.com/search/?q=${encodeURIComponent(query)}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch data: ${response.status} ${response.statusText}`,
        );
      }
      const data = await response.json();
      setSearchData(data);
    } catch (err) {
      // More detailed error handling
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while fetching data");
      }
      console.error(err);
      // Display mock data for demonstration
      setSearchData(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  // Value object to be provided to consumers
  const value = {
    searchState: {
      searchTerm,
      searchData,
      isLoading,
      error,
    },
    setSearchTerm,
    setSearchData,
    setIsLoading,
    setError,
    handleSearch,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook for using the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
