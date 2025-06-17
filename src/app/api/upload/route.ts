import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from '../../../lib/mongodb';

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// DÜZELTME: En stabil model adı olan "text-embedding-004" kullanıldı.
const embeddingModel = genAI ? genAI.getGenerativeModel({ model: 'text-embedding-004' }) : null;

function chunkText(text: string, chunkSize = 1000, overlap = 100): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.substring(i, i + chunkSize));
  }
  return chunks;
}

export async function POST(req: NextRequest) {
  if (!embeddingModel) {
    return NextResponse.json({ message: 'Embedding modeli başlatılamadı.' }, { status: 500 });
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('document_chunks');

    const { documents } = await req.json();

    if (!documents || typeof documents !== 'object' || Object.keys(documents).length === 0) {
      return NextResponse.json({ message: 'İşlenecek döküman metni bulunamadı.' }, { status: 400 });
    }

    for (const fileName in documents) {
      const text = documents[fileName];
      if (!text) continue;

      const textChunks = chunkText(text);

      const embeddings = await embeddingModel.batchEmbedContents({
        requests: textChunks.map((chunk) => ({
          content: {
            role: 'user',
            parts: [{ text: chunk }],
          },
        })),
      });

      if (embeddings.embeddings && Array.isArray(embeddings.embeddings)) {
        const documentsToInsert = textChunks.map((chunk, index) => ({
          fileName: fileName,
          text: chunk,
          embedding: embeddings.embeddings[index]?.values || [],
        }));

        await collection.insertMany(documentsToInsert);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Dosyalar başarıyla işlendi ve vektör veritabanına kaydedildi.',
    });
  } catch (error) {
    console.error('Upload & Embedding API hatası:', error);
    return NextResponse.json(
      { message: 'Dökümanlar işlenirken bir hata oluştu.' },
      { status: 500 },
    );
  }
}
