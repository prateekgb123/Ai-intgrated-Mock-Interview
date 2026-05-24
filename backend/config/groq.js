const { ChatGroq } =
  require("@langchain/groq");

const groqModel =
  new ChatGroq({
    apiKey:
      process.env.GROQ_API_KEY,

    model:
      "llama-3.1-8b-instant",

    temperature: 0.7,
  });

module.exports = groqModel;