import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: "GEMINI_API_KEY not found in environment variables",
        solution: "Add GEMINI_API_KEY to your .env.local file"
      }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Test models directly instead of using listModels()
    const modelsToTest = [
      "gemini-pro",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
    ]
    
    const results = []
    
    for (const modelName of modelsToTest) {
      try {
        console.log(`Testing model: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent("Say 'Hello' in one word")
        const response = result.response.text()
        
        results.push({
          model: modelName,
          status: "✓ Working",
          testResponse: response
        })
        
        console.log(`✓ ${modelName} works!`)
        
      } catch (error: any) {
        const errorMsg = error?.message || "Unknown error"
        results.push({
          model: modelName,
          status: "✗ Failed",
          error: errorMsg.substring(0, 150)
        })
        
        console.log(`✗ ${modelName} failed:`, errorMsg.substring(0, 150))
      }
    }
    
    const workingModels = results.filter(r => r.status === "✓ Working")
    
    return NextResponse.json({
      success: workingModels.length > 0,
      apiKeyConfigured: true,
      workingModels: workingModels.length,
      totalTested: results.length,
      results: results,
      recommendation: workingModels.length > 0 
        ? `Use model: ${workingModels[0].model}`
        : "No models are working. Check your API key or wait for quota reset."
    })
    
  } catch (error: any) {
    console.error("Error testing models:", error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      solution: "Check your GEMINI_API_KEY at https://aistudio.google.com/apikey"
    }, { status: 500 })
  }
}