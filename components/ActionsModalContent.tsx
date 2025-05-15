import { Models } from "node-appwrite";
import React from "react";
import Thumbnail from "./Thumbnail";
import { convertFileSize } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Image from "next/image";

// Função para capitalizar a primeira letra de uma string
const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Função para formatar a data no padrão brasileiro (DD/MM/AAAA HH:mm)
const formatDateBR = (date: string) => {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Intl.DateTimeFormat("pt-BR", options).format(new Date(date));
};

const ImageThumbnail = ({ file }: { file: Models.Document }) => {
  return (
    <div className="file-details-thumbnail">
      <Thumbnail type={file.type} extension={file.extension} url={file.url} />
      <div className="flex flex-col">
        <p className="subtitle-2 mb-1">{file.name}</p>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex">
    <p className="file-details-label">{label}</p>
    <p className="file-details-value">{value}</p>
  </div>
);

export const FileDetails = ({ file }: { file: Models.Document }) => {
  // Verifica se file.owner é um objeto e usa uma propriedade específica, como fullName ou email
  const ownerName =
    file.owner && typeof file.owner === "object"
      ? capitalizeFirstLetter(file.owner.fullName || file.owner.email)
      : capitalizeFirstLetter(file.owner || "");

  return (
    <>
      <ImageThumbnail file={file} />
      <DetailRow label={"Formato: "} value={file.extension.toUpperCase()} />
      <DetailRow label={"Tamanho: "} value={convertFileSize(file.size)} />
      <DetailRow label={"Enviado por: "} value={ownerName} />
      <DetailRow label={"Criado em: "} value={formatDateBR(file.$createdAt)} />
      <DetailRow label={"Editado em: "} value={formatDateBR(file.$updatedAt)} />
    </>
  );
};

interface Props {
  file: Models.Document;
  onInputChange: React.Dispatch<React.SetStateAction<string[]>>;
  onRemove: (email: string) => void;
}

export const ShareInput = ({ file, onInputChange, onRemove }: Props) => {
  return (
    <>
      <ImageThumbnail file={file} />

      <div className="share-wrapper">
        <p className="subtitle-2 pl-1 text-light-100">
          Compartilhe com outros Usarios.
        </p>
        <Input
          type="email"
          placeholder="Digite o email"
          onChange={(e) => onInputChange(e.target.value.trim().split(","))}
          className="share-input-field"
        />
        <div className="p-4">
          <div className="flex justify-between">
            <p className="subtitle-2 text-light-100">Compartilhado com</p>
            <p className="subtitle-2 text-light-100">
              {file.users.length} Usuarios
            </p>
          </div>
          <ul className="pt-2">
            {file.users.map((email: string) => (
              <li
                className="flex items-center justify-between gap-2"
                key={email}
              >
                <p className="subtitle-2">{email}</p>
                <Button
                  onClick={() => onRemove(email)}
                  className="share-remove-user"
                >
                  <Image
                    src="/assets/icons/remove.svg"
                    alt="remove"
                    width={24}
                    height={24}
                    className="remove-icon"
                  />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};
