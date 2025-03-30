import React from "react";

interface CardProps {
  title: string;
  url: string;
  text: string;
}


const Card: React.FC<CardProps> = ({ title, url, text }) => {
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
          alt={title}
        />
        <div className="ml-2 overflow-hidden group-hover:underline">
          <h2 className=" text-sm">{title}</h2>
          <div className="text-gray-600 text-xs truncate max-w-full overflow-hidden text-ellipsis whitespace-nowrap ">
            {url}
          </div>
        </div>
      </a>
      <p className="mt-2 whitespace-pre-line">{text}</p>
    </div>
  );
};

export default Card;
