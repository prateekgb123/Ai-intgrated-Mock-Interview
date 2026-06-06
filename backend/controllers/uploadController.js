const extractPDFText =
  require("../utils/pdfExtractor");

const analyzeResume =
  require("../rag/resumeAnalyzer");

const generateInterviewQuestions =
  require("../rag/interviewChain");

const createRetriever =
  require("../rag/retriever");

exports.uploadResume =
  async (req, res) => {

    try {

      const filePath =
        req.file.path;

      const extractedText =
        await extractPDFText(
          filePath
        );

      const retriever =
        await createRetriever(
          extractedText
        );

      const relevantDocs =
        await retriever.invoke(`
Projects
Technologies
Languages
Frameworks
Databases
Skills
`);

      const relevantContext =
        relevantDocs
          .map(
            doc =>
              doc.pageContent
          )
          .join("\n");

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

      const questions =
        await generateInterviewQuestions(
          parsedAnalysis,
          relevantContext
        );

      res.json({
        questions,
        resumeText:
          extractedText,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error:
          error.message,
      });
    }
  };