import Link from "next/link";
import { Models } from "node-appwrite";
import React from "react";
import Thumbnail from "./Thumbnail";
import { convertFileSize } from "@/lib/utils";
import ActionsDropdown from "./ActionsDropdown";

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

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const Card = ({ file }: { file: Models.Document }) => {
  return (
    <Link href={file.url} target="_blank" className="file-card">
      <div className="flex justify-between">
        <Thumbnail
          type={file.type}
          extension={file.extension}
          url={file.url}
          className="!size-20"
          imageClassName="!size-11"
        />

        <div className="flex flex-col items-end justify-between">
          <ActionsDropdown file={file} />
          <p className="body-1">{convertFileSize(file.size)}</p>
        </div>
      </div>

      <div className="file-card-details">
        <p className="subtitle-2 line-clamp-1 dark:text-light-200">
          {file.name}
        </p>
        <p className="body-2 text-light-100 dark:text-light-200">
          Criado em: {formatDateBR(file.$createdAt)}
        </p>
        <p className="caption line-clamp-1 text-light-200 dark:text-light-200">
          Enviado por: {capitalizeFirstLetter(file.owner.fullName)}
        </p>
      </div>
    </Link>
  );
};

export default Card;
