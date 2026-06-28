import { useNavigate } from "react-router-dom";

import javaImg from "../icons/java.png";
import mernImg from "../icons/mern.png";
import hrImg from "../icons/hr.png";
import dsaImg from "../icons/dsa.png";
import systemImg from "../icons/system.jpg";
import databaseImg from "../icons/database.jpg";

const interviews = [
  {
    title: "Java",
    image: javaImg,
  },
  {
    title: "MERN Stack",
    image: mernImg,
  },
  {
    title: "HR",
    image: hrImg,
  },
  {
    title: "DSA",
    image: dsaImg,
  },
  {
    title: "System Design",
    image: systemImg,
  },
  {
    title: "Database",
    image: databaseImg,
  },
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

        <h1>AI Interview Copilot</h1>

        <p>
          Practice AI-powered interviews using LangChain and RAG.
        </p>

        <button onClick={startPersonalizedInterview}>
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

            <img
              src={item.image}
              alt={item.title}
              className="interview-image"
            />

            <h3>{item.title}</h3>

            <button
              onClick={() =>
                startInterview(item.title)
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