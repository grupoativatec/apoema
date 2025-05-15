/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Download {
  code: string;
  email: string;
  link: string;
}

// JSON falso em memória
const fakeDownloads: Download[] = [
  {
    code: "DL001",
    email: "cliente1@example.com",
    link: "https://drive.google.com/file/d/1",
  },
  {
    code: "DL002",
    email: "cliente2@example.com",
    link: "https://drive.google.com/file/d/2",
  },
  {
    code: "DL003",
    email: "cliente3@example.com",
    link: "https://drive.google.com/file/d/3",
  },
];

const Page = () => {
  const [downloads, setDownloads] = useState<Download[]>(fakeDownloads);
  const [isLoading] = useState<boolean>(false); // já temos os dados
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newCode, setNewCode] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [newLink, setNewLink] = useState<string>("");

  // Adiciona um novo item ao JSON falso
  const handleAdd = () => {
    if (!newCode || !newEmail || !newLink) return;
    const newItem: Download = {
      code: newCode,
      email: newEmail,
      link: newLink,
    };
    setDownloads((prev) => [newItem, ...prev]);
    setNewCode("");
    setNewEmail("");
    setNewLink("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-10 rounded-2xl bg-white p-8 shadow-md dark:border dark:border-white/20 dark:bg-zinc-900/80">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Downloads</h1>
        {isAdding ? (
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Código de download"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
            />
            <Input
              placeholder="Email do cliente"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <Input
              placeholder="Link do Drive"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
            />
            <Button onClick={handleAdd}>Salvar</Button>
            <Button variant="ghost" onClick={() => setIsAdding(false)}>
              Cancelar
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsAdding(true)}>Adicionar Download</Button>
        )}
      </div>

      {/* Tabela */}
      <div className="max-h-[550px] overflow-auto rounded-2xl border">
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Email do Cliente</TableHead>
                <TableHead>Link do Drive</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {downloads.map((dl) => (
                <TableRow key={dl.code}>
                  <TableCell>{dl.code}</TableCell>
                  <TableCell>{dl.email}</TableCell>
                  <TableCell>
                    <a
                      href={dl.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Abrir
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default Page;
