import { useNavigate } from "react-router-dom";

import javaImg from "../icons/java.png";
import mernImg from "../icons/mern.png";
import hrImg from "../icons/hr.png";
import dsaImg from "../icons/dsa.png";
import systemImg from "../icons/system.jpg";
import databaseImg from "../icons/database.jpg";
import backgroundImg from "../icons/background.jpg";

const interviews = [
  {
    title: "Java",
    image: javaImg,
    description: "Core Java, OOP, Collections, Multithreading & JDBC",
  },
  {
    title: "MERN Stack",
    image: mernImg,
    description: "MongoDB, Express, React, Node.js Interview Questions",
  },
  {
    title: "HR",
    image: hrImg,
    description: "Behavioral, Communication & HR Interview Preparation",
  },
  {
    title: "DSA",
    image: dsaImg,
    description: "Arrays, Trees, Graphs, Dynamic Programming & More",
  },
  {
    title: "System Design",
    image: systemImg,
    description: "Scalable System Design & Architecture Questions",
  },
  {
    title: "Database",
    image: databaseImg,
    description: "SQL, Normalization, Transactions & DBMS Concepts",
  },
];

const Home = () => {
  const navigate = useNavigate();

  const startInterview = (category) => {
    navigate(`/interview?category=${encodeURIComponent(category)}`);
  };

  const startPersonalizedInterview = () => {
    navigate("/interview");
  };

  return (
    <div className="home-page">

      {/* ================= HERO ================= */}

      <section
        className="hero"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(15,23,42,0.65),
              rgba(15,23,42,0.65)
            ),
            url(${backgroundImg})
          `,
        }}
      >
        <div className="hero-content">

          <h1>AI Interview Copilot</h1>

          <p>
            Master your interviews with AI-powered mock interviews,
            personalized resume analysis, coding challenges,
            and company-specific preparation.
          </p>

          <button onClick={startPersonalizedInterview}>
            Personalized Interview
          </button>

        </div>
      </section>

      {/* ================= GENERAL INTERVIEWS ================= */}

      <section className="general-section">

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

              <div className="interview-content">

                <h3>{item.title}</h3>

                <p>{item.description}</p>

                <button
                  onClick={() => startInterview(item.title)}
                >
                  Start Interview
                </button>

              </div>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
};

export default Home;