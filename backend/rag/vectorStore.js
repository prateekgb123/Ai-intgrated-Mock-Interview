const {
  MemoryVectorStore,
} = require(
  "langchain/vectorstores/memory"
);

const embeddings =
  require("./embeddings");

async function createVectorStore(
  docs
) {

  return await MemoryVectorStore
    .fromDocuments(
      docs,
      embeddings
    );
}

module.exports =
  createVectorStore;