'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Faq } from '@/components/Faq';
import { translations } from '@/lib/translations';

export default function DownloadByCodePage() {
  const { code } = useParams();
  const [locale, setLocale] = useState<'pt' | 'en' | 'zh'>(getValidLocale());
  const t = translations[locale];
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [name, setName] = useState('');
  const [termsChecked, setTermsChecked] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const termsRef = useRef<HTMLDivElement>(null);

  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  // Cookie helpers
  function setCookie(name: string, value: string, days = 30) {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  }

  function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  function getValidLocale(): 'pt' | 'en' | 'zh' {
    const raw = getCookie('locale');
    if (raw === 'pt' || raw === 'en' || raw === 'zh') return raw;
    return 'pt'; // fallback
  }

  useEffect(() => {
    const el = termsRef.current;
    if (!el) return;

    // Caso mobile (sem overflow), libera direto
    const isMobile = window.innerWidth < 640; // Tailwind 'sm' breakpoint
    if (isMobile) {
      setHasScrolledToBottom(true);
      return;
    }

    // Caso desktop, monitora o scroll
    const handleScroll = () => {
      const bottomReached = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
      if (bottomReached) {
        setHasScrolledToBottom(true);
      }
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAccept = () => {
    if (termsChecked) setHasAcceptedTerms(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/etiquetas/validateDownloadForm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, name, termsAccepted: true }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erro desconhecido');

      window.location.href = data.link;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLocale = (newLocale: 'pt' | 'en' | 'zh') => {
    setCookie('locale', newLocale);
    setLocale(newLocale);
  };

  return (
    <div className="bg-gray-100 dark:border relative rounded-md dark:bg-zinc-900 flex flex-col md:items-center md:justify-center md:px-4 md:py-12">
      <div className="top-6 fixed right-6 z-50 flex gap-2">
        <LanguageSwitcher locale={locale} changeLocale={changeLocale} />
        <Faq />
      </div>
      <div className="w-full max-w-7xl min-h-screen md:min-h-0 flex flex-col md:grid md:grid-cols-2 md:rounded-xl overflow-hidden shadow-xl bg-white dark:bg-zinc-900">
        {/* LEFT */}
        <div
          className="relative flex flex-col items-center justify-center text-white px-6 py-16 md:px-8 md:py-20 w-full  overflow-hidden bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage: 'url("/bg-apoema.png")',
          }}
        >
          <div className="absolute inset-0 bg-black/30 z-0" />
          <div className="relative z-10 text-center space-y-6">
            <h1 className="text-3xl md:text-4xl font-extrabold">APOEMA</h1>
            <p className="text-base md:text-lg leading-relaxed">
              {link ? t.clickToDownload : hasAcceptedTerms ? t.enterEmail : t.acceptTerms}
            </p>
          </div>
        </div>
        {/* RIGHT */}
        <div className="flex flex-col justify-center p-8 sm:p-12 w-full">
          <div className="w-full max-w-4xl mx-auto space-y-6 min-h-[500px] flex flex-col justify-center">
            {link ? (
              <div className="space-y-4 text-center">
                <h2 className="text-2xl font-bold">{t.linkReady}</h2>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-primary underline"
                >
                  {t.downloadLink}
                </a>
              </div>
            ) : hasAcceptedTerms ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-100 text-red-800 border border-red-300 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    {t.emailLabel}
                  </label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`bg-white dark:bg-zinc-800 transition-all border ${
                      name && name.trim().length < 2
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-zinc-700'
                    }`}
                  />
                  {name && name.trim().length < 2 && (
                    <p className="text-xs text-red-600 mt-1">Digite um nome válido.</p>
                  )}
                </div>

                <Button type="submit" disabled={!name || isLoading} className="w-full py-3">
                  {isLoading ? t.validating : t.submit}
                </Button>
              </form>
            ) : (
              <>
                <h2 className="text-center text-2xl font-bold">{t.termsTitle}</h2>

                {/* Caixa de Termos */}
                <div
                  ref={termsRef}
                  className="relative w-full  max-w-3xl sm:max-h-[500px] sm:overflow-y-auto rounded-lg  bg-gray-50 p-6 text-sm text-gray-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-300 "
                >
                  {/* Botão de expandir */}
                  <button
                    onClick={() => setShowTermsModal(true)}
                    className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700"
                    title="Expandir termos"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-500 dark:text-gray-300"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 3h-3a.75.75 0 00-.75.75v3m0 11.25v-3m0 0h3m-3 0v3a.75.75 0 00.75.75h3m11.25-11.25v3m0 0h-3m3 0V3.75a.75.75 0 00-.75-.75h-3"
                      />
                    </svg>
                  </button>

                  {/* Termos renderizados */}
                  <section className="pb-4">
                    <h3 className="text-base font-semibold mb-1 ">{t.anatTitle}</h3>
                    <p className="leading-relaxed">{t.anatText}</p>
                  </section>

                  <section className="py-4 space-y-2">
                    <h3 className="text-base font-semibold divide-y border-t divide-gray-300 dark:divide-zinc-700">
                      {t.inmetroTitle}
                    </h3>
                    {t.labelingReqs && <p className="font-medium">{t.labelingReqs}</p>}
                    {t.labelingItems?.length && (
                      <ul className="list-disc list-inside space-y-1">
                        {t.labelingItems.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    )}
                    {t.projectileProducts && (
                      <p className="font-medium mt-2">{t.projectileProducts}</p>
                    )}
                    {t.projectileWarning && (
                      <p className="leading-relaxed">{t.projectileWarning}</p>
                    )}
                    {t.batteryProducts && <p className="font-medium mt-2">{t.batteryProducts}</p>}
                    {t.batteryText && <p className="leading-relaxed">{t.batteryText}</p>}
                  </section>

                  <section className="py-4">
                    <h3 className="text-base font-semibold divide-y border-t divide-gray-300 dark:divide-zinc-700">
                      {t.responsibilityTitle}
                    </h3>
                    <p className="leading-relaxed">{t.responsibilityText}</p>
                  </section>

                  <section className="pt-4">
                    <h3 className="text-base font-semibold divide-y border-t divide-gray-300 dark:divide-zinc-700">
                      {t.finalTitle}
                    </h3>
                    <p className="leading-relaxed">{t.finalText}</p>
                  </section>
                </div>

                <label className="inline-flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={termsChecked}
                    disabled={!hasScrolledToBottom}
                    onChange={(e) => setTermsChecked(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 dark:border-zinc-600
                    disabled:opacity-40 disabled:cursor-not-allowed"
                  />

                  <span className="ml-2">{t.acceptTermsCheckbox}</span>
                </label>

                <Button
                  onClick={handleAccept}
                  disabled={!termsChecked}
                  className={`w-full py-3 mt-2 text-white font-medium rounded-md hover:brightness-110 transition-all duration-200 ${
                    !termsChecked ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg,rgba(255, 177, 61, 1) 25%, rgba(255, 131, 15, 1) 74%)',
                  }}
                >
                  {t.acceptAndContinue}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 max-w-3xl w-full max-h-[80vh] rounded-lg overflow-y-auto p-6 shadow-xl relative">
            <button
              onClick={() => setShowTermsModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-4">{t.termsTitle}</h2>

            {/* Conteúdo duplicado da caixa de termos */}
            <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300">
              <section>
                <h3 className="font-semibold mb-1">{t.anatTitle}</h3>
                <p>{t.anatText}</p>
              </section>

              <section>
                <h3 className="font-semibold">{t.inmetroTitle}</h3>
                <p className="font-medium">{t.labelingReqs}</p>
                <ul className="list-disc list-inside space-y-1">
                  {t.labelingItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <p className="mt-2 font-medium">{t.projectileProducts}</p>
                <p>{t.projectileWarning}</p>
                <p className="mt-2 font-medium">{t.batteryProducts}</p>
                <p>{t.batteryText}</p>
              </section>

              <section>
                <h3 className="font-semibold">{t.responsibilityTitle}</h3>
                <p>{t.responsibilityText}</p>
              </section>

              <section>
                <h3 className="font-semibold">{t.finalTitle}</h3>
                <p>{t.finalText}</p>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
