import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler = async (event, context) => {
  // تفعيل CORS للسماح بالطلبات من المتصفح
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // التعامل مع طلبات Preflight (OPTIONS)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // التأكد من أن الطلب هو POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      console.error("API Key is missing in environment variables");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Configuration Error: API Key is missing on server." }),
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // التأكد من وجود البيانات في الطلب
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Request body is empty" }),
      };
    }

    const data = JSON.parse(event.body);
    const prompt = data.messages?.[0]?.content || "Hello";

    // إرسال الطلب إلى Google Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: text }),
    };

  } catch (error) {
    console.error("Error in gemini function:", error);
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