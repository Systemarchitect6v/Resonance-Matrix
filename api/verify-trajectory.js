import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // Ensure strict CORS handling or preflight adjustments if necessary
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ analysisOutput: "System Error: GEMINI_API_KEY environment variable is missing on Vercel." });
  }

  try {
    const { domain, mathData, intent } = req.body || {};
    
    // Fallback if inputs are completely stripped
    if (!mathData || !intent) {
      return res.status(400).json({ analysisOutput: "System Error: Missing required input field payloads." });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
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
    // Catch any internal runtime failures explicitly and return as clean JSON
    return res.status(500).json({ analysisOutput: `Internal Engine Execution Fault: ${error.message}` });
  }
}
