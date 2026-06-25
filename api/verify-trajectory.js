import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Unable to reach hidden vault" });
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    // 1. Extract the EXACT names your HTML is sending
    const { domain, mathData, intent } = req.body || {};
    
    // 2. Build the unified context prompt for Gemini
    const contextPrompt = `
      Operational Context: You are executing an alignment audit inside the Resonance Matrix Cosmological Model.
      
      Focus Field Framework: ${domain}
      Target Coordinates / Raw Data (Field A): ${mathData}
      Operational Intent / Observed Variances (Field B): ${intent}
      
      Execute a precise structural analysis based on these parameters.
    ```;

    // 3. Request the generative analysis
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contextPrompt,
    });

    // 4. Return the key using the exact name your HTML expects to read (analysisOutput)
    return res.status(200).json({ analysisOutput: response.text });

  } catch (error) {
    // If something goes wrong with the API call itself, pass back a readable error message
    return res.status(500).json({ analysisOutput: `Backend Execution Fault: ${error.message}` });
  }
}
