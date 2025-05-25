import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Status, ThreadData } from "../typing";
import { Link, NavLink } from "react-router-dom";
import { IconButton } from "./icon-button";
import menuIcon from "../assets/menu.svg?raw";
import addIcon from "../assets/add.svg?raw";
import deleteIcon from "../assets/close.svg?raw";

export default function SideBar() {
  const { threads, setThreads, sidebarOpen, toggleSidebar } = useAppContext();
  const [sidebarStatus, setSidebarStatus] = useState<Status>(Status.Loading);

  useEffect(() => {
    const storedThreads = localStorage.getItem("threads");
    if (storedThreads) {
      const parsedThreads: ThreadData[] = JSON.parse(storedThreads);
      parsedThreads.sort(
        (a, b) =>
          new Date(b.updatedAt || 0).getTime() -
          new Date(a.updatedAt || 0).getTime(),
      );
      setThreads(parsedThreads);
      setSidebarStatus(Status.FinishedSuccessfully);
    } else {
      setSidebarStatus(Status.FinishedSuccessfully);
    }
  }, [setThreads]);

  const handleDeleteThread = (event: React.MouseEvent, threadId: string) => {
    // Prevent navigation to the thread
    event.preventDefault();
    event.stopPropagation();

    // 1. Get messages to find search IDs
    const messagesJson = localStorage.getItem(`messages_${threadId}`);
    if (messagesJson) {
      try {
        const messages = JSON.parse(messagesJson);
        // Remove search data for all searchIds in this thread
        messages.forEach((message: any) => {
          if (message.searchId) {
            localStorage.removeItem(`search_${message.searchId}`);
          }
        });
      } catch (error) {
        console.error("Error parsing messages:", error);
      }
    }

    // 2. Remove the thread's messages
    localStorage.removeItem(`messages_${threadId}`);

    // 3. Remove thread from threads array
    const updatedThreads = threads.filter((thread) => thread.id !== threadId);
    setThreads(updatedThreads);
    localStorage.setItem("threads", JSON.stringify(updatedThreads));
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-auto">
      <div className="flex h-[70px] w-full shrink-0 items-center">
        <div className="scrollbar-gutter flex w-full shrink-0 flex-row justify-between">
          {sidebarOpen && (
            <IconButton
              icon={menuIcon}
              onClick={toggleSidebar}
              className="icon-btn rounded-lg"
              aria-label="Menu"
            />
          )}
          <Link
            to="/"
            onClick={() => {
              // Only close sidebar on mobile devices
              if (window.innerWidth < 768) {
                toggleSidebar();
              }
            }}
          >
            <IconButton
              icon={addIcon}
              className="icon-btn rounded-lg"
              aria-label="Add"
            />
          </Link>
        </div>
      </div>
      <div className="scrollbar scrollbar-gutter">
        <div className="py-2 font-semibold">Lịch sử chat</div>
        <div className="list-container">
          {threads.map((thread) => (
            <NavLink
              key={thread.id}
              to={`/c/${thread.id}`}
              onClick={() => {
                // Only close sidebar on mobile devices
                if (window.innerWidth < 768) {
                  toggleSidebar();
                }
              }}
              className={({ isActive }) =>
                `item-secondary text-secondary hover:item-secondary-hover group relative flex items-center justify-between ${
                  isActive
                    ? "hover:item-secondary-active item-secondary-active text-primary"
                    : ""
                }`
              }
            >
              <div className="truncate">{thread.title}</div>
              <IconButton
                icon={deleteIcon}
                iconSize="0.875rem"
                onClick={(e) => handleDeleteThread(e, thread.id)}
                className="icon-btn absolute right-1 top-1/2 z-10 flex h-5 w-5 shrink-0 -translate-y-1/2 items-center justify-center rounded-full p-0 shadow-[var(--color-item-surface-secondary-active)_-5px_0px_5px_0px] transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100"
                aria-label="Delete thread"
              />
            </NavLink>
          ))}
          {threads.length === 0 &&
            sidebarStatus === Status.FinishedSuccessfully && (
              <div className="p-2 text-sm text-gray-500">
                No recent conversations
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
