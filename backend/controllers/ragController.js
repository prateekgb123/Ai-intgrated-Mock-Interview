const createRetriever =
  require("../rag/retriever");

const { ChatGroq } =
  require("@langchain/groq");

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.1-8b-instant",
});

exports.chatWithAI = async (
  req,
  res
) => {
  try {
    const { resumeText, query } =
      req.body;

    const retriever =
      await createRetriever(
        resumeText
      );

    const docs =
      await retriever.invoke(query);

    const context = docs
      .map((doc) => doc.pageContent)
      .join("\n");

    const prompt = `
Answer based on context:

${context}

Question:
${query}
`;

    const response =
      await model.invoke(prompt);

    res.json({
      answer: response.content,
    });
  } catch (error) {
    console.log(error);
  }
};