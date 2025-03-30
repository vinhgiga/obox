import React from 'react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center w-full max-w-xl mx-auto bg-white border border-gray-300 rounded-full px-4 py-2 shadow-md"
    >
      {/* Magnifying glass icon button */}
      <button type="submit" className="mr-3 text-gray-500 focus:outline-none">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4-4m0 0a7 7 0 10-14 0 7 7 0 0014 0z"
          />
        </svg>
      </button>

      {/* Text input */}
      <input
        type="text"
        className="flex-grow focus:outline-none text-gray-700"
        placeholder="Search Google or type a URL"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Microphone icon button */}
      <button
        type="button"
        onClick={() => alert('Mic clicked')}
        className="ml-3 text-gray-500 focus:outline-none"
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 1a3 3 0 00-3 3v7a3 3 0 006 0V4a3 3 0 00-3-3zm-1 14.93a5 5 0 006-4.93V10a1 1 0 112 0v1a7 7 0 01-6 6.93V20h3a1 1 0 110 2H8a1 1 0 110-2h3v-4.07z"
          />
        </svg>
      </button>
    </form>
  );
};

export default SearchBar;
