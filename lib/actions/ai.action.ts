"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const modelName = "gemini-1.5-flash-latest";

const getModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { responseMimeType: "application/json" },
  });
};

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ");

interface SuggestTagsParams {
  title: string;
  content: string;
}

interface ImproveTitleParams {
  title: string;
  content: string;
}

export async function suggestQuestionTags(params: SuggestTagsParams) {
  const { title, content } = params;
  const model = getModel();

  const prompt = `
You are an assistant that suggests tags for a Q&A platform.
Return a JSON object with a "tags" array of up to 3 short keywords (1-2 words max).
Each tag must be lowercase and <= 15 characters.
Only output valid JSON.

Title: ${title}
Content: ${stripHtml(content)}

Response JSON schema: { "tags": string[] }
`;

  const result = (await model.generateContent(prompt)).response.text();
  const parsed = JSON.parse(result) as { tags?: string[] };
  const tags = Array.isArray(parsed.tags) ? parsed.tags : [];

  const normalizedTags = Array.from(
    new Set(
      tags
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0 && tag.length <= 15)
    )
  ).slice(0, 3);

  return normalizedTags;
}

export async function improveQuestionTitle(params: ImproveTitleParams) {
  const { title, content } = params;
  const model = getModel();

  const prompt = `
You are an assistant that rewrites question titles to be clearer and more click-worthy (SEO friendly).
Return a JSON object with a "title" string.
Keep the title under 120 characters and do not include quotes.
Only output valid JSON.

Current title: ${title}
Content: ${stripHtml(content)}

Response JSON schema: { "title": string }
`;

  const result = (await model.generateContent(prompt)).response.text();
  const parsed = JSON.parse(result) as { title?: string };

  return (parsed.title ?? title).trim();
}
