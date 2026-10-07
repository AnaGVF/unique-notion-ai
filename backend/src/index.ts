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
		const { documentData, targetLang } = await c.req.json();

		let textContent = extractCleanText(documentData);

		if (!textContent || textContent.trim() === "" || textContent === "{}" || textContent === "[]") {
			return c.json({ translatedText: "The document is empty." });
		}

		const response: any = await c.env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
			messages: [
				{
					role: "system",
					content: `You are an expert translator and summarizer. You will be provided with the text content of a user's document.
Your task is to summarize the document and translate that summary into ${targetLang || "english"}.
Format your output using clean Markdown (such as headings, bullet points, and concise paragraphs).
Do NOT include any XML tags, HTML tags, or meta code. Return only the translated summary directly with no conversational filler.`,
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

export default app;