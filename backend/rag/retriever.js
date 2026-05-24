const splitText =
  require("../utils/textSplitter");

const createVectorStore =
  require("./vectorStore");

const createRetriever =
  async (text) => {

    const docs =
      await splitText(text);

    const vectorStore =
      await createVectorStore(
        docs
      );

    return vectorStore
      .asRetriever();
  };

module.exports =
  createRetriever;