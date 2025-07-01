'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Faq } from '@/components/Faq';

const translations = {
  pt: {
    termsTitle: 'Termos de Uso',
    anatTitle: '1. Certificação ANATEL',
    anatText:
      'Produtos com funções de radiofrequência, Bluetooth ou Wi-Fi devem conter o selo da ANATEL. Caso não tenha recebido o selo, entre em contato conosco imediatamente para providenciarmos sua emissão e envio. A aplicação é exigida por regulamentação e não deve ser removida, substituída ou alterada.',
    inmetroTitle: '2. Certificação INMETRO',
    labelingReqs: 'a. Requisitos de Rotulagem',
    labelingItems: [
      '“ATENÇÃO” / “ADVERTÊNCIA”: mínimo de 5 mm de altura',
      'Texto explicativo de advertência: mínimo de 2 mm de altura',
      'Selo horizontal OCP: mínimo de 50 mm de largura',
      'Selo quadrado OCP: mínimo de 20 mm',
      'Selo etário "0–3 anos": mínimo de 10 mm',
    ],
    projectileProducts: 'b. Produtos com projéteis ou função lançadora',
    projectileWarning:
      '“NÃO APONTAR PARA OS OLHOS E PARA A FACE. NÃO UTILIZAR PROJÉTEIS DIFERENTES DOS PROVIDOS E INDICADOS PELO FABRICANTE DO PRODUTO.”',
    batteryProducts: 'c. Produtos com pilhas ou baterias',
    batteryText:
      'É obrigatória a inclusão de advertências de segurança quanto ao uso de pilhas ou baterias. Também devem constar: modelo, tipo e quantidade utilizadas.',
    responsibilityTitle: '3. Responsabilidade sobre Informações Complementares',
    responsibilityText:
      'Informações fora do escopo da certificação (como nome do importador, imagens ou textos promocionais) são de responsabilidade exclusiva do importador ou adquirente. Não é permitido modificar ou personalizar as etiquetas fornecidas, pois isso compromete a conformidade com os órgãos reguladores e pode gerar penalidades em fiscalizações.',
    finalTitle: '4. Recomendações Finais',
    finalText:
      'As etiquetas devem ser fixadas de forma indelével e não podem se desprender até a chegada ao consumidor final. É vedada a aplicação solta, destacável ou separada do produto. É proibido reproduzir, redimensionar ou redesenhar as etiquetas sem orientação técnica expressa da nossa equipe. Em caso de dúvidas, entre em contato conosco para orientações específicas.',
    clickToDownload: 'Clique para iniciar o download',
    enterEmail: 'Preencha seu nome para liberar o download',
    acceptTerms: 'Aceite os termos para realizar o download das etiquetas',
    linkReady: 'Link Pronto!',
    downloadLink: 'Clique aqui para baixar',
    emailLabel: 'Seu nome',
    submit: 'Gerar link de download',
    validating: 'Validando...',
    acceptAndContinue: 'Aceitar e continuar',
    acceptTermsCheckbox: 'Li e aceito os termos de uso',
    invalidEmail: 'Digite um nome válido.',
  },
  en: {
    termsTitle: 'Terms of Use',
    anatTitle: '1. ANATEL Certification',
    anatText:
      'Products with radiofrequency, Bluetooth or Wi-Fi functionality must have the ANATEL seal. If you have not received the seal, please contact us immediately so we can arrange for its issuance and delivery. This seal is required by regulation and must not be removed, replaced, or altered.',
    inmetroTitle: '2. INMETRO Certification',
    labelingReqs: 'a. Labeling Requirements',
    labelingItems: [
      '"ATTENTION" / "WARNING": minimum height of 5 mm',
      'Explanatory warning text: minimum height of 2 mm',
      'Horizontal OCP seal: minimum width of 50 mm',
      'Square OCP seal: minimum size of 20 mm',
      '"0–3 years" age seal: minimum size of 10 mm',
    ],
    projectileProducts: 'b. Products with projectiles or launching function',
    projectileWarning:
      '"DO NOT AIM AT EYES OR FACE. DO NOT USE PROJECTILES DIFFERENT FROM THOSE PROVIDED AND INDICATED BY THE PRODUCT MANUFACTURER."',
    batteryProducts: 'c. Products with batteries',
    batteryText:
      'It is mandatory to include safety warnings regarding battery use. The label must also specify the model, type, and quantity of batteries used.',
    responsibilityTitle: '3. Responsibility for Additional Information',
    responsibilityText:
      'Information outside the scope of certification (such as importer name, images, or promotional texts) is the sole responsibility of the importer or buyer. Modifying or customizing the provided labels is not allowed, as it compromises regulatory compliance and may result in penalties during inspections.',
    finalTitle: '4. Final Recommendations',
    finalText:
      'Labels must be permanently affixed and must not detach before reaching the end consumer. Loose, detachable, or separately applied labels are prohibited. Reproducing, resizing, or redesigning labels is not allowed without explicit technical guidance from our team. If you have any questions, please contact us for specific instructions.',
    clickToDownload: 'Click to start the download',
    enterEmail: 'Enter your name to unlock the download',
    acceptTerms: 'Accept the terms to download the labels',
    linkReady: 'Link Ready!',
    downloadLink: 'Click here to download',
    emailLabel: 'Your name complete',
    submit: 'Generate download link',
    validating: 'Validating...',
    acceptAndContinue: 'Accept and continue',
    acceptTermsCheckbox: 'I have read and accept the terms of use',
    invalidEmail: 'Enter a valid name.',
  },

  zh: {
    termsTitle: '使用条款',
    anatTitle: '1. ANATEL 认证',
    anatText:
      '具有射频、蓝牙或 Wi-Fi 功能的产品必须贴有 ANATEL 印章。如果尚未收到该印章，请立即与我们联系以安排发放和配送。该印章是法规要求的，不得移除、更换或更改。',
    inmetroTitle: '2. INMETRO 认证',
    labelingReqs: 'a. 标签要求',
    labelingItems: [
      '“注意” / “警告”：高度不少于 5 毫米',
      '警告说明文字：高度不少于 2 毫米',
      '横向 OCP 标签：宽度不少于 50 毫米',
      '正方形 OCP 标签：边长不少于 20 毫米',
      '“0–3 岁”年龄标签：边长不少于 10 毫米',
    ],
    projectileProducts: 'b. 带有发射功能的产品',
    projectileWarning: '“请勿对准眼睛和面部。请勿使用非原厂提供或推荐的发射物。”',
    batteryProducts: 'c. 含电池的产品',
    batteryText: '必须包含有关电池使用的安全警告，并注明使用的电池型号、类型和数量。',
    responsibilityTitle: '3. 补充信息的责任',
    responsibilityText:
      '不属于认证范围的信息（如进口商名称、图片或宣传文本）由进口商或购买者自行负责。禁止更改或自定义提供的标签，否则会影响合规性，并可能在检查中受到处罚。',
    finalTitle: '4. 最终建议',
    finalText:
      '标签必须牢固粘贴，且在到达终端消费者之前不得脱落。不允许标签松动、可拆卸或独立附加。禁止在未获得我方技术团队明确指导的情况下复制、修改尺寸或重新设计标签。如有疑问，请联系我们以获得具体指导。',
    clickToDownload: '点击开始下载',
    enterEmail: '请输入您的姓名以继续下载',
    acceptTerms: '请接受条款以下载标签',
    linkReady: '下载链接已就绪！',
    downloadLink: '点击此处下载',
    emailLabel: '您的姓名',
    submit: '生成下载链接',
    validating: '验证中...',
    acceptAndContinue: '接受并继续',
    acceptTermsCheckbox: '我已阅读并接受使用条款',
    invalidEmail: '请输入有效的姓名。',
  },
};

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
      <div className="top-6 fixed right-6 z-50">
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
