import brand from "../assets/react.svg";
import { useState, useRef, FormEvent } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { logger } from "../utilities/helpers";
import { useAppContext } from "../context/AppContext";

const Header: React.FC = () => {
  logger("info", "Rendering Header component");
  return (
    <div className="flex p-3 justify-between">
      <div className="font-logo text-lg font-bold text-[#ff9000]">Obox</div>
      <button className="btn-primary rounded-full">Đăng nhập</button>
    </div>
  );
};

export default Header;
