import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { MessageData, ThreadData } from "../typing";

type ThemeType = "auto" | "light" | "dark";
// Define chat action types
type ChatActionType = "new" | "append" | "user_refresh" | "bot_refresh";

// Define the shape of our context state
interface AppContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  pendingMessage: MessageData;
  setPendingMessage: (message: MessageData | null) => void;
  threads: ThreadData[];
  setThreads: (threads: ThreadData[]) => void;
  chatAction: ChatActionType;
  setChatAction: (action: ChatActionType) => void;
  isSearchEnable: boolean;
  setIsSearchEnable: (enabled: boolean) => void;
  isReasonEnable: boolean;
  setIsReasonEnable: (enabled: boolean) => void;
  searchId: string | null;
  setSearchId: (id: string | undefined | null) => void;
  isSourceBarOpen: boolean;
  setIsSourceBarOpen: (open: boolean) => void;
}

// Create the context with default values
const AppContext = createContext<AppContextType | undefined>(undefined);

// Custom hook for using the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

// Props type for the provider component
interface AppProviderProps {
  children: ReactNode;
}

// Provider component that wraps the app
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    return window.innerWidth > 768;
  }); // Open by default on larger screens
  const [pendingMessage, setPendingMessage] = useState<MessageData | null>(
    null,
  );
  const [threads, setThreads] = useState<ThreadData[]>([]);
  const [chatAction, setChatAction] = useState<ChatActionType>("new"); // Default to 'new'
  const [isSearchEnable, setIsSearchEnable] = useState<boolean>(true); // Default to true
  const [isReasonEnable, setIsReasonEnable] = useState<boolean>(true); // Default to true
  const [searchId, setSearchId] = useState<string | null>(""); // Default to empty string
  const [isSourceBarOpen, setIsSourceBarOpen] = useState<boolean>(false); // Default to false
  const [theme, setTheme] = useState<ThemeType>(() => {
    // Get theme from localStorage if available
    const savedTheme = localStorage.getItem("theme") as ThemeType | null;
    return savedTheme || "auto";
  });

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Apply theme when it changes
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem("theme", theme);

    // Apply theme to document
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // Auto - check system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme]);

  // useEffect(() => {
  //   const handleResize = () => {
  //     if (window.innerWidth <= 900 && sidebarOpen) {
  //       setSidebarOpen(false);
  //     }
  //   };

  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, [sidebarOpen]);

  const value = {
    theme,
    setTheme,
    sidebarOpen,
    toggleSidebar,
    pendingMessage,
    setPendingMessage,
    threads,
    setThreads,
    chatAction,
    setChatAction,
    isSearchEnable,
    setIsSearchEnable,
    isReasonEnable,
    setIsReasonEnable,
    searchId,
    setSearchId,
    isSourceBarOpen,
    setIsSourceBarOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
