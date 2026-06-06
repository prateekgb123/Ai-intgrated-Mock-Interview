const {
  HuggingFaceInferenceEmbeddings,
} = require(
  "@langchain/community/embeddings/hf"
);

const embeddings =
  new HuggingFaceInferenceEmbeddings({
    apiKey:
      process.env.HF_API_KEY,

    model:
      "sentence-transformers/all-MiniLM-L6-v2",
  });

module.exports =
  embeddings;