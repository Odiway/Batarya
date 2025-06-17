'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Guide = {
  id: string;
  title: string;
  content?: string;
};

const initialGuides: Guide[] = [
  { id: 'guide1', title: 'Lityum Batarya Montajı' },
  { id: 'guide2', title: 'Batarya Tamir Teknikleri' },
  { id: 'guide3', title: 'Güvenlik ve Koruma Protokolleri' },
  { id: 'guide4', title: 'Batarya Test Yöntemleri' },
  { id: 'guide5', title: 'Enerji Depolama Sistemleri' },
  { id: 'guide6', title: 'Batarya Bakım İpuçları' },
  { id: 'guide7', title: 'Şarj ve Deşarj Prosedürleri' },
  { id: 'guide8', title: 'Batarya Geri Dönüşümü' },
  { id: 'guide9', title: 'Batarya Lazer Montajı' },
];

export default function GuideListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [guides, setGuides] = useState<Guide[]>(initialGuides);
  const [newGuideTitle, setNewGuideTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [aiService, setAiService] = useState<'groq' | 'huggingface' | 'fallback'>('groq');

  // Filtreli liste
  const filteredGuides = guides.filter((guide) =>
    guide.title.toLowerCase().includes(search.toLowerCase()),
  );

  // Yeni rehber ekle
  const handleAddGuide = () => {
    if (!newGuideTitle.trim()) return alert('Başlık boş olamaz');
    const newGuide: Guide = {
      id: `guide${guides.length + 1}`,
      title: newGuideTitle.trim(),
    };
    setGuides([newGuide, ...guides]);
    setNewGuideTitle('');
    setShowAddForm(false);
  };

  // Rehbere git (router push)
  const handleClick = (id: string) => {
    router.push(`/guidelines/${id}`);
  };

  // AI servisine soru sorma
  const handleAskQuestion = async () => {
    if (!question.trim()) return alert('Lütfen soru girin.');
    setLoadingAnswer(true);
    setAnswer(null);

    try {
      // Seçili AI servisine göre endpoint belirleme
      const endpoint = aiService === 'groq' ? '/api/ask-ai-groq' : '/api/ask-ai';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          context: 'batarya, lityum batarya, batarya montajı, batarya tamiri, enerji depolama',
        }),
      });

      if (!response.ok) {
        throw new Error('API çağrısı başarısız');
      }

      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error('AI API Hatası:', error);
      setAnswer(`🔧 **Bağlantı Sorunu**

Şu anda AI servislerine ulaşılamıyor. Yerli uzman bilgi bankamızdan cevaplıyorum:

${generateLocalAnswer(question.trim())}

💡 **Çözüm önerileri:**
- İnternet bağlantınızı kontrol edin
- Birkaç saniye sonra tekrar deneyin  
- Farklı AI servisi seçin`);
    } finally {
      setLoadingAnswer(false);
    }
  };

  // Yerli cevap üretici
  const generateLocalAnswer = (q: string) => {
    const keywords = q.toLowerCase();
    if (keywords.includes('montaj'))
      return 'Batarya montajında önce güvenlik protokollerini uygulayın...';
    if (keywords.includes('tamir')) return 'Batarya tamiri için önce arıza tespiti yapın...';
    if (keywords.includes('güvenlik')) return 'Batarya güvenliği için koruyucu ekipman kullanın...';
    return 'Batarya konularında her zaman güvenlik önceliklidir. Detaylı bilgi için spesifik soru sorun.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-3xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-blue-700 mb-2 drop-shadow">
            Batarya Kılavuzları
          </h1>
          <p className="text-sm text-blue-600 flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            AI Destekli Uzman Sistem
          </p>
        </div>

        {/* Ara + Temizle + Rehber Ekle Butonu */}
        <div className="flex flex-wrap gap-2 items-center justify-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kılavuz ara..."
            className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => setSearch('')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Temizle
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            {showAddForm ? 'İptal' : 'Yeni Kılavuz Ekle'}
          </button>
        </div>

        {/* Yeni Kılavuz Ekle Formu */}
        {showAddForm && (
          <div className="bg-blue-50 p-4 rounded-lg shadow-inner space-y-3 border-l-4 border-blue-400">
            <input
              type="text"
              value={newGuideTitle}
              onChange={(e) => setNewGuideTitle(e.target.value)}
              placeholder="Kılavuz Başlığı"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleAddGuide}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold w-full transition-colors"
            >
              Ekle
            </button>
          </div>
        )}

        {/* Kılavuz Listesi */}
        <div className="space-y-4 max-h-[280px] overflow-y-auto">
          {filteredGuides.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">📚</div>
              Kılavuz bulunamadı.
            </div>
          ) : (
            filteredGuides.map((guide) => (
              <button
                key={guide.id}
                onClick={() => handleClick(guide.id)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-white font-semibold py-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 text-lg transform hover:scale-[1.02]"
              >
                {guide.title}
              </button>
            ))
          )}
        </div>

        {/* AI Destekli Soru Sorma Bölümü */}
        <div className="pt-6 border-t border-gray-300 space-y-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🤖</div>
            <h2 className="text-2xl font-bold text-blue-700">AI Uzman Asistanı</h2>
            <div className="flex-1 border-t border-dashed border-blue-300"></div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
            {/* AI Servisi Seçimi */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm font-medium text-gray-700">AI Servisi:</span>
              <button
                onClick={() => setAiService('groq')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  aiService === 'groq'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                🚀 GROQ (Hızlı)
              </button>
              <button
                onClick={() => setAiService('huggingface')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  aiService === 'huggingface'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                🤗 HuggingFace
              </button>
              <button
                onClick={() => setAiService('fallback')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  aiService === 'fallback'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                💡 Yerli Uzman
              </button>
            </div>

            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Batarya montajı, tamiri, güvenlik protokolleri vb. ile ilgili sorunuzu buraya yazın..."
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-white"
            />

            <div className="flex justify-between items-center mt-3">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">
                  {loadingAnswer
                    ? '🧠 AI düşünüyor...'
                    : '💡 Detaylı cevaplar için spesifik sorular sorun'}
                </span>
                <span className="text-xs text-blue-600 mt-1">
                  {aiService === 'groq' && '⚡ GROQ: Çok hızlı, günde 100 ücretsiz'}
                  {aiService === 'huggingface' && '🤗 HuggingFace: Günde 1000 ücretsiz'}
                  {aiService === 'fallback' && '💡 Yerli sistem: Sınırsız, her zaman çalışır'}
                </span>
              </div>
              <button
                onClick={handleAskQuestion}
                disabled={loadingAnswer}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-purple-300 disabled:to-purple-400 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:scale-100"
              >
                {loadingAnswer ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Yanıt Hazırlanıyor...
                  </span>
                ) : (
                  `🚀 ${aiService === 'groq' ? 'GROQ' : aiService === 'huggingface' ? 'HF' : 'Yerli'} AI'ya Sor`
                )}
              </button>
            </div>
          </div>

          {/* AI Cevabı */}
          {answer && (
            <div className="mt-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 text-gray-800 rounded-lg border-l-4 border-green-400 shadow-inner">
              <div className="flex items-start gap-3">
                <div className="text-xl flex-shrink-0 mt-1">💡</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800 mb-2">AI Uzman Yanıtı:</h3>
                  <div className="whitespace-pre-wrap leading-relaxed">{answer}</div>
                </div>
              </div>
              <div className="text-xs text-green-700 mt-4 pt-3 border-t border-green-200">
                ⚠️ Bu yanıt AI tarafından üretilmiştir. Kritik işlemler için mutlaka uzman desteği
                alın.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
