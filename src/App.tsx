import React, { useState } from "react";
import './App.css';
import Header from "./components/header";
import Card from "./components/card";
import { mockData } from "./data/mockData";
const App: React.FC = () => {
  const [count, setCount] = useState(0)
  const [searchData, setSearchData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (query: string) => {
    // Reset states
    setIsLoading(true)
    setError(null)

    // Update the URL in the address bar to reflect the search
    const searchParams = new URLSearchParams({ q: query });
    const newUrl = `/search?${searchParams.toString()}`;
    window.history.pushState({ query }, '', newUrl);

    try {
      // Example fetch - replace with your actual API endpoint
      const response = await fetch(`http://localhost:8000/search?q=${encodeURIComponent(query)}`)

      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }

      const data = await response.json()
      setSearchData(data)
    } catch (err) {
      setError('An error occurred while fetching data')
      console.error(err)
      // Display mock data for demonstration
      setSearchData([
        {
          title: "Mock Title 1",
          url: "https://example.com/mock1",
          text: "This is a mock description for item 1."
        },
        {
          title: "Mock Title 2",
          url: "https://example.com/mock2",
          text: "This is a mock description for item 2."
        },
        {
          title: "Mock Title 3",
          url: "https://example.com/mock3",
          text: "This is a mock description for item 3."
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">

      <Header onSearch={handleSearch} />
      <div className="mt-[100px] ml-[210px] max-w-[50%] font-main">
        {/* Loading State */}
        {isLoading && <p className="mt-4">Loading...</p>}

        {/* Error State */}
        {error && <p className="mt-4 text-red-500">{error}</p>}

        {/* Card Component */}
        {!isLoading && <Card data={searchData} />}
      </div>

    </div>

  );
}

export default App;