import {
  useSearchParams,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import API from "../services/api";

import "../styles/interview.css";

const Interview = () => {

  const [searchParams] =
    useSearchParams();

  const category =
    searchParams.get("category");

  const [questions,
    setQuestions] =
    useState([]);

  const [loading,
    setLoading] =
    useState(false);

  const [file,
    setFile] =
    useState(null);

  const [currentQuestion,
    setCurrentQuestion] =
    useState(0);

  const [answer,
    setAnswer] =
    useState("");

  const [feedback,
    setFeedback] =
    useState(null);

  const [results,
    setResults] =
    useState([]);

  // ------------------------
  // SAFE JSON PARSER
  // ------------------------

  const parseQuestions =
    (data) => {

      try {

        // Remove markdown if exists

        let cleaned = data
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        return JSON.parse(cleaned);

      } catch (error) {

        console.log(
          "Invalid JSON:",
          data
        );

        // fallback questions

        return [
          {
            question:
              "Tell me about yourself"
          },

          {
            question:
              "Explain your latest project"
          },

          {
            question:
              "What are your strengths?"
          },

          {
            question:
              "Why should we hire you?"
          },

          {
            question:
              "Explain React hooks"
          },
        ];
      }
    };

  // ------------------------
  // GENERAL INTERVIEW
  // ------------------------

  useEffect(() => {

    if (category) {

      generateGeneralInterview();

    }

  }, [category]);

  const generateGeneralInterview =
    async () => {

      try {

        setLoading(true);

        const res =
          await API.post(
            "/interview/general",
            {
              category,
            }
          );

        const parsed =
          parseQuestions(
            res.data.questions
          );

        setQuestions(parsed);

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }
    };

  // ------------------------
  // PERSONALIZED INTERVIEW
  // ------------------------

  const uploadResume =
    async () => {

      if (!file) {

        alert(
          "Please upload resume"
        );

        return;
      }

      try {

        setLoading(true);

        const formData =
          new FormData();

        formData.append(
          "resume",
          file
        );

        const res =
          await API.post(
            "/upload/resume",
            formData
          );

        const parsed =
          parseQuestions(
            res.data.questions
          );

        setQuestions(parsed);

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }
    };

  // ------------------------
  // SUBMIT ANSWER
  // ------------------------

  const submitAnswer =
    async () => {

      if (!answer) {

        alert(
          "Please enter answer"
        );

        return;
      }

      try {

        const question =
          questions[
            currentQuestion
          ].question;

        const res =
          await API.post(
            "/interview/evaluate",
            {
              question,
              answer,
            }
          );

        let parsedFeedback;

        try {

          parsedFeedback =
            JSON.parse(
              res.data.feedback
                .replace(
                  /```json/g,
                  ""
                )
                .replace(
                  /```/g,
                  ""
                )
                .trim()
            );

        } catch {

          parsedFeedback = {
            score: 7,
            feedback:
              "Good answer",
            strength:
              "Technical understanding",
            weakness:
              "Need more clarity",
          };
        }

        setFeedback(
          parsedFeedback
        );

        setResults((prev) => [
          ...prev,
          parsedFeedback,
        ]);

        setTimeout(() => {

          setFeedback(null);

          setAnswer("");

          setCurrentQuestion(
            (prev) => prev + 1
          );

        }, 3000);

      } catch (error) {

        console.log(error);

      }
    };

  // ------------------------
  // SCORE CALCULATION
  // ------------------------

  const totalScore =
    results.reduce(
      (acc, item) =>
        acc + item.score,
      0
    );

  const averageScore =
    results.length > 0
      ? (
          totalScore /
          results.length
        ).toFixed(1)
      : 0;

  // ------------------------
  // LOADER
  // ------------------------

  if (loading) {

    return (

      <div className="loader-container">

        <div className="loader"></div>

        <h2>
          AI is preparing your interview...
        </h2>

      </div>

    );
  }

  // ------------------------
  // FINAL RESULT
  // ------------------------

  if (
    questions.length > 0 &&
    currentQuestion >=
      questions.length
  ) {

    return (

      <div className="result-container">

        <h1>
          Interview Completed
        </h1>

        <h2>
          Final Score:
          {averageScore}/10
        </h2>

        <div className="result-grid">

          {results.map(
            (item, index) => (

              <div
                key={index}
                className="result-card"
              >

                <h3>
                  Question {
                    index + 1
                  }
                </h3>

                <p>
                  Score:
                  {item.score}/10
                </p>

                <p>
                  <strong>
                    Feedback:
                  </strong>

                  {item.feedback}
                </p>

                <p>
                  <strong>
                    Strength:
                  </strong>

                  {item.strength}
                </p>

                <p>
                  <strong>
                    Weakness:
                  </strong>

                  {item.weakness}
                </p>

              </div>

            )
          )}

        </div>

      </div>

    );
  }

  // ------------------------
  // MAIN UI
  // ------------------------

  return (

    <div className="interview-container">

      {!category &&
        questions.length === 0 && (

        <div className="upload-box">

          <h1>
            Personalized Interview
          </h1>

          <input
            type="file"
            onChange={(e) =>
              setFile(
                e.target.files[0]
              )
            }
          />

          <button
            onClick={uploadResume}
          >
            Generate Interview
          </button>

        </div>

      )}

      {questions.length > 0 &&
        currentQuestion <
          questions.length && (

        <div className="question-box">

          <h2>
            Question {
              currentQuestion + 1
            }
          </h2>

          <p>
            {
              questions[
                currentQuestion
              ].question
            }
          </p>

          <textarea
            rows="8"
            placeholder="Enter your answer"
            value={answer}
            onChange={(e) =>
              setAnswer(
                e.target.value
              )
            }
          />

          <button
            onClick={submitAnswer}
          >
            Submit Answer
          </button>

          {feedback && (

            <div className="feedback-box">

              <h3>
                AI Feedback
              </h3>

              <p>
                Score:
                {feedback.score}/10
              </p>

              <p>
                {
                  feedback.feedback
                }
              </p>

            </div>

          )}

        </div>

      )}

    </div>

  );
};

export default Interview;