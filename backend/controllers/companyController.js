const groqModel = require("../config/groq");

exports.generateCompanyPrep = async (req, res) => {

  try {

    const { company } = req.body;

    if (!company) {
      return res.status(400).json({
        error: "Company name is required"
      });
    }

    const prompt = `
You are an expert interview coach.

Generate complete interview preparation for ${company}.

Return ONLY JSON.

Format:

{
  "overview":"",
  "difficulty":"",
  "rounds":[],
  "topics":[],
  "codingQuestions":[],
  "technicalQuestions":[],
  "hrQuestions":[],
  "tips":[],
  "roadmap":[]
}

No markdown.
No explanation.
`;

    const response = await groqModel.invoke(prompt);

    const cleaned = response.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const json = cleaned.match(/\{[\s\S]*\}/);

    if (!json) {
      throw new Error("Invalid AI response");
    }

    res.json(JSON.parse(json[0]));

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });

  }

};