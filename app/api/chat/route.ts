import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set")
      return NextResponse.json(
        { message: "Chat service is not configured. Please contact support." },
        { status: 500 },
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Use gemini-2.5-flash as primary model with fallbacks
    const modelNames = [
      "gemini-2.5-flash",        // Primary - Latest Gemini 2.5 Flash
      "gemini-2.0-flash-exp",    // Fallback 1 - Gemini 2.0 experimental
      "gemini-1.5-flash",        // Fallback 2 - Stable 1.5 Flash
      "gemini-1.5-pro",          // Fallback 3 - More capable 1.5 Pro
      "gemini-pro",              // Fallback 4 - Legacy stable
    ]

    const systemPrompt = `You are a helpful customer support assistant for ElectronicsMart, an Indian electronics e-commerce website. 
ElectronicsMart specializes in electronics products and has a catalog of 2000-5000 products including:
- Smartphones, tablets, and accessories
- Laptops, computers, and peripherals
- Audio devices (headphones, speakers, earbuds)
- Smart home devices and IoT products
- Gaming consoles and accessories
- Cameras and photography equipment
- Wearables and fitness trackers
- Electronic components and accessories
- Home appliances and electronics
- And many more electronics products

You help customers with:
- Product inquiries and recommendations (focus on electronics)
- Order tracking and status
- Shipping and delivery information (we deliver across India)
- Return and refund policies (7-day return policy)
- Payment methods (COD, UPI, Credit/Debit cards)
- Technical specifications and compatibility questions
- General shopping assistance for electronics

Be friendly, professional, and concise. If you don't know something specific about an order, 
guide the customer to use the Track Order page or contact support.
Keep responses brief but helpful. Use Indian Rupees (₹) for prices.
When recommending products, focus on electronics that match the customer's needs.`

    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    const userMessage = lastMessage.content

    // Build context from previous messages (last 10 messages)
    const recentMessages = messages.slice(-10)
    let conversationContext = systemPrompt + "\n\n"
    
    // Add conversation history
    for (let i = 0; i < recentMessages.length - 1; i++) {
      const msg = recentMessages[i]
      if (msg.role === "user") {
        conversationContext += `User: ${msg.content}\n`
      } else if (msg.role === "assistant") {
        conversationContext += `Assistant: ${msg.content}\n`
      }
    }

    // Add current user message
    conversationContext += `User: ${userMessage}\nAssistant:`

    // Try each model until one works
    let text: string | null = null
    let lastError: any = null
    let successfulModel: string | null = null
    let quotaExceeded = false
    
    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}`)
        
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        })
        
        const result = await model.generateContent(conversationContext)
        const response = result.response
        text = response.text()
        successfulModel = modelName
        
        console.log(`✓ Successfully used model: ${modelName}`)
        break
        
      } catch (modelError: any) {
        lastError = modelError
        const errorMsg = modelError?.message || "Unknown error"
        console.log(`✗ Model ${modelName} failed:`, errorMsg.substring(0, 200))
        
        // Check if it's a quota error
        if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("Too Many Requests")) {
          quotaExceeded = true
          console.error("⚠ Quota exceeded for model:", modelName)
        }
        
        // If it's an API key error, stop trying other models
        if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("API key not valid")) {
          console.error("⚠ Invalid API key")
          break
        }
        
        continue
      }
    }
    
    // Check if we got a response
    if (!text || !successfulModel) {
      const errorDetails = lastError?.message || "Unknown error"
      console.error("All models failed. Last error:", errorDetails)
      
      // Provide helpful error message based on the error type
      if (quotaExceeded) {
        return NextResponse.json(
          { message: "I'm experiencing high demand right now. Please wait about 30 seconds and try again." },
          { status: 429 }
        )
      } else if (errorDetails.includes("API_KEY_INVALID") || errorDetails.includes("API key not valid")) {
        console.error("⚠ ACTION REQUIRED: Invalid GEMINI_API_KEY. Get a new key at https://aistudio.google.com/apikey")
        return NextResponse.json(
          { message: "Service configuration error. Please contact support." },
          { status: 500 }
        )
      } else if (errorDetails.includes("404") || errorDetails.includes("not found")) {
        console.error("⚠ ACTION REQUIRED: Models not available. Check your API key at https://aistudio.google.com")
        return NextResponse.json(
          { message: "Service temporarily unavailable. Please try again later." },
          { status: 503 }
        )
      } else {
        return NextResponse.json(
          { message: "I'm sorry, I'm having trouble right now. Please try again in a moment." },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ 
      message: text,
      model: successfulModel 
    })
    
  } catch (error: any) {
    console.error("Chat API error:", error)
    console.error("Error details:", {
      message: error?.message,
      name: error?.name,
    })
    
    const errorMessage = error?.message || "Unknown error occurred"
    
    // Provide user-friendly error messages
    let userMessage = "I'm sorry, I'm having trouble right now. Please try again later."
    let statusCode = 500
    
    if (errorMessage.includes("API key") || errorMessage.includes("API_KEY")) {
      userMessage = "Service configuration error. Please contact support."
      console.error("⚠ ACTION REQUIRED: Check your GEMINI_API_KEY in .env.local file")
    } else if (errorMessage.includes("quota") || errorMessage.includes("429")) {
      userMessage = "Service is temporarily busy. Please try again in a few moments."
      statusCode = 429
      console.error("⚠ Quota exceeded. Wait or upgrade at https://aistudio.google.com")
    } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      userMessage = "Network error. Please check your connection and try again."
    }
    
    return NextResponse.json({ message: userMessage }, { status: statusCode })
  }
}