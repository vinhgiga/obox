[![Obox](/assets/thumbnail.png)](https://obox.web.app)

[English](README.md) | Tiếng Việt

# Obox

Obox là một chatbot RAG (Retrieval-Augmented Generation), kết hợp sức mạnh của các mô hình ngôn ngữ lớn (LLMs) với các nguồn tri thức bên ngoài để cung cấp câu trả lời chính xác và phù hợp hơn.

## Xây dựng bằng

- [ReactJS](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Yarn](https://yarnpkg.com/)

## Demo

![Demo](/assets/interface.png)
Dự án đang hoạt động tại: [https://obox.web.app](https://obox.web.app)

## Cài đặt

### Yêu cầu

- Node.js >= 18
- Yarn

### Phát triển cục bộ

```bash
$ git clone https://github.com/vinhgiga/obox.git
$ cd obox
$ yarn install
$ yarn dev
```

Lấy khóa API Gemini từ [Google AI Studio](https://aistudio.google.com/apikey) và thêm vào tệp `.env.local`:

```bash
$ echo 'VITE_GEMINI_API_KEY = your_api_key' >> .env.local
```

Dùng dữ liệu giả để thử nghiệm `VITE_USE_MOCK_DATA = true` trong tệp `.env`.

## Giấy phép

Dự án này được cấp phép theo Giấy phép MIT. Xem tệp [LICENSE](/LICENSE) để biết chi tiết.