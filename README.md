<div align="center">

<a href='https://obox.web.app'>
  <img src="/assets/thumbnail.png" width="1000" alt="icon"/>
</a>
</div>

English | [Tiếng Việt](README.vi.md)

# Obox

A RAG (Retrieval-Augmented Generation) chatbot is a type of chatbot that combines the power of large language models (LLMs) with external knowledge sources to provide more accurate and relevant responses.

## Built with

- [ReactJS](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Yarn](https://yarnpkg.com/)

## Demo

![Demo](/assets/interface.png)
Project is live here: [https://obox.web.app](https://obox.web.app)

## Installation

### Pre-requisites

- Node.js >= 18
- Yarn

### Local Development

```bash
$ git clone https://github.com/vinhgiga/obox.git
$ cd obox
$ yarn install
$ yarn dev
```

Get Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey) and add it to your `.env.local` file:

```bash
$ echo 'VITE_GEMINI_API_KEY = your_api_key' >> .env.local
```

Use dummy data for testing `VITE_USE_MOCK_DATA = true` in `.env` file.


## License

This project is licensed under the MIT License. See the [LICENSE](/LICENSE) file for details.