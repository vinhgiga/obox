import React, { useState } from "react";
import './App.css';
import Header from "./components/header";
import Card from "./components/card";
// import { mockData } from "./data/mockData";

const App: React.FC = () => {
  // const [count, setCount] = useState(0)
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
      // Fix the URL format to prevent redirects and handle CORS properly
      // Make sure to use the correct protocol and path format
      const apiUrl = `https://radius-nhs-know-roses.trycloudflare.com/search/?q=${encodeURIComponent(query)}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': '1',
        },
        mode: 'cors', // Explicitly set CORS mode
        credentials: 'omit' // Don't send cookies to avoid additional CORS complexity
      });

      // Log response details for debugging
      console.log('Response status:', response.status);

      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // If not JSON, get the response text to log for debugging
        const text = await response.text();
        console.error('Received non-JSON response:', text.substring(0, 150) + '...');
        throw new Error('Server returned non-JSON response. Expected JSON but received HTML or other content.');
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
      }

      console.log('Response:', response)

      const data = await response.json()
      setSearchData(data)
    } catch (err) {
      // More detailed error handling
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while fetching data');
      }
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