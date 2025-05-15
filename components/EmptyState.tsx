import { useEffect, useState } from "react";
import Lottie from "lottie-react";

import successLis from "../public/animations/success.json";
import successLiconferencia from "../public/animations/successLiconferencia.json";

interface EmptyStateProps {
  tab: "lis" | "liconferencia" | "orquestra";
}

const messagesByTab: Record<EmptyStateProps["tab"], string[]> = {
  lis: [
    "Sem LIs pendentes no momento. 👌",
    "Você concluiu todas as LIs a fazer! 💪",
    "Tudo resolvido no LIS. Excelente trabalho! 🎯",
  ],
  liconferencia: [
    "Tudo conferido por aqui. 👀",
    "Nenhuma LI pendente de conferência. 🧾",
    "Conferência em dia. Siga com confiança! ✅",
  ],
  orquestra: [
    "Nada pendente na orquestra. 🎼",
    "Tudo orquestrado com maestria! 🎻",
    "Processos finalizados. Respire fundo. 🌿",
  ],
};

const animationsByTab: Record<EmptyStateProps["tab"], object> = {
  lis: successLis,
  liconferencia: successLiconferencia,
  orquestra: successLiconferencia,
};

export default function EmptyState({ tab }: EmptyStateProps) {
  const [randomMsg, setRandomMsg] = useState("");

  useEffect(() => {
    const messages = messagesByTab[tab] || [];
    const index = Math.floor(Math.random() * messages.length);
    setRandomMsg(messages[index]);
  }, [tab]);

  const animation = animationsByTab[tab];

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
      <Lottie
        animationData={animation}
        loop
        autoplay
        className="size-56 md:size-56"
      />
      <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
        {randomMsg}
      </p>
    </div>
  );
}
