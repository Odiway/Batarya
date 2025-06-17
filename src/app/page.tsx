'use client';
import Image from 'next/image';
import React from 'react';

export default function HomePage() {
  return (
    <main
      className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-blue-600 via-blue-200 to-white px-4 z-0"
      style={{
        minHeight: '100vh',
        minWidth: '100vw',
        backgroundImage: "url('/temsa-social.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="relative w-full max-w-5xl bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-16 flex flex-col items-center animate-fade-in">
        <Image
          src="/logo.png"
          alt="TEMSA Ar-Ge Batarya"
          className="w-36 h-36 mb-8 drop-shadow-lg animate-bounce-slow"
          width={144}
          height={144}
        />
        <h1 className="text-5xl md:text-6xl font-extrabold text-blue-900 mb-5 text-center drop-shadow">
          TEMSA Ar-Ge Batarya Yönetim Sistemi
        </h1>
        <p className="text-gray-700 text-2xl md:text-3xl text-center mb-10">
          Batarya teknolojilerinde yenilikçi çözümler ve akıllı yönetim platformu.
          <br />
          Projenize hoş geldiniz!
        </p>
        <a
          href="/auth/Login"
          className="inline-block bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white font-bold py-4 px-16 rounded-full shadow-lg transition-all duration-200 scale-100 hover:scale-105 text-xl"
        >
          Giriş Yap
        </a>

        <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-100 rounded-full blur-2xl opacity-60 animate-pulse" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-300 rounded-full blur-2xl opacity-40 animate-pulse" />
      </div>
      <footer className="mt-16 text-gray-500 text-lg text-center">
        © {new Date().getFullYear()} TEMSA Ar-Ge. Tüm hakları saklıdır.
      </footer>
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease;
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2.5s infinite;
        }
      `}</style>
    </main>
  );
}
