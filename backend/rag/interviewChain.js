const groqModel =
  require("../config/groq");

const generateInterviewQuestions =
  async (data) => {

    try {

      const prompt = `
You are a senior software engineer interviewer.

Candidate Resume Analysis:

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

IMPORTANT RULES:
1. Ask ONLY resume-specific questions
2. Do NOT ask generic questions
3. Questions MUST depend on:
   - projects
   - technologies
   - frameworks
   - tools
4. Different resumes MUST generate different questions
5. Ask implementation-level questions
6. Ask architecture questions
7. Ask project challenge questions

Generate exactly 10 questions.

Return ONLY valid JSON.

Format:

[
  {
    "question":
    "Explain your JWT authentication implementation in your MERN project"
  }
]

No markdown.
No explanation.
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