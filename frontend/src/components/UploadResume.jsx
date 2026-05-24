import { useState } from "react";
import API from "../services/api";

const UploadResume = () => {
  const [file, setFile] = useState(null);

  const [questions, setQuestions] =
    useState("");

  const handleUpload = async () => {
    const formData = new FormData();

    formData.append("resume", file);

    const res = await API.post(
      "/upload/resume",
      formData
    );

    setQuestions(res.data.questions);
  };

  return (
    <div>
      <h2>Upload Resume</h2>

      <input
        type="file"
        onChange={(e) =>
          setFile(e.target.files[0])
        }
      />

      <button onClick={handleUpload}>
        Upload
      </button>

      <pre>{questions}</pre>
    </div>
  );
};

export default UploadResume;