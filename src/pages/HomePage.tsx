import React, { useState } from "react";
import QueryBar from "../components/queryBar";
import Header from "../components/header";
import SideBar from "../components/sidebar";
import { useAppContext } from "../context/AppContext";
import { logger } from "../utils/helpers";
import { mockSections } from "../data/mockData";
import Section from "../components/section";

export default function HomePage() {
  logger("info", "Rendering HomePage component");
  const { sidebarOpen, toggleSidebar } = useAppContext();
  const [suggestedQuery, setSuggestedQuery] = useState("");

  const querySuggestions: string[] = [
    "nextdns",
    "web tải nhạc",
    "so sánh deepseek với chatgpt",
    "ngành xây dựng",
    "ngân hàng tốt nhất",
    "ưu điểm ví momo",
    "chrome extension",
    "đánh giá iphone 16e",
    "RAG là gì",
  ];

  const handleSuggestionClick = (suggestion: string) => {
    logger("info", `Query suggestion clicked: ${suggestion}`);
    setSuggestedQuery(suggestion);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-20 ${sidebarOpen ? "" : "hidden"} bg-black bg-opacity-70 md:hidden`}
        onClick={toggleSidebar}
      ></div>
      {/* Sidebar */}
      <div
        className={`sidebar fixed inset-0 shrink-0 transform overflow-y-auto duration-300 md:z-0 ${sidebarOpen ? "z-30 max-md:translate-x-0" : "max-md:-translate-x-full"}`}
      >
        <SideBar />
      </div>

      {/* Main Content */}
      <div
        className={`main-content z-10 flex h-screen w-full flex-1 grow flex-col transition-[margin] duration-300 ease-in-out ${sidebarOpen ? "md:ml-[var(--sidebar-width)]" : "ml-0"}`}
      >
        <div className="scrollbar-gutter w-full shrink-0">
          <Header />
        </div>
        <div className="scrollbar-gutter flex-1">
          <div className="section-container mx-auto flex max-w-2xl flex-col">
            <div className="text-xl font-semibold text-[var(--color-green)]">
              Trải nghiệm ngay
            </div>
            <div className="flex flex-wrap gap-2 whitespace-normal break-words py-2">
              {querySuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="icon-btn max-w-full"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <div>
              <div className="text-xl font-semibold text-[var(--color-green)]">
                Kế hoạch cập nhật
              </div>
              <div>• Chức năng đăng nhập.</div>
              <div>• Thêm bài viết.</div>
              <div>
                • Nội dung bài viết: Đa dạng nội dung. Tập trung vào giới thiệu
                phim, nội dung nổi bật trong sách báo và giáo trình, từ vựng
                tiếng Anh, thời trang, ẩm thực, trò chơi, từ viết tắt và thuật
                ngữ, GitHub repos, và các website.
              </div>
            </div>
            <div>
              <div className="text-xl font-semibold text-[var(--color-green)]">
                Công nghệ Backend
              </div>
              <div>
                • Cloudflare Tunnel: ánh xạ/mở cổng localhost sang địa chỉ URL.
              </div>
              <div>
                • FastAPI: xây dựng API bằng Python dựa vào gợi ý kiểu (type
                hints) theo chuẩn Python.
              </div>
              <div>• Google Gemini API: mô hình ngôn ngữ tạo sinh văn bản.</div>
              <div>
                • Sentence Transformers: nhúng đoạn văn thành vector đặc trưng
                (vector embedding).
              </div>
              <div>
                • Pgvector: Tiện ích (extension) bổ sung kiểu vector cho hệ quản
                trị cơ sở dữ liệu PostgreSQL.
              </div>
              <div>
                • Pandas + openpyxl: lưu kết quả tiền xử lý và vector embedding
                vào Excel.
              </div>
              <div>
                • Beautifulsoup: Phân tích cú pháp HTML để lấy văn bản từ HTML.
              </div>
              <div>
                • Langchain textsplitters: Chia nhỏ văn bản thành các đoạn
                (chunk)
              </div>
              <div>
                • Chrome extension SavePostForVoz: Lưu chủ đề trên voz.vn thành
                file JSON.
              </div>
              <div className="text-xl font-semibold text-[var(--color-green)]">
                Công nghệ Frontend:
              </div>
              <div>
                • ReactJS: xây dựng giao diện người dùng từ các phần riêng lẻ
                gọi là component.
              </div>
              <div>
                • React Markdown: Chuyển đổi markdown sang HTML để hiển thị nội
                dung.
              </div>
              <div>
                • Tailwind CSS: một framework CSS tiện ích-first, cung cấp các
                lớp utility sẵn có để bạn nhanh chóng xây dựng giao diện mà
                không cần viết CSS tùy chỉnh.
              </div>
              <div>
                • Vite: công cụ build hiện đại, nhanh chóng và tối ưu hóa với
                khả năng khởi động nhanh và cập nhật mô-đun nhanh trong quá
                trình phát triển
              </div>
              <div>
                • Yarn: trình quản lý gói JavaScript mạnh mẽ, tối ưu hóa tốc độ
                và bảo mật, giúp quản lý các thư viện và phụ thuộc trong dự án
                một cách hiệu quả.
              </div>
              <div></div>
            </div>
            {mockSections.map((section, index) => (
              <Section
                key={index}
                title={section.title}
                url={section.url}
                text={section.text}
              />
            ))}
          </div>
        </div>
        <div className="scrollbar-gutter sticky bottom-0 z-10 w-full">
          <div className="flex w-full flex-col items-center">
            <div className="w-full max-w-2xl">
              <QueryBar
                suggestedQuery={suggestedQuery}
                onSuggestionUsed={() => setSuggestedQuery("")}
              />
            </div>
          </div>
          <div className="my-2 flex w-full items-center justify-center text-center text-xs">
            <p>
              RAG Chatbot •&nbsp;
              <a
                href="https://github.com/vinhgiga/obox"
                target="_blank"
                rel="noopener noreferrer"
                className="text-link hover:underline"
              >
                GitHub
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
