import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

const Dashboard = () => {

  const navigate = useNavigate();

  const cards = [
    {
      title: "AI Interview",
      icon: "🎤",
      description: "Practice AI mock interviews",
      button: "Start Interview",
      route: "/interview",
    },
    {
      title: "Resume Analysis",
      icon: "📄",
      description: "Analyze your resume with AI",
      button: "Analyze Resume",
      route: "/resume-analysis",
    },
    {
      title: "Coding Round",
      icon: "💻",
      description: "Solve coding challenges",
      button: "Start Coding",
      route: "/coding",
    },
    {
      title: "Company Preparation",
      icon: "🏢",
      description: "Prepare for company interviews",
      button: "Prepare Now",
      route: "/company-prep",
    },
    {
      title: "Interview History",
      icon: "📊",
      description: "View your previous interviews",
      button: "View History",
      route: "/history",
    },
    {
      title: "Analytics",
      icon: "🏆",
      description: "Track interview performance",
      button: "View Analytics",
      route: "/analytics",
    },
  ];

  return (
    <div className="dashboard-container">

      <h1 className="dashboard-title">
        Dashboard
      </h1>

      <div className="dashboard-grid">

        {cards.map((card, index) => (

          <div
            key={index}
            className="dashboard-card"
          >

            <div>

              <h2>
                {card.icon} {card.title}
              </h2>

              <p>
                {card.description}
              </p>

            </div>

            <button
              className="dashboard-btn"
              onClick={() => navigate(card.route)}
            >
              {card.button}
            </button>

          </div>

        ))}

      </div>

    </div>
  );
};

export default Dashboard;