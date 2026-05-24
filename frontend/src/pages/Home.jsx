import { useNavigate } from "react-router-dom";

const interviews = [
  "Java",
  "MERN Stack",
  "HR",
  "DSA",
  "System Design",
  "Database",
];

const Home = () => {

  const navigate = useNavigate();

  const startInterview = (category) => {

    navigate(
      `/interview?category=${encodeURIComponent(category)}`
    );

  };

  const startPersonalizedInterview = () => {

    navigate("/interview");

  };

  return (
    <div className="home-page">

      <div className="hero">

        <h1>
          AI Interview Copilot
        </h1>

        <p>
          Practice AI-powered interviews
          using LangChain and RAG.
        </p>

        <button
          onClick={startPersonalizedInterview}
        >
          Personalized Interview
        </button>

      </div>

      <h2 className="section-title">
        General Mock Interviews
      </h2>

      <div className="interview-grid">

        {interviews.map((item, index) => (

          <div
            key={index}
            className="interview-card"
          >

            <h3>{item}</h3>

            <button
              onClick={() =>
                startInterview(item)
              }
            >
              Start Interview
            </button>

          </div>

        ))}

      </div>

    </div>
  );
};

export default Home;