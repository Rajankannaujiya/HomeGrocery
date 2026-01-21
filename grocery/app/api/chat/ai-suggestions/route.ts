import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { message, role } = await req.json();

    const promt = `Act as a smart chat assistant for a grocery delivery app. 
Generate 3 short, human-like WhatsApp-style reply suggestions based on the conversation context.

CONTEXT:
Role of Responder: ${role} (either "user" or "delivery_boy")
Last Message: "${message}"

RULES:
1. Length: Maximum 10 words per reply.
2. Tone: Helpful, conversational, and natural (avoid "Bot-speak").
3. Variety: Provide three distinct options (e.g., one confirming, one asking a question, one giving an update).
4. Emojis: Use maximum one natural emoji per reply.
5. Content: Priority is delivery/order, but respond naturally to greetings or basic intro questions.
6. Forbidden: No generic "Okay," "Yes," or "No." No numbering or conversational filler.

OUTPUT FORMAT:
Return ONLY a JSON array of strings. 
Example: ["I'm your delivery partner for this order 🛵","I'm outside your gate now 📍", "Please leave it at the door", "I'll be there in 5 mins!"]`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {parts: [{ text: promt }]},
      config: {
        responseMimeType: "application/json",
      },
    });
    
    const responseText = result.text; 
    console.log(responseText);
    if(!responseText){
        return NextResponse.json(
        { suggestions: [] },
        { status: 200 }
    );
    }
    const suggestions = JSON.parse(responseText);

    return NextResponse.json(
        { suggestions: suggestions },
        { status: 200 }
    );
    
  } catch (error) {
    console.error("SDK Error:", error);
    return NextResponse.json(
        { suggestions: [], message: "error generating ai suggestions" },
        { status: 500 }
    );
  }
}