export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT!,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
  userCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION!,
  filesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_FILES_COLLECTION!,
  licencaImportacaoCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_LICENCADEIMPORTACAO_COLLECTION!,
  certificationsCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_CERTIFICACOES_COLLECTION!,
  notificationsCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATION_COLLECTION!,
  orquestraCollectionId: process.env.NEXT_PUBLIC_APPWRITE_ORQUESTRA_COLLECTION!,

  bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET!,
  secretKey: process.env.NEXT_APPWRITE_SECRET!,
};
