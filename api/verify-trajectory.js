import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // Ensure the secure environment variable key is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Unable to reach hidden vault" });
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const { fieldA, fieldB } = req.body || {};
    
    const prompt = `
      Operational Context: You are executing an alignment audit inside the Resonance Matrix Cosmological Model.
      
      Target Coordinates (Field A): ${fieldA}
      Operational Intent (Field B): ${fieldB}
      
      Execute a precise structural analysis based on these parameters.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return res.status(200).json({ result: response.text });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
