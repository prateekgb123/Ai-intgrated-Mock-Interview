const groqModel =
  require("../config/groq");

const analyzeResume =
  async (resumeText) => {

    const prompt = `
Analyze this resume carefully.

Resume:
${resumeText}

Extract ONLY:

1. Projects
2. Technologies
3. Programming Languages
4. Frameworks
5. Databases
6. Tools
7. Skills

Return ONLY valid JSON.

Format:

{
  "projects": [],
  "technologies": [],
  "languages": [],
  "frameworks": [],
  "databases": [],
  "tools": [],
  "skills": []
}

No markdown.
No explanation.
`;

    const response =
      await groqModel.invoke(
        prompt
      );

    return response.content;
  };

module.exports =
  analyzeResume;