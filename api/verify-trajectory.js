import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // Prevent browser preflight checks from tripping the execution path
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ 
        analysisOutput: "System Configuration Notice: GEMINI_API_KEY is not detected in your Vercel Environment Variables." 
      });
    }

    const { domain, mathData, intent } = req.body || {};
    
    if (!mathData || !intent) {
      return res.status(200).json({ 
        analysisOutput: "System Notice: Awaiting population of coordinate arrays and tracking intent parameters." 
      });
    }

    // Initialize using the correct core constructor name
    const ai = new GoogleGenerativeAI(apiKey);
    
    // Call the highly optimized processing engine
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const contextPrompt = `
      Operational Context: You are executing an alignment audit inside the Resonance Matrix Cosmological Model.
      
      Focus Field Framework: ${domain}
      Target Coordinates / Raw Data (Field A): ${mathData}
      Operational Intent / Observed Variances (Field B): ${intent}
      
      Execute a precise structural analysis based on these parameters.
    `;

    const result = await model.generateContent(contextPrompt);
    const responseText = result.response.text();

    return res.status(200).json({ analysisOutput: responseText });

  } catch (error) {
    // Gracefully catch any internal syntax or API execution blocks and format as safe JSON
    return res.status(200).json({ 
      analysisOutput: `Internal Engine Process Catch: ${error.message}` 
    });
  }
}
Click the gre
