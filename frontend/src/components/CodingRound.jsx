import { useState } from "react";
import API from "../services/api";
import "../styles/coding.css";

const CodingRound = () => {

  const [question, setQuestion] = useState(null);

  const [code, setCode] = useState("");

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const startRound = async () => {

    try {

      setLoading(true);

      const res = await API.get("/coding/question");

      setQuestion(res.data);

      setCode(res.data.starterCode || "");

    } catch (err) {

      alert("Unable to load coding question.");

    }

    setLoading(false);

  };

  const submitCode = async () => {

    try {

      const res = await API.post("/coding/submit", {

        questionId: question.id,

        code,

      });

      setResult(res.data);

    } catch {

      alert("Submission Failed");

    }

  };

  if (loading) {

    return (

      <div className="coding-loading">

        <h1>Loading Coding Challenge...</h1>

      </div>

    );

  }

  return (

    <div className="coding-container">

      {!question ? (

        <div className="coding-home">

          <div className="coding-banner">

            <div className="coding-left">

              <span className="coding-tag">
                AI Powered Coding Assessment
              </span>

              <h1>AI Coding Challenge</h1>

              <p>
                Solve real interview coding questions with
                hidden test cases, automatic evaluation,
                instant scoring and AI-powered feedback.
              </p>

              <div className="coding-features">

                <div>✅ Real Coding Problems</div>

                <div>✅ Hidden Test Cases</div>

                <div>✅ AI Evaluation</div>

                <div>✅ Instant Score</div>

              </div>

              <button
                className="start-btn"
                onClick={startRound}
              >
                🚀 Start Coding Round
              </button>

            </div>

            <div className="coding-right">

              <div className="stats-card">

                <h2>Assessment Details</h2>

                <div className="stat">
                  <span>Questions</span>
                  <strong>10</strong>
                </div>

                <div className="stat">
                  <span>Difficulty</span>
                  <strong>Easy • Medium • Hard</strong>
                </div>

                <div className="stat">
                  <span>Time Limit</span>
                  <strong>60 Minutes</strong>
                </div>

                <div className="stat">
                  <span>Languages</span>
                  <strong>Java, Python, JS, C++</strong>
                </div>

                <div className="stat">
                  <span>Evaluation</span>
                  <strong>Hidden Test Cases</strong>
                </div>

              </div>

            </div>

          </div>

        </div>

      ) : (

        <div className="question-container">

          <h1>{question.title}</h1>

          <p>{question.description}</p>

          <textarea

            rows="18"

            value={code}

            onChange={(e) =>
              setCode(e.target.value)
            }

          />

          <button

            className="submit-btn"

            onClick={submitCode}

          >

            Submit Code

          </button>

          {result && (

            <div className="result-card">

              <h2>

                Score : {result.score}%

              </h2>

              <h3>

                Passed :

                {" "}

                {result.passed}

                /

                {result.total}

              </h3>

            </div>

          )}

        </div>

      )}

    </div>

  );

};

export default CodingRound;