import { useState, useRef, useEffect } from "react";
import { logger } from "../utils/helpers";
import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import menuIcon from "../assets/menu.svg?raw";
import { IconButton } from "./icon-button";

const Header: React.FC = () => {
  // logger("info", "Rendering Header component");
  const { theme, setTheme, sidebarOpen, toggleSidebar } = useAppContext();

  // Function to cycle through themes
  const toggleTheme = () => {
    const themes: ("auto" | "light" | "dark")[] = ["auto", "light", "dark"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // Helper to get theme icon/text
  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return "☀️ Sáng";
      case "dark":
        return "🌙 Tối";
      default:
        return "✨ Hệ thống";
    }
  };

  return (
    <div className="flex h-[70px] w-full flex-row justify-between">
      <div className="flex items-center">
        {!sidebarOpen && (
          <IconButton
            icon={menuIcon}
            onClick={toggleSidebar}
            className="icon-btn rounded-lg"
            aria-label="Menu"
          />
        )}

        <Link
          to="/"
          className="!text-brand cursor-pointer px-3 py-1.5 font-logo text-lg font-bold"
        >
          Obox
        </Link>
      </div>
      <div className="flex items-center">
        <button
          onClick={toggleTheme}
          className="btn btn-primary hover:btn-secondary active:btn-tertiary"
        >
          <span className="">{getThemeIcon()}</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
