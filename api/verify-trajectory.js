import { GoogleGenAI } from 'https://esm.run/@google/genai';

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Unable to reach hidden vault" });
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const { domain, mathData, intent } = req.body || {};
    
    const contextPrompt = `
      Operational Context: You are executing an alignment audit inside the Resonance Matrix Cosmological Model.
      
      Focus Field Framework: ${domain}
      Target Coordinates / Raw Data (Field A): ${mathData}
      Operational Intent / Observed Variances (Field B): ${intent}
      
      Execute a precise structural analysis based on these parameters.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contextPrompt,
    });

    return res.status(200).json({ analysisOutput: response.text });

  } catch (error) {
    return res.status(500).json({ analysisOutput: `Backend Execution Fault: ${error.message}` });
  }
}
