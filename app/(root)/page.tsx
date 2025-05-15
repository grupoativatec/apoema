/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from "react";

import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import {
  getLicencasImportacaoDeferidasHoje,
  getQuantidadeLicencasImportacaoDeferidasNoMes,
  getQuantidadeLicencasImportacaoEmAnaliseNoMes,
  getQuantidadeLicencasImportacaoFeitasNoMes,
} from "@/lib/actions/li.actions";
import { FaCheckCircle, FaClock, FaThumbsUp } from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton";

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

type LicencaImportacao = {
  imp: string;
  importador: string;
  numeroLi: string;
  situacao: string;
  previsaoDeferimento: string;
};

const Home = () => {
  const [liData, setLiData] = useState<LicencaImportacao[]>([]);
  const [quantidadeLicencas, setQuantidadeLicencas] = useState<number>(0);
  const [quantidadeLicencasEmAnalise, setQuantidadeLicencasEmAnalise] =
    useState<number>(0);
  const [quantidadeLicencasDeferidas, setQuantidadeLicencasDeferidas] =
    useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLicencas = async () => {
      const today = new Date().toISOString().split("T")[0];
      const cachedData = localStorage.getItem("licencasDeferidasHoje");
      const cachedDate = localStorage.getItem("licencasDeferidasHojeDate");

      if (cachedData && cachedDate === today) {
        setLiData(JSON.parse(cachedData));
        setIsLoading(false);
        return;
      }

      try {
        const licencas = await getLicencasImportacaoDeferidasHoje();
        const formatadas = licencas.map((item: LicencaImportacao) => ({
          ...item,
          previsaoDeferimento: item.previsaoDeferimento || "N/A",
          situacao: item.situacao || "Indefinido",
        }));

        localStorage.setItem(
          "licencasDeferidasHoje",
          JSON.stringify(formatadas)
        );
        localStorage.setItem("licencasDeferidasHojeDate", today);
        setLiData(formatadas);
      } catch (error) {
        console.error("Erro ao buscar Licenças deferidas hoje:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!liData.length) fetchLicencas();
    else setIsLoading(false);
  }, []);

  useEffect(() => {
    const fetchQuantidades = async () => {
      const monthYear = `${new Date().getMonth()}-${new Date().getFullYear()}`;
      const cachedQuantidades = localStorage.getItem("quantidadesLicencasMes");
      const cachedMonthYear = localStorage.getItem(
        "quantidadesLicencasMesDate"
      );

      if (cachedQuantidades && cachedMonthYear === monthYear) {
        const quantidades = JSON.parse(cachedQuantidades);
        setQuantidadeLicencas(quantidades.feitas);
        setQuantidadeLicencasEmAnalise(quantidades.emAnalise);
        setQuantidadeLicencasDeferidas(quantidades.deferidas);
        return;
      }

      try {
        const feitas = await getQuantidadeLicencasImportacaoFeitasNoMes();
        const emAnalise = await getQuantidadeLicencasImportacaoEmAnaliseNoMes();
        const deferidas = await getQuantidadeLicencasImportacaoDeferidasNoMes();

        const newQuantidades = { feitas, emAnalise, deferidas };
        localStorage.setItem(
          "quantidadesLicencasMes",
          JSON.stringify(newQuantidades)
        );
        localStorage.setItem("quantidadesLicencasMesDate", monthYear);

        setQuantidadeLicencas(feitas);
        setQuantidadeLicencasEmAnalise(emAnalise);
        setQuantidadeLicencasDeferidas(deferidas);
      } catch (error) {
        console.error("Erro ao buscar quantidades:", error);
      }
    };

    fetchQuantidades();
  }, []);

  type StatusStyles = {
    [key: string]: [string, JSX.Element];
  };

  const statusBadge = (status: string) => {
    const styles: StatusStyles = {
      Deferida: [
        "bg-green/30 text-green-700",
        <CheckCircleIcon key="deferida" className="size-4 text-green" />,
      ],
      "Em Análise": [
        "bg-yellow-100 text-yellow-700",
        <ClockIcon key="em-analise" className="size-4 text-yellow-600" />,
      ],
      Cancelada: [
        "bg-red/30 text-red-600",
        <XCircleIcon key="cancelada" className="size-4 text-red" />,
      ],
      default: [
        "bg-gray-100 text-gray-600",
        <DocumentTextIcon key="default" className="size-4 text-gray-500" />,
      ],
    };
    const [style, icon] = styles[status] || styles.default;

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${style}`}
      >
        {icon}
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen space-y-6 bg-gradient-to-br p-6 text-sm dark:bg-zinc-900">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))
          : [
              {
                label: "PROCESSOS FEITOS NO MÊS",
                value: quantidadeLicencas,
                icon: <FaCheckCircle className="text-3xl text-blue" />,
              },
              {
                label: "LIS A DEFERIR NO MÊS",
                value: quantidadeLicencasEmAnalise,
                icon: <FaClock className="text-3xl text-blue" />,
              },
              {
                label: "LIS DEFERIDAS NO MÊS",
                value: quantidadeLicencasDeferidas,
                icon: <FaThumbsUp className="text-3xl text-blue" />,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-md transition hover:shadow-lg dark:border dark:border-white/20 dark:bg-zinc-900/80 dark:text-white"
              >
                <div>
                  <p className="text-xs text-gray-500 dark:text-light-200">
                    {item.label}
                  </p>
                  <h3 className="text-xl font-bold">{item.value}</h3>
                </div>
                <div>{item.icon}</div>
              </motion.div>
            ))}
      </div>

      {/* Tabela de Licenças */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="rounded-2xl bg-white p-6 shadow-lg dark:border dark:border-white/20 dark:bg-zinc-900/80 dark:text-white"
      >
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <DocumentTextIcon className="size-6 text-indigo-500" />
          Licenças de Importação Próximas de Deferimento
        </h2>
        <div className="overflow-auto">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="mb-2 h-10 rounded-lg" />
            ))
          ) : (
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="text-gray-500 dark:text-light-200">
                <tr className="border-b border-gray-200 dark:border-zinc-500">
                  <th className="pb-3">IMP</th>
                  <th>Importador</th>
                  <th>Número da LI</th>
                  <th>Status</th>
                  <th>Data de Deferimento</th>
                </tr>
              </thead>
              <tbody>
                {liData.map((item, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 capitalize hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                  >
                    <td className="py-3 font-medium">{item.imp}</td>
                    <td className="py-3">{item.importador}</td>
                    <td className="py-3">{item.numeroLi}</td>
                    <td className="py-3">{statusBadge(item.situacao)}</td>
                    <td className="py-3">{item.previsaoDeferimento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
