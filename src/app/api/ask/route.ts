import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const generativeModel = genAI
  ? genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    })
  : null;

const embeddingModel = genAI ? genAI.getGenerativeModel({ model: 'text-embedding-004' }) : null;

export async function POST(req: NextRequest) {
  if (!generativeModel || !embeddingModel) {
    console.error('Gemini API anahtarı bulunamadı veya modeller başlatılamadı.');
    return NextResponse.json(
      { message: 'Sunucu tarafında AI modelleri yapılandırılamadı.' },
      { status: 500 },
    );
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('document_chunks');

    const { question } = await req.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ message: 'Geçersiz bir soru gönderildi.' }, { status: 400 });
    }

    // DÜZELTME: 'embedContent' fonksiyonu daha basit ve doğrudan bir şekilde çağrıldı.
    const questionEmbedding = await embeddingModel.embedContent(question);

    const relevantChunks = await collection
      .aggregate([
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'embedding',
            queryVector: questionEmbedding.embedding.values,
            numCandidates: 100,
            limit: 5,
          },
        },
        {
          $project: {
            _id: 0,
            text: 1,
            fileName: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        },
      ])
      .toArray();

    if (relevantChunks.length === 0) {
      return NextResponse.json({
        answer:
          'Yüklenen belgelerde bu soruyla ilgili bir bilgi bulunamadı. Lütfen farklı bir soru sorun veya ilgili belgeyi yükleyin.',
        sourceFile: null,
      });
    }

    const context = relevantChunks
      .map((chunk) => `Belge Adı: ${chunk.fileName}\nİçerik:\n${chunk.text}`)
      .join('\n\n---\n\n');

    const prompt = `
            Sen TEMSA'da çalışan uzman bir bakım asistanısın. Görevin, sana verilen ve aşağıda "BAĞLAM" olarak belirtilen bakım dökümanı parçalarına dayanarak operatörün sorusunu yanıtlamaktır.
            Cevaplarını SADECE ve SADECE sana verilen bu BAĞLAM'a göre vermelisin. Eğer cevap bu bağlamda yoksa, kesinlikle "Sağlanan doküman parçalarında bu bilgiye ulaşılamadı." de. ASLA tahminde bulunma.
            Cevabını verirken, bilgiyi hangi belgeden aldığını açıkça belirt.
            Cevaplarını net, anlaşılır ve adım adım olacak şekilde Türkçe olarak formatla.

            --- BAĞLAM ---
            ${context}
            ---

            OPERATÖRÜN SORUSU: "${question}"
        `;

    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    const bestAnswer = response.text();

    const sourceFiles = [...new Set(relevantChunks.map((chunk) => chunk.fileName))].join(', ');

    const conversationCollection = db.collection('conversations');
    await conversationCollection.insertOne({
      question: question,
      answer: bestAnswer,
      sourceFile: sourceFiles,
      timestamp: new Date(),
    });

    return NextResponse.json(
      {
        answer: bestAnswer,
        sourceFile: sourceFiles,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('API /api/ask hatası:', error);
    return NextResponse.json(
      { message: 'Soru işleme sırasında bir hata oluştu.' },
      { status: 500 },
    );
  }
}
