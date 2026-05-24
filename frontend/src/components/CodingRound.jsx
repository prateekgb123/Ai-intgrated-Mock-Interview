import { useState } from "react";

const CodingRound = () => {
  const [code, setCode] = useState("");

  return (
    <div className="coding-round">
      <h2>Coding Round</h2>

      <textarea
        rows="15"
        placeholder="Write your code..."
        value={code}
        onChange={(e) =>
          setCode(e.target.value)
        }
      />

      <button>Submit Code</button>
    </div>
  );
};

export default CodingRound;