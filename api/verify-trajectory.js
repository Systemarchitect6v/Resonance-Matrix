const { GoogleGenAI } = require('@google/genai');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Backend configuration error: API key missing.' });
  }

  try {
    const { trajectoryData, verificationInstructions } = req.body;
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
You are an expert system processing multi-dimensional spatial geometries and resonance vectors.
Analysis Request: ${verificationInstructions}
Target Trajectory Dataset: ${JSON.stringify(trajectoryData, null, 2)}
      `,
    });

    return res.status(200).json({ analysis: response.text });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process trajectory analysis.' });
  }
};
