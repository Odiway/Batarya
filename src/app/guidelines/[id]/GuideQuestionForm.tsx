// basit bir form, kullanıcıdan soru alıyor ve alert ile gösteriyor
'use client';

import { useState } from 'react';

export default function GuideQuestionForm() {
  const [question, setQuestion] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert('Sorduğun soru: ' + question);
    setQuestion('');
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
      <label>
        Sorunuzu yazın:
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ marginLeft: 10 }}
        />
      </label>
      <button type="submit" style={{ marginLeft: 10 }}>
        Gönder
      </button>
    </form>
  );
}
