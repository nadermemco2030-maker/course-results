import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler = async (event, context) => {
  console.log("Function triggered!"); // Debug log 1: إثبات وصول الطلب
  console.log("HTTP Method:", event.httpMethod); // Debug log 2: معرفة نوع الطلب

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    console.log("Method not allowed:", event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const apiKey = process.env.API_KEY;
    console.log("Checking API Key..."); // Debug log 3

    if (!apiKey) {
      console.error("API Key is missing!");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Configuration Error: API Key missing on server" }),
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    if (!event.body) {
      console.error("Empty request body");
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Request body is empty" }),
      };
    }

    const data = JSON.parse(event.body);
    // ندعم الصيغتين: contents (المستخدمة حالياً) أو messages (القديمة)
    const prompt = data.contents || data.messages?.[0]?.content || "Hello";
    
    console.log("Sending prompt to Gemini...", prompt.substring(0, 50)); // Debug log 4

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini responded successfully"); // Debug log 5

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: text, text: text }), // إرجاع النص بالصيغتين للاحتياط
    };

  } catch (error) {
    console.error("Error inside gemini function:", error);
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