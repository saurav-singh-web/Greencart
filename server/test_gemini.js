import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const run = async () => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // We can list models using the REST API manually because the SDK might not expose it directly.
    // Or we can just try to fetch the list of models using native fetch
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log("AVAILABLE MODELS:");
    data.models.forEach(m => {
        if (m.supportedGenerationMethods.includes("generateContent")) {
            console.log(m.name);
        }
    });
  } catch (err) {
    console.error(err);
  }
};
run();
