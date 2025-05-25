import { mockSections, mockChunks } from "../data/mockData";
import { MessageData } from "../typing";

export function logger(level: "info" | "warn" | "error", ...data: any[]) {
  if (import.meta.env.VITE_DEV_MODE === "true") {
    console[level](...data);
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 11);
}

// Helper function to get cookie value by name
export function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return "";
}

export function formatApiKey(apiKey: string): string {
  if (apiKey.length <= 6) return apiKey;
  return apiKey.slice(0, 2) + "..." + apiKey.slice(-4);
}

export async function fetchSections(query: string) {
  logger("info", "fetchSearch called with query:", query);

  // Check if we should use mock data
  if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockSections);
      }, 2000); // 2 second delay
    });
  }

  try {
    const apiUrl = `${import.meta.env.VITE_SERVER_URL}/search/?q=${encodeURIComponent(query)}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch data: ${response.status} ${response.statusText}`,
      );
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Makes API call to Gemini and returns an async generator of text chunks
 * @param instruction System instruction for the model
 * @param contents Array of conversation messages in role/parts format
 * @param options Configuration options
 * @returns Async generator yielding text chunks from the response
 */
export async function* generateContentStream(
  instruction: string,
  contents: Array<{
    role: "user" | "model";
    parts: Array<{
      text: string;
    }>;
  }>,
  options: {
    signal?: AbortSignal;
    modelName?: string;
    apiKey?: string;
  } = {},
) {
  const {
    signal = new AbortController().signal,
    modelName = "gemini-2.0-flash",
    apiKey = import.meta.env.VITE_GEMINI_API_KEY,
  } = options;

  logger("info", "Using instruction:", instruction);
  logger(
    "info",
    "Messages for model:\n",
    ...contents.map(
      (item) => `${item.role}: ${JSON.stringify(item.parts[0].text)}`,
    ),
  );
  // Use mock data
  if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
    // Check if contents is undefined
    if (!contents || !Array.isArray(contents)) {
      // Fallback to a simple mock response if contents is undefined
      const mockResponse = ["Hello, I'm a mock response from the model!"];
      for (const chunk of mockResponse) {
        yield chunk;
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      return;
    }
    // Create flattened array of conversation in the requested format
    const flattenedContent = contents.flatMap((item) => [
      `role: ${item.role}\n\n`,
      ...item.parts.map((part) => `text: ${part.text}\n\n`),
    ]);
    for (const chunk of flattenedContent) {
      yield chunk;
      await new Promise((resolve) => setTimeout(resolve, 300)); // simulate delay
    }
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: instruction }],
      },
      contents: contents,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(
      "Gemini API key appears broken or limit reached. Get API key from https://aistudio.google.com/apikey and enter your API key below.",
    );
  }

  if (!response.body) {
    throw new Error("Response body is null");
  }
  // https://github.com/ChatGPTNextWeb/NextChat
  function extractMessage(res: any) {
    logger("info", "[Response] gemini response: ", res);

    const getTextFromParts = (parts: any[]) => {
      if (!Array.isArray(parts)) return "";

      return parts
        .map((part) => part?.text || "")
        .filter((text) => text.trim() !== "")
        .join("\n\n");
    };

    let content = "";
    if (Array.isArray(res)) {
      res.map((item) => {
        content += getTextFromParts(item?.candidates?.at(0)?.content?.parts);
      });
    }

    return (
      getTextFromParts(res?.candidates?.at(0)?.content?.parts) ||
      content ||
      res?.error?.message ||
      ""
    );
  }

  // Stream reading logic
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk
        .split("\n")
        .filter((line) => line.trim().startsWith("data:"));

      for (const line of lines) {
        try {
          const jsonStr = line.substring(5).trim(); // Remove "data:" prefix
          if (jsonStr === "[DONE]") break;

          if (jsonStr) {
            const json = JSON.parse(jsonStr);
            const textContent = extractMessage(json);
            if (textContent) {
              yield textContent;
            }
          }
        } catch (err) {
          logger("error", "Error parsing SSE line:", err, line);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Creates a smooth, animated display of content from a generator stream
 * @param streamGenerator - Generator function that yields content chunks
 * @param options - Configuration options
 */
export async function animatedResponseGenerator(
  streamGenerator: () => AsyncGenerator<string, void, unknown>,
  options: {
    onUpdate?: (fullText: string, newText: string) => void;
    onFinish?: (fullText: string) => void;
    onError?: (error: Error) => void;
  } = {},
) {
  // Default options
  const config = {
    onUpdate: (fullText: string, newText: string) => console.log(newText),
    onFinish: (fullText: string) => console.log("\nCompleted:", fullText),
    onError: (error: Error) => console.error("Error:", error),
    ...options,
  };
  // https://github.com/ChatGPTNextWeb/NextChat
  let responseText = "";
  let remainText = "";
  let finished = false;
  let controller = new AbortController();

  // Animation function to make response look smooth
  function animateResponseText() {
    if (finished || controller.signal.aborted) {
      responseText += remainText;
      console.log("[Response Animation] finished");
      if (responseText.length === 0) {
        config.onError(new Error("Empty response"));
      } else {
        config.onFinish(responseText);
      }
      return;
    }

    if (remainText.length > 0) {
      const fetchCount = Math.max(1, Math.round(remainText.length / 60));
      const fetchText = remainText.slice(0, fetchCount);
      responseText += fetchText;
      remainText = remainText.slice(fetchCount);
      config.onUpdate(responseText, fetchText);
    }

    requestAnimationFrame(animateResponseText);
  }

  // Start animation
  animateResponseText();

  try {
    // Process the generator stream
    const stream = streamGenerator();
    for await (const chunk of stream) {
      if (controller.signal.aborted) break;
      remainText += chunk;
    }

    // Mark as finished when stream completes
    setTimeout(() => {
      finished = true;
    }, 200);
  } catch (error) {
    config.onError(error instanceof Error ? error : new Error(String(error)));
    finished = true;
  }

  return controller; // Return controller for abortion capability
}
