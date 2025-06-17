// app/api/ask-ai/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Soru gerekli' }, { status: 400 });
    }

    console.log('🔍 AI API çağrısı başlıyor...');
    console.log('Soru:', question);

    // Hugging Face API Key'ini environment variable'dan al
    const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;

    if (!HF_API_KEY) {
      console.log('❌ API Key bulunamadı!');
      return NextResponse.json({
        answer: `API anahtarı yapılandırılmamış. 

🔧 **Çözüm Adımları:**
1. Hugging Face hesabı oluşturun (ücretsiz)
2. API key alın
3. .env.local dosyasına ekleyin

Şimdilik yerli uzman bilgisiyle cevaplıyorum:

${generateFallbackAnswer(question)}`,
      });
    }

    console.log('✅ API Key mevcut, istek gönderiliyor...');

    // Gelişmiş prompt - Türkçe batarya uzmanı
    const prompt = `Sen uzman bir batarya teknisyenisin. Aşağıdaki soruya kısa ve net cevap ver:

"${question}"

Cevabında:
- Pratik bilgiler ver
- Güvenlik uyarıları ekle  
- Türkçe yanıtla
- 150 kelimeyi geçme`;

    // Hugging Face API çağrısı - Daha iyi model
    const response = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 150,
            temperature: 0.6,
            do_sample: true,
            pad_token_id: 50256,
          },
        }),
      },
    );

    console.log('📡 API Response Status:', response.status);

    if (!response.ok) {
      console.log('❌ API hatası:', response.status, response.statusText);

      // API limitine takıldıysa özel mesaj
      if (response.status === 429) {
        return NextResponse.json({
          answer: `🚫 **API Limit Aşıldı**
          
Günlük ücretsiz API limiti dolmuş. Yarın tekrar deneyin veya şimdilik yerli uzman bilgimle cevaplıyorum:

${generateFallbackAnswer(question)}

💡 **Çözüm:** Premium API key alabilir veya yarın tekrar deneyebilirsiniz.`,
        });
      }

      return NextResponse.json({
        answer: `⚠️ **AI Servisi Geçici Olarak Kullanılamıyor**

Teknik sorun nedeniyle AI'ya ulaşamıyoruz. Şimdilik yerli uzman bilgimle cevaplıyorum:

${generateFallbackAnswer(question)}`,
      });
    }

    const result = await response.json();
    console.log('📨 API Yanıtı:', result);

    // API yanıtını işle
    let answer = '';
    if (result && Array.isArray(result) && result[0]?.generated_text) {
      answer = result[0].generated_text.replace(prompt, '').trim();
      // Çok kısa cevapları fallback ile destekle
      if (answer.length < 20) {
        answer = generateFallbackAnswer(question);
      }
    } else if (result?.error) {
      console.log('❌ API Error:', result.error);
      answer = `⚠️ **AI Model Yükleniyor**

Model şu anda yükleniyor (20-30 saniye sürebilir). Şimdilik uzman bilgimle cevaplıyorum:

${generateFallbackAnswer(question)}

💡 **İpucu:** Birkaç dakika sonra tekrar deneyin.`;
    } else {
      answer = generateFallbackAnswer(question);
    }

    console.log('✅ Cevap hazırlandı:', answer.substring(0, 100) + '...');
    return NextResponse.json({ answer });
  } catch (error) {
    console.error('🚨 AI API Kritik Hatası:', error);

    // Hata durumunda fallback cevap
    let question = '';
    try {
      const body = await request.json();
      question = body.question || '';
    } catch {}

    const fallbackAnswer = generateFallbackAnswer(question);

    return NextResponse.json({
      answer: `🔧 **Sistem Bakımda**

Teknik bir sorun yaşanıyor. Uzman bilgi bankamdan cevaplıyorum:

${fallbackAnswer}

🔄 **Çözüm:** Sayfayı yenileyin veya daha sonra tekrar deneyin.`,
    });
  }
}

// Fallback cevap üretici
function generateFallbackAnswer(question: string): string {
  const keywords = question.toLowerCase();

  if (keywords.includes('montaj') || keywords.includes('kurulum')) {
    return `Batarya montajı için önemli noktalar:

🔧 **Güvenlik Öncelikli:**
- İş yapmadan önce elektriği kesin
- İzolasyon eldivenleri kullanın
- Uygun ventilasyon sağlayın

⚡ **Teknik Adımlar:**
- Bağlantı terminallerini temizleyin
- Pozitif ve negatif kutupları kontrol edin
- Sıkma torklarına dikkat edin
- Test cihazı ile son kontrol yapın

⚠️ **Uyarı:** Profesyonel yardım almaktan çekinmeyin.`;
  }

  if (keywords.includes('tamir') || keywords.includes('arıza')) {
    return `Batarya tamiri için genel yaklaşım:

🔍 **Tanı:**
- Voltaj ölçümü yapın
- Fiziksel hasarları kontrol edin
- Şişme, sızıntı var mı bakın

🛠️ **Temel Çözümler:**
- Terminal temizliği
- Bağlantı sıkılığı kontrolü
- Dengeleme işlemi

⚠️ **Kritik:** Lityum batarya tamiri tehlikeli olabilir. Uzman desteği alın.`;
  }

  if (keywords.includes('güvenlik')) {
    return `Batarya güvenlik protokolleri:

🛡️ **Kişisel Koruma:**
- Koruyucu gözlük ve eldiven
- İzolasyon ekipmanları
- İlk yardım kiti hazır olsun

⚡ **Elektriksel Güvenlik:**
- Ana şalter kapalı
- Test cihazları kalibreli
- Topraklama kontrolü

🔥 **Yangın Önlemi:**
- ABC tipi yangın söndürücü
- Kısa devre koruması
- Sıcaklık takibi

📞 **Acil durumda:** 112 - İtfaiye`;
  }

  return `"${question}" sorunuz için genel bilgi:

Batarya sistemleri karmaşık teknolojilerdir. Güvenlik her zaman öncelikli olmalıdır.

🔋 **Genel Prensipler:**
- Her işlem öncesi güvenlik kontrolü
- Doğru araçları kullanın
- Üretici talimatlarını takip edin

⚠️ **Önemli:** Emin olmadığınız durumlarda mutlaka uzman desteği alın.

💡 Daha spesifik sorular için konuyu detaylandırabilirsiniz.`;
}
