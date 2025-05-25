export interface SectionProps {
  title: string;
  url: string;
  text: string;
}

export const mockSections: SectionProps[] = [
  {
    title: "React Documentation",
    url: "https://example.com/react-docs/getting-started",
    text: `React lets you build user interfaces out of individual pieces called components. Create your own React components like Thumbnail, LikeButton, and Video. Then combine them into entire screens, pages, and apps.`,
  },
  {
    title: "Tailwind CSS Documentation",
    url: "https://example.com/tailwind-docs/getting-started",
    text: `Tailwind CSS is a utility-first CSS framework for rapid UI development.`,
  },
  {
    title: "Vite Documentation",
    url: "https://example.com/vite-docs/getting-started",
    text: `Vite is a fast build tool and development server for modern web projects.`,
  },
];

export const mockChunks: string[] = [
  `NextDNS là dịch vụ DNS tiên tiến, tăng cường bảo mật, riêng tư & hiệu suất truy cập.\n`,
  `### 1. Giới thiệu
NextDNS không chỉ định tuyến DNS mà còn cung cấp bảo mật và quản lý truy cập.\n`,
  `### 2. Các tính năng chính
- **Bảo mật:** Chặn quảng cáo, theo dõi và mối đe dọa.\n`,
  `- **Chặn quảng cáo:** Lọc quảng cáo và theo dõi.\n`,
  `- **Kiểm soát nội dung:** Lọc truy cập không mong muốn.\n`,
  `- **Quản trị:** Bảng điều khiển theo dõi DNS.\n`,
  `- **Tương thích:** Hỗ trợ đa thiết bị.\n`,
  `### 3. Ưu điểm và nhược điểm
- **Ưu điểm:**
  - **Bảo mật:** Tăng cường an toàn.\n`,
  `- **Tùy chỉnh:** Dễ điều chỉnh theo nhu cầu.\n`,
  `- **Dễ dùng:** Giao diện thân thiện.\n`,
  `- **Nhược điểm:**
  - Yêu cầu kiến thức cơ bản.\n`,
  `- **Kết nối:** Phụ thuộc chất lượng mạng.\n`,
  `### 4. Cách sử dụng NextDNS
- **Cài đặt:** Đăng ký và cấu hình DNS.\n`,
  `- **Tùy chỉnh:** Điều chỉnh qua bảng điều khiển.\n`,
  `- **Theo dõi:** Dễ theo dõi lưu lượng và báo cáo.\n`,
  `### 5. Tổng kết
NextDNS cải thiện tốc độ và bảo mật, phù hợp cho cá nhân và doanh nghiệp.\n`,
  `Khám phá NextDNS để tối ưu web và bảo vệ dữ liệu.\n`,
];
