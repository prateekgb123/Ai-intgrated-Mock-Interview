import { useState } from "react";

const CompanyPrep = () => {
  const [company, setCompany] =
    useState("");

  return (
    <div className="company-prep">
      <h2>Company Preparation</h2>

      <input
        type="text"
        placeholder="Enter Company Name"
        value={company}
        onChange={(e) =>
          setCompany(e.target.value)
        }
      />

      <button>Generate Questions</button>
    </div>
  );
};

export default CompanyPrep;