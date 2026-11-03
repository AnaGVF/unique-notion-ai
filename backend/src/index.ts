import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
	AI: Ai;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
	"*",
	cors({
		origin: "*",
		allowMethods: [
			"POST",
			"GET",
			"OPTIONS",
			"PUT",
		],
		allowHeaders: [
			"Content-Type",
			"X-Custom-Header",
			"Upgrade-Insecure-Requests",
		],
		exposeHeaders: [
			"Content-Length",
			"X-Kuma-Revision",
		],
		maxAge: 600,
		credentials: true,
	}),
);

function extractCleanText(documentData: any): string {
	if (!documentData) return "";
	let text = typeof documentData === "string" ? documentData : JSON.stringify(documentData);

	// Strip XML tags while preserving line breaks between blocks
	text = text
		.replace(/<\/(blockcontainer|heading|paragraph|bulletListItem|numberedListItem|checkListItem|tableRow|div|p|h[1-6])>/gi, "\n")
		.replace(/<[^>]+>/g, " ")
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/[ \t]+/g, " ")
		.replace(/\n\s+/g, "\n")
		.trim();

	return text;
}

app.post("/chatToDocument", async (c) => {
	try {
		const { documentData, question } = await c.req.json();

		let textContent = extractCleanText(documentData);

		if (!textContent || textContent.trim() === "" || textContent === "{}" || textContent === "[]") {
			textContent = "The document is currently empty.";
		}

		const response: any = await c.env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
			messages: [
				{
					role: "system",
					content: `You are a helpful assistant helping the user chat with and ask questions about a document. Answer the user's questions clearly, accurately, and concisely using Markdown formatting based on the following document content:\n\n${textContent}\n\nDo NOT include raw XML or HTML tags in your response.`,
				},
				{
					role: "user",
					content: question || "Can you summarize what this document is about?",
				},
			],
		});

		const message = response?.response || "I couldn't generate a response.";

		return c.json({ message });
	} catch (error: any) {
		console.error("Chat Error:", error);
		return c.json({ error: error.message || error.toString() }, 500);
	}
});

app.post("/translateDocument", async (c) => {
	try {
		const { documentData, targetLang, mode } = await c.req.json();

		let textContent = extractCleanText(documentData);

		if (!textContent || textContent.trim() === "" || textContent === "{}" || textContent === "[]") {
			return c.json({ translatedText: "The document is empty." });
		}

		const isFull = mode === "full";
		const systemPrompt = isFull
			? `You are an expert translator. Translate the following document completely and accurately into ${targetLang || "english"}. Preserve all structure, headings, bullet points, checklists, emojis, and formatting. Do not summarize, omit, or shorten any content. Return ONLY the translated document in clean Markdown with no conversational filler or explanation.`
			: `You are an expert translator and summarizer. You will be provided with the text content of a user's document.
Your task is to summarize the document and translate that summary into ${targetLang || "english"}.
Format your output using clean Markdown (such as headings, bullet points, and concise paragraphs).
Do NOT include any XML tags, HTML tags, or meta code. Return only the translated summary directly with no conversational filler.`;

		const response: any = await c.env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
			messages: [
				{
					role: "system",
					content: systemPrompt,
				},
				{
					role: "user",
					content: `Document content:\n${textContent}`,
				},
			],
		});

		const translatedText = response?.response || "No response generated";

		return c.json({ translatedText });
	} catch (error: any) {
		console.error("Translation Error:", error);
		return c.json({ error: error.message || error.toString() }, 500);
	}
});

app.post("/aiWritingAssistant", async (c) => {
	try {
		const { text, action, customPrompt, documentData } = await c.req.json();

		let contentToProcess = text || extractCleanText(documentData);
		if (!contentToProcess || contentToProcess.trim() === "" || contentToProcess === "{}" || contentToProcess === "[]") {
			contentToProcess = "No content provided.";
		}

		let systemPrompt = "You are Astro, an elite AI writing assistant inside a Notion workspace. Your goal is to refine, transform, or generate text with exceptional clarity, natural phrasing, and high-impact formatting.";
		let userPrompt = "";

		switch (action) {
			case "grammar":
				systemPrompt += " Fix all spelling, grammar, punctuation, and typographical mistakes while preserving the author's original voice and formatting.";
				userPrompt = `Please fix grammar and spelling for the following text:\n\n${contentToProcess}`;
				break;
			case "improve":
				systemPrompt += " Improve the flow, vocabulary, readability, and overall impact of the text while retaining its core message.";
				userPrompt = `Please improve and elevate the following writing:\n\n${contentToProcess}`;
				break;
			case "concise":
				systemPrompt += " Make the text concise, crisp, and impactful by removing fluff, filler words, and redundancy.";
				userPrompt = `Please rewrite this to be much more concise:\n\n${contentToProcess}`;
				break;
			case "action-items":
				systemPrompt += " Analyze the text and extract all tasks, deliverables, and next steps into a clean markdown checklist (- [ ] Task description).";
				userPrompt = `Please extract action items from this text:\n\n${contentToProcess}`;
				break;
			case "summarize":
				systemPrompt += " Create a clear executive summary with key takeaways and bullet points in clean Markdown.";
				userPrompt = `Please summarize the following document:\n\n${contentToProcess}`;
				break;
			case "expand":
				systemPrompt += " Continue and expand upon these ideas with rich detail, supporting points, and structured paragraphs.";
				userPrompt = `Please continue writing and expanding on this:\n\n${contentToProcess}`;
				break;
			case "tone-professional":
				systemPrompt += " Rewrite the text in a polished, professional, and corporate tone suitable for executives or clients.";
				userPrompt = `Rewrite this in a professional tone:\n\n${contentToProcess}`;
				break;
			case "tone-casual":
				systemPrompt += " Rewrite the text in a friendly, conversational, engaging, and approachable tone.";
				userPrompt = `Rewrite this in a casual, friendly tone:\n\n${contentToProcess}`;
				break;
			case "custom":
			default:
				systemPrompt += " Follow the user's specific instruction accurately. Output only clean Markdown with no meta commentary.";
				userPrompt = `Instruction: ${customPrompt || "Improve this text"}\n\nText:\n${contentToProcess}`;
				break;
		}

		systemPrompt += " Return ONLY the processed text or markdown directly. Do NOT include phrases like 'Here is the revised version:' or conversational filler.";

		const response: any = await c.env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
		});

		const result = response?.response || "No response generated";

		return c.json({ result });
	} catch (error: any) {
		console.error("AI Assistant Error:", error);
		return c.json({ error: error.message || error.toString() }, 500);
	}
});

export default app;