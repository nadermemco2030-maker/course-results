import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler = async (event, context) => {
  // طباعة رسالة ترحيبية في السجل للتأكد من أن الدالة حية
  console.log("🟢 Function Starting: Gemini Handler Invoked");
  
  // إعدادات الأمان (CORS)
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
    const prompt = body.contents || body.messages?.[0]?.content || "";
    
    console.log("📝 Processing Prompt:", prompt.substring(0, 30) + "...");

    // استخدام المكتبة المستقرة (GenerativeAI) بدلاً من (GenAI)
    const genAI = new GoogleGenerativeAI(apiKey);
    // نستخدم الموديل 1.5 لأنه الأكثر استقراراً وسرعة حالياً
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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