const extractPDFText =
  require("../utils/pdfExtractor");

const analyzeResume =
  require("../rag/resumeAnalyzer");

const generateInterviewQuestions =
  require("../rag/interviewChain");

exports.uploadResume =
  async (req, res) => {

    try {

      const filePath =
        req.file.path;

      const extractedText =
        await extractPDFText(
          filePath
        );

      // STEP 1
      // Analyze Resume

      const analysis =
        await analyzeResume(
          extractedText
        );

      let parsedAnalysis;

      try {

        parsedAnalysis =
          JSON.parse(
            analysis
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

        parsedAnalysis = {
          projects: [],
          technologies: [],
          languages: [],
          frameworks: [],
          databases: [],
          tools: [],
          skills: [],
        };

      }

      // STEP 2
      // Generate Questions

      const questions =
        await generateInterviewQuestions(
          parsedAnalysis
        );

      res.json({
        questions,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error: error.message,
      });

    }
  };