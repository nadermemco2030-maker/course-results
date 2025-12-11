import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler = async (event, context) => {
  // 1. تسجيل بداية التشغيل (سيظهر هذا في السجل حتماً)
  console.log("🚀 Function STARTED: Received request");
  console.log("Method:", event.httpMethod);

  // إعدادات CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // التعامل مع Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  // التأكد من طريقة الطلب
  if (event.httpMethod !== "POST") {
    console.error("❌ Method Not Allowed:", event.httpMethod);
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  try {
    // 2. التحقق من المفتاح
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("❌ CRITICAL: API_KEY is missing in Netlify Env Vars");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Server Error: API Key not configured" }),
      };
    }
    console.log("✅ API Key found (ends with):", apiKey.slice(-4));

    // 3. قراءة البيانات
    if (!event.body) throw new Error("Request body is empty");
    const body = JSON.parse(event.body);
    const prompt = body.contents || body.messages?.[0]?.content || "Hello";
    
    console.log("📝 Sending prompt to Google:", prompt.substring(0, 50) + "...");

    // 4. الاتصال بجوجل (باستخدام المكتبة المستقرة وموديل 1.5)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ SUCCESS: Google responded. Text length:", text.length);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text: text, reply: text }),
    };

  } catch (error) {
    console.error("❌ ERROR inside function:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Failed to generate content", 
        details: error.message 
      }),
    };
  }
};