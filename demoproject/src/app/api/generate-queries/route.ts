import { NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    console.log("Received prompt:", prompt)

    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY is not set")
    }

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "Generate search queries for similar LinkedIn posts where this post could be a comment. Provide the queries as a comma-separated list without numbering or bullet points. Each query should be concise, typically 3-5 words long.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("DeepSeek API error:", errorData)
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("DeepSeek API response:", data)

    return NextResponse.json({ queries: data.choices[0].message.content })
  } catch (error) {
    console.error("Error in generate-queries:", error)
    return NextResponse.json({ error: "Failed to generate queries", details: error.message }, { status: 500 })
  }
}

