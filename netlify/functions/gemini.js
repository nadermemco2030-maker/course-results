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
    
    // المحاولة الأولى: استخدام gemini-pro (الأكثر توافقاً)
    let modelName = "gemini-pro"; 
    
    console.log(`📝 Processing Prompt using ${modelName}...`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ Success! Generated response length:", text.length);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text: text, reply: text }),
    };

  } catch (error) {
    console.error("🔴 EXECUTION ERROR:", error);
    
    // محاولة ثانية: إذا فشل gemini-pro، نجرب gemini-1.5-flash
    if (error.message.includes("404") || error.message.includes("not found")) {
         console.log("⚠️ gemini-pro failed (404). Retrying with gemini-1.5-flash...");
         try {
            const genAI = new GoogleGenerativeAI(process.env.API_KEY);
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const fallbackResult = await fallbackModel.generateContent(JSON.parse(event.body).contents || "Hello");
            const fallbackText = fallbackResult.response.text();
            
            console.log("✅ Success with Fallback (gemini-1.5-flash)!");
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ text: fallbackText, reply: fallbackText }),
            };
         } catch (fallbackError) {
             console.error("🔴 Fallback also failed:", fallbackError);
             
             // محاولة أخيرة: طباعة الموديلات المتاحة لمعرفة المشكلة (للتشخيص)
             // ملاحظة: هذا يتطلب صلاحيات إضافية للمفتاح، لكن سنحاول
             console.log("🔍 Attempting to list available models for diagnosis...");
             // (Code to list models is complex in edge functions, so we rely on logs)
         }
    }

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