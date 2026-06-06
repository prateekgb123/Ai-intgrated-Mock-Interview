const groqModel =
  require("../config/groq");

const generateInterviewQuestions =
  async (
    data,
    context
  ) => {

    try {

      const prompt = `
You are a senior technical interviewer.

Resume Context:

${context}

Projects:
${data.projects.join(", ")}

Technologies:
${data.technologies.join(", ")}

Languages:
${data.languages.join(", ")}

Frameworks:
${data.frameworks.join(", ")}

Databases:
${data.databases.join(", ")}

Tools:
${data.tools.join(", ")}

Skills:
${data.skills.join(", ")}

RULES:

1. Ask ONLY questions from resume.
2. Ask project-specific questions.
3. Ask implementation questions.
4. Ask architecture questions.
5. Ask technology-specific questions.
6. Different resumes must generate different questions.

Generate exactly 10 questions.

Return ONLY JSON.

[
  {
    "question":
    "Explain how you implemented JWT authentication in your AI Interview project"
  }
]
`;

      const response =
        await groqModel.invoke(
          prompt
        );

      return response.content;

    } catch (error) {

      console.log(error);

      return JSON.stringify([
        {
          question:
            "Explain your latest project"
        }
      ]);
    }
  };

module.exports =
  generateInterviewQuestions;