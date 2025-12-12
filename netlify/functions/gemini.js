import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler = async (event, context) => {
  console.log("🟢 Function Starting: Gemini Handler Invoked");
  
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  if (event.httpMethod !== "POST") {
    console.log("🔴 Method Not Allowed:", event.httpMethod);
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("🔴 CRITICAL ERROR: API Key missing in Netlify Env");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Server Error: API configuration missing" }),
      };
    }

    const body = JSON.parse(event.body || "{}");
    const prompt = body.contents || body.messages?.[0]?.content || "Hello";
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // قائمة الموديلات التي سنحاول استخدامها بالترتيب
    // List of models to try in order of preference
    const modelsToTry = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-pro"];
    
    let generatedText = null;
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`📝 Attempting to generate content using model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            generatedText = response.text();
            
            console.log(`✅ Success! Generated response using ${modelName}. Length: ${generatedText.length}`);
            break; // Stop loop if successful
        } catch (error) {
            console.warn(`⚠️ Failed with ${modelName}:`, error.message.split('\n')[0]); // Log brief error
            lastError = error;
            // Continue to next model
        }
    }

    if (!generatedText) {
        console.error("🔴 All models failed. Last error:", lastError);
        throw lastError || new Error("Failed to generate content with any available model.");
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text: generatedText, reply: generatedText }),
    };

  } catch (error) {
    console.error("🔴 FINAL EXECUTION ERROR:", error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Failed to process request", 
        details: error.message 
      }),
    };
  }
};