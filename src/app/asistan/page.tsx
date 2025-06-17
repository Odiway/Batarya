'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, MessageSquare, Search, CheckCircle, Clock, Wrench } from 'lucide-react';

// GEREKLİ KÜTÜPHANELERİ IMPORT EDİYORUZ
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';

// PDF.js worker'ının yolunu belirtiyoruz. Bu satır, kütüphanenin doğru çalışması için gereklidir.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

// Type definitions (Aynı kalıyor)
interface FileContent {
  [fileName: string]: string;
}

interface ConversationMessage {
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  sourceFile?: string;
}

const MaintenanceDocumentAnalyzer = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  // extractedContent state'ini, dosyanın işlenip işlenmediğini takip etmek için kullanmaya devam edebiliriz.
  const [extractedContent, setExtractedContent] = useState<FileContent>({});
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isAnswering, setIsAnswering] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'analyze'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // handleFileUpload: Dosyaların metnini TARAYICIDA çıkarır ve sunucuya JSON olarak gönderir.
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsProcessing(true);
    setUploadedFiles((prev) => [...prev, ...files]);

    const extractedTexts: { [fileName: string]: string } = {};

    // Her dosyayı tarayıcıda döngüye alıp metnini çıkarıyoruz.
    for (const file of files) {
      try {
        let text = '';

        // Excel ve CSV dosyalarını işleme
        if (
          file.type.includes('spreadsheet') ||
          file.type.includes('excel') ||
          file.name.endsWith('.xlsx') ||
          file.name.endsWith('.xls') ||
          file.type === 'text/csv'
        ) {
          const arrayBuffer = await file.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          text = XLSX.utils.sheet_to_csv(worksheet);
        } else {
          console.warn(`Desteklenmeyen dosya türü atlandı: ${file.name}`);
          continue;
        }
        extractedTexts[file.name] = text;
      } catch (error) {
        console.error(`${file.name} işlenirken hata oluştu:`, error);
        alert(`${file.name} dosyası okunamadı. Lütfen dosyanın bozuk olmadığını kontrol edin.`);
      }
    }

    if (Object.keys(extractedTexts).length === 0) {
      alert('Seçilen dosyalardan metin içeriği çıkarılamadı.');
      setIsProcessing(false);
      return;
    }

    // DEĞİŞİKLİK: Sunucuya FormData yerine, metinleri içeren JSON gönderiyoruz.
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: extractedTexts }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Sunucu hatası: ${errorData.message || 'Bilinmeyen bir hata oluştu.'}`);
      }

      const data = await response.json();
      alert(data.message);

      // Başarıyla işlenen dosyalar için durumu güncelleyelim (yeşil checkmark için)
      setExtractedContent((prev) => ({
        ...prev,
        ...Object.fromEntries(Object.keys(extractedTexts).map((key) => [key, 'processed'])),
      }));
    } catch (error) {
      console.error('Metinler sunucuya gönderilirken hata:', error);
      alert('Dosyalar sunucuya gönderilirken bir hata oluştu:');
    } finally {
      setIsProcessing(false);
    }
  };

  // handleQuestionSubmit: Sadece soruyu backend'e gönderir.
  const handleQuestionSubmit = async (): Promise<void> => {
    if (!currentQuestion.trim()) return;

    // DEĞİŞİKLİK: Kontrolü, kullanıcının gördüğü 'uploadedFiles' listesine göre yapıyoruz.
    if (uploadedFiles.length === 0) {
      alert('Lütfen önce analiz için bir belge yükleyin.');
      return;
    }

    const userMessage: ConversationMessage = {
      type: 'user',
      content: currentQuestion,
      timestamp: new Date().toLocaleTimeString(),
    };
    setConversation((prev) => [...prev, userMessage]);
    setCurrentQuestion('');
    setIsAnswering(true);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // DEĞİŞİKLİK: Artık 'extracted_content' göndermiyoruz. Sunucu bunu veritabanından bulacak.
        body: JSON.stringify({
          question: userMessage.content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! Status: ${response.status} - ${errorData.message || 'Bilinmeyen Hata'}`,
        );
      }

      const data = await response.json();
      const aiResponse: ConversationMessage = {
        type: 'ai',
        content: data.answer,
        sourceFile: data.sourceFile,
        timestamp: new Date().toLocaleTimeString(),
      };
      setConversation((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('Soru sorma hatası:', error);
      const errorMessage: ConversationMessage = {
        type: 'ai',
        content: 'Üzgünüm, sorunuzu yanıtlarken bir hata oluştu. Lütfen konsolu kontrol edin.',
        timestamp: new Date().toLocaleTimeString(),
      };
      setConversation((prev) => [...prev, errorMessage]);
    } finally {
      setIsAnswering(false);
    }
  };

  // getFileIcon fonksiyonu ve return içindeki JSX yapısı aynı kalıyor.
  // ... (Hiçbir değişiklik yapılmadı)

  const getFileIcon = (fileName: string): string => {
    if (fileName.toLowerCase().includes('pdf')) return '📄';
    if (fileName.toLowerCase().includes('xlsx') || fileName.toLowerCase().includes('excel'))
      return '📊';
    if (fileName.toLowerCase().includes('csv')) return '📑';
    return '📋';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-3">
          <Wrench className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Maintenance Document Analyzer</h1>
            <p className="text-gray-600">TEMSA Industry 4.0 - Intelligent Document Q&A System</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="h-4 w-4 inline mr-2" />
              Upload Documents
            </button>
            <button
              onClick={() => setActiveTab('analyze')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'analyze'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="h-4 w-4 inline mr-2" />
              Ask Questions
            </button>
          </nav>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="p-6">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload Maintenance Documents
              </h3>
              <p className="text-gray-600 mb-4">
                Drop PDF files (manuals, repair logs) or Excel/CSV files (technical specifications)
                here
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Choose Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Processing Indicator for file upload */}
            {isProcessing && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 animate-spin mr-3" />
                  <span className="text-blue-800">
                    Processing documents... This may take a moment.
                  </span>
                </div>
              </div>
            )}

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Uploaded Documents</h4>
                <div className="space-y-3">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getFileIcon(file.name)}</span>
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {extractedContent[file.name] ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analyze Tab */}
        {activeTab === 'analyze' && (
          <div className="p-6">
            {uploadedFiles.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Uploaded</h3>
                <p className="text-gray-600">
                  Please upload some documents first to start asking questions.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Question Input */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ask a question about your maintenance documents:
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={currentQuestion}
                      onChange={(e) => setCurrentQuestion(e.target.value)}
                      placeholder="e.g., We repaired a battery charger yesterday but it's giving errors today. Which parts did we use for that repair?"
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleQuestionSubmit()}
                      disabled={isAnswering}
                    />
                    <button
                      onClick={handleQuestionSubmit}
                      disabled={!currentQuestion.trim() || isAnswering}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isAnswering ? (
                        <Clock className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* ... (Kalan JSX aynı) ... */}

                {/* Conversation History */}
                {conversation.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900">Conversation History</h4>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {conversation.map((message, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg ${
                            message.type === 'user' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium">
                                  {message.type === 'user' ? 'Operator' : 'AI Assistant'}
                                </span>
                                <span className="text-xs text-gray-500">{message.timestamp}</span>
                              </div>
                              <div className="text-gray-800 whitespace-pre-line">
                                {message.content}
                              </div>
                              {message.sourceFile && (
                                <div className="mt-2 text-xs text-gray-600">
                                  Source: {message.sourceFile}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceDocumentAnalyzer;
