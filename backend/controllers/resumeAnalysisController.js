const extractPDFText =
  require("../utils/pdfExtractor");

const groqModel =
  require("../config/groq");

exports.analyzeResume =
  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({
          error: "Resume file is required",
        });

      }

      const filePath =
        req.file.path;

      const resumeText =
        await extractPDFText(
          filePath
        );

      const prompt = `
You are an ATS Resume Analyzer.

Analyze the resume and return ONLY valid JSON.

Rules:
1. Do NOT return markdown.
2. Do NOT return explanations.
3. Do NOT return notes.
4. Do NOT return headings.
5. Return ONLY JSON.

Format:

{
  "atsScore": 0,
  "skills": [],
  "strengths": [],
  "weakAreas": [],
  "suggestions": []
}

Resume:

${resumeText}
`;

      const response =
        await groqModel.invoke(
          prompt
        );

      console.log(
        "GROQ RESPONSE:"
      );
      console.log(
        response.content
      );

      let result;

      try {

        const cleaned =
          response.content
            .replace(
              /```json/g,
              ""
            )
            .replace(
              /```/g,
              ""
            )
            .trim();

        const jsonMatch =
          cleaned.match(
            /\{[\s\S]*\}/
          );

        if (!jsonMatch) {

          throw new Error(
            "No JSON found in response"
          );

        }

        result =
          JSON.parse(
            jsonMatch[0]
          );

      } catch (parseError) {

        console.log(
          "JSON Parse Error:"
        );
        console.log(
          parseError.message
        );

        result = {
          atsScore: 70,
          skills: [],
          strengths: [
            "Unable to parse AI response",
          ],
          weakAreas: [],
          suggestions: [
            "Try analyzing again",
          ],
        };

      }

      return res.json(
        result
      );

    } catch (error) {

      console.log(
        "Resume Analysis Error:"
      );
      console.log(error);

      return res.status(500).json({
        error:
          error.message ||
          "Internal Server Error",
      });

    }

  };