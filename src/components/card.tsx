import React from "react";
interface Data {
  md_hash: string;
  title: string;
  text: string;
  created_at: string;
  url: string;
}
interface CardProps {
  data: Data[];
}

const renderTextWithClickableLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

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
    <div className="flex flex-col mt-2 border-2 p-2 rounded-md">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center group cursor-pointer"
      >
        <img className="w-[28px] h-[28px] rounded-full border-[1px]"
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAPFBMVEX////G6fxsyvk/v/g4vfhhyPmz4vuK1PoAtfckufgvu/hTxPn6/f+h2/tGwPjS7v255fxMwviT1/qn3vsZjXhWAAAAbElEQVR4AeWOCQqAMAwEq11r06b3//9qAwiI0QfowHINC2N+yLJabE53uycgUGTtF11CmDqLLVdZ57iJhSt9V+4cCQB5a1RGJgr9FrrW866GbmpoGylISlNC3RxnsbY+hLbX0GSJIKE6zOajHN4ZA8/fNs9XAAAAAElFTkSuQmCC"
          alt={title} />
        <div className="ml-2 overflow-hidden group-hover:underline">
          <h2 className=" text-sm">{title}</h2>
          <div className="text-gray-600 text-xs truncate max-w-full overflow-hidden text-ellipsis whitespace-nowrap ">
            {url}
          </div>
        </div>
      </a>
      <p className="mt-2 whitespace-pre-line">{renderTextWithClickableLinks(text)}</p>
    </div>
  );
};

const Card: React.FC<CardProps> = ({ data }) => {
  return (
    <div>
      <div className="max-w-[50%] ml-[210px] mt-4 flex flex-col gap-4">
        {data.map((item, index) => (
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

      <div className="model">
        
      </div>
    </div>
  );
};

export default Card;
