import { Models } from "node-appwrite";
import React from "react";

const FileDelete = ({ file }: { file: Models.Document }) => {
  return (
    <p className="delete-confirmation">
      Tem certeza que deseja deletar?<br></br>
      <span className="delete-file-name">{file.name}</span>
    </p>
  );
};

export default FileDelete;
