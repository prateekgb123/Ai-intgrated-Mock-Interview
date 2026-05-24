const {
  RecursiveCharacterTextSplitter,
} = require(
  "langchain/text_splitter"
);

const splitText =
  async (text) => {

    const splitter =
      new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
      });

    return await splitter
      .createDocuments([text]);
  };

module.exports =
  splitText;