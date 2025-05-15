/* eslint-disable @typescript-eslint/no-explicit-any */
// app/download/page.tsx
"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DownloadPage() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [termsChecked, setTermsChecked] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  const handleAccept = () => {
    if (termsChecked) {
      setHasAcceptedTerms(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLink(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/etiquetas/validateDownloadForm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro desconhecido");
      setLink(data.link);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid h-screen grid-cols-1 overflow-hidden bg-gray-100 dark:bg-zinc-900 md:grid-cols-2">
      {/* ===== LADO ESQUERDO GRÁFICO ===== */}
      <div className="relative hidden overflow-hidden md:block">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-400" />
        <div className="absolute inset-0 bg-[url('/patterns/dots.svg')] opacity-10" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-12 text-white">
          <h1 className="mb-4 text-5xl font-extrabold">Bem-vindo!</h1>
          <p className="text-xl">
            Insira seu código para gerar o link de download
          </p>
        </div>
      </div>

      {/* ===== LADO DIREITO ===== */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md rounded-2xl bg-white/90 p-8 shadow-2xl backdrop-blur-md dark:bg-zinc-900/90">
          {/* Se o link já foi gerado, mostra resultado */}
          {link ? (
            <div className="space-y-4">
              <h2 className="text-center text-2xl font-bold">Link Pronto!</h2>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-primary underline"
              >
                Clique aqui para baixar
              </a>
            </div>
          ) : hasAcceptedTerms ? (
            /* Formulário de código e email */
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-700 rounded-lg p-3">
                  {error}
                </div>
              )}
              <Input
                placeholder="Código de download"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-white dark:bg-zinc-800"
              />
              <Input
                type="email"
                placeholder="Email do cliente"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white dark:bg-zinc-800"
              />
              <Button
                type="submit"
                disabled={!code || !email || isLoading}
                className="w-full py-3"
              >
                {isLoading ? "Validando..." : "Gerar link de download"}
              </Button>
            </form>
          ) : (
            /* Tela de termos */
            <div className="space-y-6">
              {/* Aviso destacado */}
              <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-100 p-4">
                <p className="font-medium text-yellow-700">
                  Para baixar as etiquetas, você precisa aceitar os seguintes
                  termos:
                </p>
              </div>

              <h2 className="text-center text-2xl font-bold">Termos de Uso</h2>

              <div className="h-[50vh] overflow-y-auto rounded-lg border bg-gray-50 p-4 text-sm text-gray-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-400">
                <p className="mb-4 font-bold">
                  📌 Orientações para Uso e Aplicação das Etiquetas de
                  Certificação INMETRO e ANATEL
                </p>
                <p className="mb-4">
                  Prezado cliente, visando garantir a conformidade legal e
                  evitar problemas recorrentes com a modificação indevida das
                  etiquetas de certificação, encaminhamos as etiquetas do
                  INMETRO e ANATEL com as seguintes orientações obrigatórias:
                </p>
                <h3 className="mb-2 mt-4 text-base font-semibold">
                  1. Certificação ANATEL
                </h3>
                <p className="mb-4">
                  Produtos com funções de radiofrequência, Bluetooth ou Wi-Fi
                  devem conter o selo da ANATEL. Caso não tenha recebido o selo,
                  entre em contato conosco imediatamente para providenciarmos
                  sua emissão. A aplicação do selo é exigida por regulamentação
                  e não deve ser removida, substituída ou alterada.
                </p>
                <h3 className="mb-2 mt-4 text-base font-semibold">
                  2. Certificação INMETRO – Requisitos de Rotulagem
                </h3>
                <ul className="mb-4 list-inside list-disc space-y-2">
                  <li>
                    <strong>Dimensões mínimas obrigatórias:</strong>
                    <ul className="ml-4 mt-1 list-inside list-decimal space-y-1">
                      <li>
                        “ATENÇÃO” / “ADVERTÊNCIA”: mínimo de 5 mm de altura
                      </li>
                      <li>
                        Texto explicativo de advertência: mínimo de 2 mm de
                        altura
                      </li>
                      <li>Selo horizontal OCP: mínimo de 50 mm de largura</li>
                      <li>Selo quadrado OCP: mínimo de 20 mm</li>
                      <li>Selo etário “0–3 anos”: mínimo de 10 mm</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Produtos com projéteis ou função lançadora:</strong>{" "}
                    Devem conter a advertência (sem alterações no texto ou
                    formatação):
                    <br />
                    “NÃO APONTAR PARA OS OLHOS E PARA A FACE. NÃO UTILIZAR
                    PROJÉTEIS DIFERENTES DOS PROVIDOS E INDICADOS PELO
                    FABRICANTE DO PRODUTO.”
                  </li>
                  <li>
                    <strong>Produtos com pilhas ou baterias:</strong> É
                    obrigatória a inclusão de advertências de segurança quanto
                    ao uso de pilhas/baterias, indicando modelo, tipo e
                    quantidade utilizadas.
                  </li>
                </ul>
                <h3 className="mb-2 mt-4 text-base font-semibold">
                  3. Responsabilidade sobre Informações Complementares
                </h3>
                <p className="mb-4">
                  Informações fora do escopo da certificação (como nome do
                  importador, imagens ou textos promocionais) são de
                  responsabilidade do importador. Não é permitido modificar ou
                  personalizar as etiquetas fornecidas, pois isso pode gerar
                  penalidades em fiscalizações.
                </p>
                <h3 className="mb-2 mt-4 text-base font-semibold">
                  4. Recomendações Finais
                </h3>
                <ul className="list-inside list-disc space-y-2">
                  <li>
                    As etiquetas devem ser fixadas de forma indelével até a
                    chegada ao consumidor final.
                  </li>
                  <li>
                    É vedada a aplicação solta, destacável ou separada do
                    produto.
                  </li>
                  <li>
                    É proibido reproduzir, redimensionar ou redesenhar as
                    etiquetas sem orientação técnica expressa da nossa equipe.
                  </li>
                  <li>
                    Em caso de dúvidas sobre posicionamento, tamanho ou
                    conteúdo, entre em contato conosco para orientações
                    específicas.
                  </li>
                </ul>
              </div>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={termsChecked}
                  onChange={(e) => setTermsChecked(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                />
                <span className="ml-2 dark:text-gray-300">
                  Li e aceito os termos de uso
                </span>
              </label>

              <Button
                onClick={handleAccept}
                disabled={!termsChecked}
                className="w-full py-3"
              >
                Aceitar e continuar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
