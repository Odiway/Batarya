// app/api/ask-ai-groq/route.ts
// GROQ API - Günde 100 ücretsiz istek, çok hızlı!

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Soru gerekli' }, { status: 400 });
    }

    // GROQ API Key (ücretsiz, hızlı)
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return NextResponse.json({
        answer: `🔑 **GROQ API Kurulumu Gerekli**

1. https://console.groq.com adresine gidin
2. Ücretsiz hesap oluşturun  
3. API key alın (günde 100 ücretsiz istek)
4. .env.local dosyasına ekleyin:
   GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx

Şimdilik yerli uzman bilgimle cevaplıyorum:

${generateFallbackAnswer(question)}`,
      });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // Ücretsiz ve hızlı model
        messages: [
          {
            role: 'system',
            content: `Sen uzman bir batarya teknisyenisin. Lityum bataryalar, enerji depolama, montaj ve tamir konularında uzman bilgi veriyorsun. 

Özelliklerin:
- Türkçe yanıt veriyorsun
- Pratik ve uygulanabilir tavsiyelerde bulunuyorsun  
- Güvenlik uyarılarını her zaman ekliyorsun
- Kısa ve öz cevaplar veriyorsun
- Emojiler kullanarak cevabı daha anlaşılır yapıyorsun`,
          },
          {
            role: 'user',
            content: question,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json({
          answer: `⏰ **GROQ API Limiti Doldu**

Günlük 100 ücretsiz istek limiti aşıldı. 

${generateFallbackAnswer(question)}

💡 **Çözümler:**
- Yarın tekrar deneyin
- Farklı ücretsiz AI servisi deneyin
- Premium hesap alın`,
        });
      }

      throw new Error(`GROQ API error: ${response.status}`);
    }

    const data = await response.json();
    const aiAnswer = data.choices?.[0]?.message?.content;

    if (!aiAnswer) {
      return NextResponse.json({
        answer: generateFallbackAnswer(question),
      });
    }

    return NextResponse.json({
      answer: `🤖 **AI Uzman Yanıtı:**

${aiAnswer}

---
⚡ Powered by GROQ AI`,
    });
  } catch (error) {
    console.error('GROQ API Hatası:', error);

    let question = '';
    try {
      const body = await request.json();
      question = body.question || '';
    } catch {}

    return NextResponse.json({
      answer: `🔧 **AI Geçici Olarak Kullanılamıyor**

${generateFallbackAnswer(question)}

🔄 Sistem kısa süre içinde normale dönecek.`,
    });
  }
}

// Yerli uzman bilgi sistemi
function generateFallbackAnswer(question: string): string {
  const keywords = question.toLowerCase();

  if (
    keywords.includes('montaj') ||
    keywords.includes('kurulum') ||
    keywords.includes('bağlantı')
  ) {
    return `🔧 **Batarya Montaj Rehberi:**

**Güvenlik Önceliği:**
⚡ Ana şalteri kapatın
🧤 İzolasyon eldivenleri giyin  
👁️ Koruyucu gözlük takın

**Montaj Adımları:**
1️⃣ Terminal temizliği yapın
2️⃣ Polarite kontrolü (+/-)  
3️⃣ Bağlantıları sıkın (8-10 Nm)
4️⃣ Voltaj testi yapın

⚠️ **Uyarı:** Emin değilseniz uzman çağırın!`;
  }

  if (keywords.includes('tamir') || keywords.includes('arıza') || keywords.includes('bozulma')) {
    return `🛠️ **Batarya Arıza Tespiti:**

**İlk Kontroller:**
🔍 Görsel inceleme (şişme, çatlak)
📏 Voltaj ölçümü (multimetre)
🌡️ Sıcaklık kontrolü

**Yaygın Arızalar:**
• Voltaj düşüklüğü → Şarj deneyin
• Terminal korozyonu → Temizleyin  
• Hücre dengesizliği → BMS kontrolü

⚠️ **Tehlike:** Lityum batarya tamiri risklidir!
📞 **Tavsiye:** Yetkili servise başvurun`;
  }

  if (keywords.includes('güvenlik') || keywords.includes('tehlike') || keywords.includes('risk')) {
    return `🛡️ **Batarya Güvenlik Protokolü:**

**Kişisel Koruma:**
🧤 Nitril eldiven
👁️ Güvenlik gözlüğü  
👕 Pamuk kıyafet (sentetik değil)

**Çalışma Ortamı:**
🌬️ İyi havalandırma
🧯 ABC yangın söndürücü
📱 Acil durum numaraları hazır

**Kritik Kurallar:**
❌ Metal takı takmayın
❌ Sigara içmeyin
❌ Kıvılcım çıkaracak alet kullanmayın

🚨 **Acil durumda 112'yi arayın!**`;
  }

  if (keywords.includes('şarj') || keywords.includes('şarjör') || keywords.includes('doldurmak')) {
    return `🔋 **Güvenli Şarj Rehberi:**

**Şarj Öncesi:**
✅ BMS (Batarya Yönetim Sistemi) kontrolü
✅ Sıcaklık ölçümü (<45°C)
✅ Voltaj seviyesi kontrolü

**Şarj Süreci:**  
⚡ Orijinal şarjörü kullanın
🌡️ Sıcaklığı takip edin
⏰ Aşırı şarjdan kaçının

**Şarj Sonrası:**
🔌 Şarjörü çıkarın
📊 Hücre dengesi kontrolü
💾 Şarj kayıtlarını tutun

💡 **İpucu:** Yavaş şarj, batarya ömrünü uzatır!`;
  }

  if (keywords.includes('test') || keywords.includes('ölçüm') || keywords.includes('kontrol')) {
    return `📊 **Batarya Test Prosedürleri:**

**Temel Testler:**
🔋 Voltaj ölçümü (multimetre)
⚡ Akım kapasitesi testi
🔥 Sıcaklık monitörü
⚖️ İç direnç ölçümü

**Test Cihazları:**
• Digital multimetre
• Kapasite test cihazı  
• Termal kamera (opsiyonel)
• Osiloskop (ileri düzey)

**Değerlendirme:**
✅ Normal: 12.6-13.2V (12V batarya)
⚠️ Düşük: 12.0-12.5V  
❌ Değiştir: <12.0V

📋 **Rapor:** Test sonuçlarını kaydedin!`;
  }

  return `🔋 **"${question}" Hakkında Genel Bilgi:**

Batarya teknolojisi karmaşık bir alandır. Her durumda güvenlik önceliklidir.

**Temel Prensipler:**
🔧 Doğru araçları kullanın
📖 Üretici talimatlarını okuyun  
👨‍🔧 Emin değilseniz uzman çağırın

**Güvenlik Kuralları:**
⚡ Elektrik güvenliği
🧤 Kişisel koruyucu ekipman
🌬️ Uygun çalışma ortamı

💡 **Daha detaylı bilgi için sorunuzu spesifik hale getirin:**
• "Lityum batarya nasıl monte edilir?"
• "12V batarya arızası nasıl tespit edilir?"  
• "Şarj cihazı nasıl seçilir?"

🔄 **Başka sorularınız varsa çekinmeden sorun!**`;
}
