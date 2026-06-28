import { useState } from "react";
import API from "../services/api";

const CompanyPrep = () => {
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const generate = async () => {
    if (!company.trim()) {
      alert("Enter company name");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/company/generate", {
        company,
      });

      console.log("Company Prep Response:", res.data);

      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate company preparation.");
    } finally {
      setLoading(false);
    }
  };

  // Safely render both strings and objects
  const renderItem = (item) => {
    if (typeof item === "string") return item;

    if (typeof item === "object" && item !== null) {
      return (
        <>
          <strong>{item.question || item.title || item.name}</strong>

          {item.language && (
            <>
              <br />
              <small>Language: {item.language}</small>
            </>
          )}

          {item.answer && (
            <>
              <br />
              <small>{item.answer}</small>
            </>
          )}

          {item.description && (
            <>
              <br />
              <small>{item.description}</small>
            </>
          )}
        </>
      );
    }

    return JSON.stringify(item);
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">
        Company Preparation
      </h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <input
          type="text"
          placeholder="Enter Company Name"
          value={company}
          onChange={(e) =>
            setCompany(e.target.value)
          }
        />

        <button onClick={generate}>
          Generate
        </button>
      </div>

      {loading && <h2>Generating...</h2>}

      {data && (
        <>
          <div className="dashboard-card">
            <h2>{company}</h2>
            <p>{data.overview}</p>
          </div>

          <div className="dashboard-grid">

            <div className="dashboard-card">
              <h2>Difficulty</h2>
              <p>{data.difficulty}</p>
            </div>

            <div className="dashboard-card">
              <h2>Interview Rounds</h2>

              <ul>
                {data.rounds?.map((item, index) => (
                  <li key={index}>
                    {renderItem(item)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="dashboard-card">
              <h2>Important Topics</h2>

              <ul>
                {data.topics?.map((item, index) => (
                  <li key={index}>
                    {renderItem(item)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="dashboard-card">
              <h2>Coding Questions</h2>

              <ul>
                {data.codingQuestions?.map((item, index) => (
                  <li key={index}>
                    {renderItem(item)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="dashboard-card">
              <h2>Technical Questions</h2>

              <ul>
                {data.technicalQuestions?.map((item, index) => (
                  <li key={index}>
                    {renderItem(item)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="dashboard-card">
              <h2>HR Questions</h2>

              <ul>
                {data.hrQuestions?.map((item, index) => (
                  <li key={index}>
                    {renderItem(item)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="dashboard-card">
              <h2>Preparation Tips</h2>

              <ul>
                {data.tips?.map((item, index) => (
                  <li key={index}>
                    {renderItem(item)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="dashboard-card">
              <h2>Roadmap</h2>

              <ul>
                {data.roadmap?.map((item, index) => (
                  <li key={index}>
                    {renderItem(item)}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default CompanyPrep;