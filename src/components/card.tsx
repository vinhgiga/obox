import React from "react";
import Chat from "./chat";
interface Data {
  md_hash: string;
  title: string;
  text: string;
  created_at: string;
  url: string;
}
interface CardProps {
  searchTerm: string;
  searchData: Data[];
}

const renderTextWithClickableLinks = (text: string) => {
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    // Add text before URL
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index)
      });
    }

    // Add URL
    parts.push({
      type: 'url',
      content: match[0]
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex)
    });
  }

  // Render parts
  return parts.map((part, index) => {
    if (part.type === 'url') {
      return (
        <a
          key={index}
          href={part.content}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {part.content}
        </a>
      );
    }
    return <React.Fragment key={index}>{part.content}</React.Fragment>;
  });
};

const CardItem: React.FC<Data> = ({ title, url, text }) => {
  return (
    <div className="flex flex-col mb-2 border-b-2 sm:border-2 sm:p-2 sm:rounded-md">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center group cursor-pointer"
      >
        <img className="w-[28px] h-[28px] rounded-full border-[1px]"
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcBAMAAACAI8KnAAAALVBMVEUxaLAnY64bXqx+m8m5x+BOern///9BcrUKV6ny9fqjt9fj6fJrjcKSqtDU3ey95B1TAAAAw0lEQVR4AWOgJWBUUkTmCrs4I/EFQ9LSkhXgSs2FOtPSFjEIMDIKCAowMGQJaGWn5QiaM8seMDZkUMlsYMgqyW7ae/pdzusZDJ1pB5medUxjcrky9W2LE4Na2iPGYzfcDt3znfpWrQDITWDo3Jx28OSb1Mf3FICKswRk09IK2SakPp6jwKCSltmgDMRtGVtyUxwZ2NPSDoWlJQvIXioxX3WRgcks7UVamgcDowAT2BnKadlpWQ0ID8m+flWE4kElBtoDAAonPjdbeqxQAAAAAElFTkSuQmCC"
          alt={title} />
        <div className="ml-2 overflow-hidden group-hover:underline">
          <h2 className="text-sm">{title}</h2>
          <div className="text-gray-600 text-[12px] leading-[16px] sm:text-xs truncate overflow-hidden text-ellipsis whitespace-nowrap ">
            {url}
          </div>
        </div>
      </a>
      <p className="mt-2 text-sm whitespace-pre-line">{renderTextWithClickableLinks(text)}</p>
    </div>
  );
};

const Card: React.FC<CardProps> = ({ searchTerm, searchData }) => {
  return (
    <div className="flex gap-2 items-end flex-wrap-reverse">
      <div className="flex-[6] w-full sm:min-w-[400px] max-w-[700px]">
        {searchData.map((item, index) => (
          <CardItem
            key={index}
            title={item.title}
            url={item.url}
            text={item.text}
            md_hash={item.md_hash}
            created_at={item.created_at}
          />
        ))}
      </div>
      {searchData.length > 0 && (
        <div className="flex-[4] min-w-[280px] w-full lg:max-w-[400px] h-[60vh] text-xs border-t-2 border-b-2 border-black pt-2 pb-2 sm:border-gray-300 sm:border-2 sm:rounded-md sm:p-2 overflow-y-auto scrollbar-thin">
          <Chat searchTerm={searchTerm} cardData={searchData} />
        </div>
      )}
    </div>
  );
};

export default Card;
