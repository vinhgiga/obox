import brand from '../assets/react.svg';
import { useState, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults(null);
    // Focus the textarea after clearing
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsLoading(true);
      // Send search term to the server
      fetch(`http://127.0.0.1:8000/search?q=${encodeURIComponent(searchTerm)}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          console.log('Response:', response);
          return response.json();
        })
        .then(data => {
          setSearchResults(data);
          console.log('Search results:', data);
        })
        .catch(error => {
          console.error('Error searching:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  return (
    <div className='w-full z-50 min-w-[684px]' style={{ position: 'absolute', top: '20px' }}>
      <div className='flex justify-between'>
        <form className='flex-grow max-w-[861px] ml-[210px]' onSubmit={handleSearch}>
          <div className='m-auto relative w-full'>
            <div className='pl-8 pr-8 absolute top-[12px] left-[-160px]'>
              <img
                className='overflow-hidden relative'
                src={brand} alt="Brand Logo" />
            </div>
            <div className='flex z-[3] relative min-h-[44px] border border-solid border-transparent shadow-[0px_2px_8px_0px_rgba(60,64,67,0.25)] rounded-[24px] bg-[#fff] hover:shadow-[0px_2px_8px_1px_rgba(64,60,67,0.24)]'>
              <div className='flex flex-[1] pr-[4px] pt-0'>
                <div className='flex flex-wrap flex-[1] pl-[10px]'>
                  <TextareaAutosize
                    ref={textareaRef}
                    maxRows={4}
                    className='outline-none whitespace-nowrap overflow-hidden leading-[22px] text-[16px] border-b-[8px] border-transparent pt-[11px] pb-[3px] resize-none flex-grow scrollbar-custom overflow-y-auto overflow-x-hidden border-0 bg-transparent px-2 focus:ring-0 focus-visible:ring-0'
                    placeholder='Search Google or type a URL'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {searchTerm.length > 0 && (
                  <div className='flex items-stretch flex-row h-[44px]'>
                    <button
                      type='button'
                      onClick={handleClearSearch}
                      className='w-[40px] h-[44px] cursor-pointer bg-transparent border-none flex items-center justify-center'
                    >
                      <div className="text-[#70757a] w-[20px] h-[20px] m-auto">
                        <span className="fill-current w-[20px] h-[20px] relative leading-[20px]">
                          <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
                        </span>
                      </div>
                    </button>
                    <span className="h-[65%] my-auto mx-0 border-l border-[#dadce0]"></span>
                  </div>
                )}
              </div>
              <button
                type='submit'
                className='w-[44px] h-[44px] cursor-pointer bg-transparent border-none flex items-center justify-center'
                onClick={handleSearch}
              >
                <div className="text-[#4285f4] w-[24px] h-[24px] m-auto">
                  <span className="fill-current w-[24px] h-[24px] relative leading-[24px]">
                    <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
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
}

export default Header;