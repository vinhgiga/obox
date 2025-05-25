import React from "react";
import { SectionData } from "../typing";

const renderTextWithClickableLinks = (text: string) => {
  const urlRegex =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9]{1,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    // Add text before URL
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex, match.index),
      });
    }

    // Add URL
    parts.push({
      type: "url",
      content: match[0],
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.substring(lastIndex),
    });
  }

  // Render parts
  return parts.map((part, index) => {
    if (part.type === "url") {
      return (
        <a
          key={index}
          href={part.content}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link"
        >
          {part.content}
        </a>
      );
    }
    return <React.Fragment key={index}>{part.content}</React.Fragment>;
  });
};

const Section: React.FC<Partial<SectionData>> = ({ title, url, text }) => {
  return (
    <div className="@container">
      <div className="border-tertiary @md:border-2 @md:p-2 @md:rounded-md my-2 flex h-full w-full flex-col border-b-4 pb-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link group flex cursor-pointer items-center"
        >
          <img
            className="border-primary h-[28px] w-[28px] rounded-full border"
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcBAMAAACAI8KnAAAALVBMVEUxaLAnY64bXqx+m8m5x+BOern///9BcrUKV6ny9fqjt9fj6fJrjcKSqtDU3ey95B1TAAAAw0lEQVR4AWOgJWBUUkTmCrs4I/EFQ9LSkhXgSs2FOtPSFjEIMDIKCAowMGQJaGWn5QiaM8seMDZkUMlsYMgqyW7ae/pdzusZDJ1pB5medUxjcrky9W2LE4Na2iPGYzfcDt3znfpWrQDITWDo3Jx28OSb1Mf3FICKswRk09IK2SakPp6jwKCSltmgDMRtGVtyUxwZ2NPSDoWlJQvIXioxX3WRgcks7UVamgcDowAT2BnKadlpWQ0ID8m+flWE4kElBtoDAAonPjdbeqxQAAAAAElFTkSuQmCC"
            alt={title}
          />
          <div className="ml-2 overflow-hidden group-hover:underline">
            <h2 className="overflow-hidden truncate text-ellipsis whitespace-nowrap text-base">
              {title}
            </h2>
            {/* <div className="overflow-hidden truncate text-ellipsis whitespace-nowrap text-[12px] leading-[16px] sm:text-xs">
            {url}
            </div> */}
          </div>
        </a>
        <p className="mt-2 whitespace-pre-line text-sm">
          {renderTextWithClickableLinks(text)}
        </p>
      </div>
    </div>
  );
};

export default Section;
