const {
  MemoryVectorStore,
} = require("langchain/vectorstores/memory");

const embeddings = require("./embeddings");

async function createVectorStore(textChunks) {
  const vectorStore =
    await MemoryVectorStore.fromTexts(
      textChunks,
      [],
      embeddings
    );

  return vectorStore;
}

module.exports = createVectorStore;