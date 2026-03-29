const API_URL = "http://localhost:8000";

export interface ChatResponse {
  output: string;
  intermediate_steps?: unknown[];
}

// AbortController for request cancellation
let currentController: AbortController | null = null;

export const api = {
  async sendMessage(message: string): Promise<ChatResponse> {
    // Cancel any in-flight request
    if (currentController) {
      currentController.abort();
    }
    currentController = new AbortController();

    try {
      const token = localStorage.getItem("veda_token");
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message }),
        signal: currentController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return { output: "Request was cancelled." };
      }
      console.error("API Error:", error);
      return {
        output: "⚠️ Unable to reach the VEDA backend. Make sure the server is running on `http://localhost:8000`.",
      };
    } finally {
      currentController = null;
    }
  },

  async sendMessageStream(
    message: string,
    onToken: (token: string) => void,
    onDone: (fullOutput: string) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const token = localStorage.getItem("veda_token");
      const response = await fetch(`${API_URL}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Stream connection failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullOutput = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                onError(data.error);
                return;
              }
              if (data.token) {
                fullOutput += data.token;
                onToken(data.token);
              }
              if (data.done) {
                onDone(data.full_output || fullOutput);
                return;
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      }

      onDone(fullOutput);
    } catch (error) {
      console.error("Stream Error:", error);
      onError("Unable to connect to streaming endpoint.");
    }
  },

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },

  cancelRequest(): void {
    if (currentController) {
      currentController.abort();
      currentController = null;
    }
  },
};
