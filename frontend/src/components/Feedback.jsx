import { useState } from "react";

import API from "../services/api";

const Feedback = () => {
  const [question, setQuestion] =
    useState("");

  const [answer, setAnswer] =
    useState("");

  const [feedback, setFeedback] =
    useState("");

  const handleSubmit = async () => {
    const res = await API.post(
      "/interview/evaluate",
      {
        question,
        answer,
      }
    );

    setFeedback(res.data.feedback);
  };

  return (
    <div>
      <textarea
        placeholder="Question"
        onChange={(e) =>
          setQuestion(e.target.value)
        }
      />

      <textarea
        placeholder="Answer"
        onChange={(e) =>
          setAnswer(e.target.value)
        }
      />

      <button onClick={handleSubmit}>
        Evaluate
      </button>

      <pre>{feedback}</pre>
    </div>
  );
};

export default Feedback;