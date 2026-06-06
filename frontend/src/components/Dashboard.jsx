import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

const Dashboard = () => {

  const navigate = useNavigate();

  const cards = [
    {
      title: "AI Interview",
      icon: "🎤",
      description: "Practice AI mock interviews",
      route: "/interview",
    },
    {
      title: "Resume Analysis",
      icon: "📄",
      description: "Analyze your resume",
      route: "/resume-analysis",
    },
    {
      title: "Coding Round",
      icon: "💻",
      description: "Practice coding questions",
      route: "/coding",
    },
    {
      title: "Company Preparation",
      icon: "🏢",
      description: "Prepare for company interviews",
      route: "/company-prep",
    },
    {
      title: "Interview History",
      icon: "📊",
      description: "View previous attempts",
      route: "/history",
    },
    {
      title: "Analytics",
      icon: "🏆",
      description: "Track interview performance",
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
            onClick={() => navigate(card.route)}
          >

            <h2>
              {card.icon} {card.title}
            </h2>

            <p>
              {card.description}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
};

export default Dashboard;