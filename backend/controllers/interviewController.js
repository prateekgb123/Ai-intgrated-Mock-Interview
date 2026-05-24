const groqModel =
  require("../config/groq");

const generateFeedback =
  require("../rag/feedbackChain");


// GENERAL INTERVIEW

const generateGeneralInterview =
  async (req, res) => {

    try {

      const { category } =
        req.body;

      const prompt = `
Generate 10 ${category}
interview questions.

Return ONLY valid JSON array.

Example:

[
  {
    "question":
    "Explain JVM"
  }
]
`;

      const response =
        await groqModel.invoke(
          prompt
        );

      res.json({
        questions:
          response.content,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error: error.message,
      });

    }
  };


// EVALUATE ANSWER

const evaluateAnswer =
  async (req, res) => {

    try {

      const {
        question,
        answer,
      } = req.body;

      const feedback =
        await generateFeedback(
          question,
          answer
        );

      res.json({
        feedback,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error: error.message,
      });

    }
  };


// EXPORTS

module.exports = {
  generateGeneralInterview,
  evaluateAnswer,
};