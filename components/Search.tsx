"use client";
/* eslint-disable tailwindcss/no-custom-classname */
import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Models } from "node-appwrite";
import { getFiles } from "@/lib/actions/file.actions";
import Thumbnail from "./Thumbnail";
import { useDebounce } from "use-debounce";

const Search = ({ closeModal }: { closeModal: () => void }) => {
  const [query, setQuery] = useState("");
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const [results, setResults] = useState<Models.Document[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [debounceQuery] = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      const trimmedQuery = debounceQuery.trim();

      if (trimmedQuery === "") {
        setResults([]);
        setOpen(false);
        return;
      }

      try {
       // Buscar apenas arquivos do tipo "certificados"
        const files = await getFiles({ types: ["certificados"], searchText: trimmedQuery });

        // Caso queira habilitar a busca global, comente a linha acima e descomente abaixo:
        // const files = await getFiles({ types: [], searchText: trimmedQuery });

        if (files.documents.length === 0) {
          setResults([]);
          setOpen(false);
        } else {
          setResults(files.documents);
          setOpen(true);
        }
      } catch (error) {
        console.error("Erro ao buscar arquivos:", error);
        setResults([]);
        setOpen(false);
      }
    };

    fetchFiles();
  }, [debounceQuery]);

  useEffect(() => {
    if (!searchQuery) {
      setQuery("");
    }
  }, [searchQuery]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleClickItem = (file: Models.Document) => {
    setOpen(false);
    setResults([]);
    const typePath =
      file.type === "video" || file.type === "audio"
        ? "media"
        : file.type === "certificados"
          ? "certificados"
          : `${file.type}s`;

    router.push(`/${typePath}?query=${query}`);

    closeModal();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        ref={inputRef}
        value={query}
        placeholder="Pesquisar arquivos..."
        className="focus:border-blue-500 focus:ring-blue-300 placeholder:gray-500 dark:focus:ring-blue-500 w-full rounded-lg border border-black/10 bg-white/90 px-4 py-3 text-sm text-black shadow-inner outline-none transition duration-150 focus:ring-2 dark:bg-zinc-900/80 dark:text-white"
        onChange={(e) => setQuery(e.target.value)}
      />

      {open && (
        <ul className="mt-2 max-h-60 w-full overflow-auto rounded-lg bg-white/90 shadow-md ring-1 ring-black/5 backdrop-blur-md dark:bg-zinc-900/80">
          {results.length > 0 ? (
            results.map((file) => (
              <li
                key={file.$id}
                className="flex cursor-pointer items-center justify-between gap-2 px-4 py-3 transition-colors hover:bg-gray-100 dark:hover:bg-zinc-700"
                onClick={() => handleClickItem(file)}
              >
                <div className="flex items-center gap-3">
                  <Thumbnail
                    type={file.type}
                    extension={file.extension}
                    url={file.url}
                    className="size-8 min-w-8"
                  />
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {file.name}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              Sem resultados.
            </p>
          )}
        </ul>
      )}
    </div>
  );
};

export default Search;
