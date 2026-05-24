const groqModel =
  require("../config/groq");

const generateFeedback =
  async (
    question,
    answer
  ) => {

    const prompt = `
You are an AI Interview Evaluator.

Question:
${question}

Candidate Answer:
${answer}

Evaluate:

1. Technical Accuracy
2. Communication
3. Confidence
4. Correctness

Return ONLY valid JSON.

Example:

{
  "score": 8,
  "feedback":
  "Good answer with proper explanation",
  "strength":
  "Good technical knowledge",
  "weakness":
  "Need better communication"
}
`;

    const response =
      await groqModel.invoke(
        prompt
      );

    return response.content;
  };

module.exports =
  generateFeedback;