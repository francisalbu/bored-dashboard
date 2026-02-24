// ─────────────────────────────────────────────────────────────────────────────
// File → Text extraction utilities
//   • PDF  → pdfjs-dist (client-side, no API needed)
//   • Image → OpenAI Vision GPT-4o-mini (needs VITE_OPENAI_API_KEY)
// ─────────────────────────────────────────────────────────────────────────────

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Use local worker bundled by Vite (avoids CDN fetch issues)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// ── PDF extraction ──────────────────────────────────────────────────────────

export async function extractTextFromPDF(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => item.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (text) pages.push(`[Page ${i}]\n${text}`);
  }

  return pages.join('\n\n');
}

// ── Image extraction (OCR via OpenAI Vision) ────────────────────────────────

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const OPENAI_KEY =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_OPENAI_API_KEY) || '';

export async function extractTextFromImage(file: File): Promise<string> {
  const base64 = await fileToBase64(file);

  if (!OPENAI_KEY) {
    throw new Error(
      'No VITE_OPENAI_API_KEY set. Add it to .env.local to enable image text extraction.'
    );
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract ALL text content from this image. If it\'s a menu, list every item with its price. If it\'s a document, transcribe everything. If it\'s a photo of a sign or info board, read all the text. Return the content in a clean, structured format. Use bullet points or sections where appropriate. Do not add commentary — just the extracted content.',
            },
            {
              type: 'image_url',
              image_url: { url: base64, detail: 'high' },
            },
          ],
        },
      ],
      max_tokens: 4000,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenAI API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ── Unified extraction ──────────────────────────────────────────────────────

export type ExtractionResult = {
  text: string;
  fileName: string;
  fileType: 'pdf' | 'image';
  pageCount?: number;
};

export async function extractTextFromFile(file: File): Promise<ExtractionResult> {
  const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isImage = file.type.startsWith('image/');

  if (isPDF) {
    const text = await extractTextFromPDF(file);
    // Count pages from markers
    const pageCount = (text.match(/\[Page \d+\]/g) || []).length;
    return { text, fileName: file.name, fileType: 'pdf', pageCount };
  }

  if (isImage) {
    const text = await extractTextFromImage(file);
    return { text, fileName: file.name, fileType: 'image' };
  }

  // Plain text fallback
  if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
    const text = await file.text();
    return { text, fileName: file.name, fileType: 'pdf' }; // treat as doc
  }

  throw new Error(`Unsupported file type: ${file.type || file.name}`);
}

export function hasOpenAIKey(): boolean {
  return !!OPENAI_KEY;
}
