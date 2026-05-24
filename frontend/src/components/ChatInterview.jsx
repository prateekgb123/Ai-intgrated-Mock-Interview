import { useState } from "react";

import API from "../services/api";

const ChatInterview = () => {
  const [query, setQuery] =
    useState("");

  const [answer, setAnswer] =
    useState("");

  const handleAsk = async () => {
    const res = await API.post(
      "/rag/chat",
      {
        resumeText:
          localStorage.getItem(
            "resumeText"
          ),
        query,
      }
    );

    setAnswer(res.data.answer);
  };

  return (
    <div>
      <h2>AI Interview Chat</h2>

      <input
        type="text"
        value={query}
        onChange={(e) =>
          setQuery(e.target.value)
        }
      />

      <button onClick={handleAsk}>
        Ask
      </button>

      <p>{answer}</p>
    </div>
  );
};

export default ChatInterview;