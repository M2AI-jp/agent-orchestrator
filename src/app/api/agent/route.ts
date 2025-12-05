import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export const runtime = "edge";

const AGENT_PROMPTS: Record<string, string> = {
  research: `You are a Research Agent. Your task is to analyze the input and provide relevant information, background context, and key points about the topic.
Focus on:
- Key facts and data
- Background information
- Related concepts
- Sources (if available)

Be thorough but concise. Format your response clearly.`,

  summary: `You are a Summary Agent. Your task is to take the input text and create a clear, concise summary.
Focus on:
- Main points
- Key takeaways
- Essential information

Keep the summary to 2-3 paragraphs maximum.`,

  factcheck: `You are a FactCheck Agent. Your task is to analyze the input and identify:
- Claims that can be verified
- Potential inaccuracies
- Missing context
- Confidence level for each claim

Format as a structured analysis with each claim and its verification status.`,

  writer: `You are a Writer Agent. Your task is to take the input and transform it into well-written content.
Focus on:
- Clear and engaging prose
- Logical structure
- Appropriate tone
- Readability

Produce polished, professional content.`,
};

export async function POST(req: Request) {
  try {
    const { agentId, input } = await req.json();

    if (!agentId || !input) {
      return new Response(
        JSON.stringify({ error: "agentId and input are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = AGENT_PROMPTS[agentId];
    if (!systemPrompt) {
      return new Response(
        JSON.stringify({ error: `Unknown agent: ${agentId}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: input,
    });

    return new Response(JSON.stringify({ output: text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Agent error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
