/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
} from 'recharts';

import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import {
  getLicencasImportacaoDeferidasHoje,
  getQuantidadeLicencasImportacaoDeferidasNoMes,
  getQuantidadeLicencasImportacaoEmAnaliseNoMes,
  getQuantidadeLicencasImportacaoFeitasNoMes,
} from '@/lib/actions/li.actions';
import { FaCheckCircle, FaClock, FaThumbsUp } from 'react-icons/fa';
import { Skeleton } from '@/components/ui/skeleton';

import { ChartConfig } from '@/components/ui/chart';
import { TotalProcessos } from '@/components/ui/pier-chart';
import { TopProdutosChart } from '@/components/ui/bar-chart';

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
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
  const [quantidadeLicencasEmAnalise, setQuantidadeLicencasEmAnalise] = useState<number>(0);
  const [quantidadeLicencasDeferidas, setQuantidadeLicencasDeferidas] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const chartData = [
    { browser: 'chrome', visitors: 275, fill: 'var(--color-chrome)' },
    { browser: 'safari', visitors: 200, fill: 'var(--color-safari)' },
    { browser: 'firefox', visitors: 287, fill: 'var(--color-firefox)' },
    { browser: 'edge', visitors: 173, fill: 'var(--color-edge)' },
    { browser: 'other', visitors: 190, fill: 'var(--color-other)' },
  ];

  const chartData2 = [
    { month: 'January', desktop: 186 },
    { month: 'February', desktop: 305 },
    { month: 'March', desktop: 237 },
    { month: 'April', desktop: 73 },
    { month: 'May', desktop: 209 },
    { month: 'June', desktop: 214 },
  ];

  const chartConfig = {
    visitors: {
      label: 'Visitors',
    },
    chrome: {
      label: 'Chrome',
      color: 'hsl(var(--chart-1))',
    },
    safari: {
      label: 'Safari',
      color: 'hsl(var(--chart-2))',
    },
    firefox: {
      label: 'Firefox',
      color: 'hsl(var(--chart-3))',
    },
    edge: {
      label: 'Edge',
      color: 'hsl(var(--chart-4))',
    },
    other: {
      label: 'Other',
      color: 'hsl(var(--chart-5))',
    },
  } satisfies ChartConfig;

  const chartConfig2 = {
    desktop: {
      label: 'Desktop',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig;

  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []);

  useEffect(() => {
    const fetchLicencas = async () => {
      const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
      const cacheKey = 'licencasDeferidasHoje';
      const cacheDateKey = 'licencasDeferidasHojeDate';

      // 1a) Mostrar cache imediatamente, se for do dia de hoje
      const cachedData = localStorage.getItem(cacheKey);
      const cachedDate = localStorage.getItem(cacheDateKey);
      if (cachedData && cachedDate === today) {
        setLiData(JSON.parse(cachedData));
        setIsLoading(false);
      }

      // 1b) Sempre buscar dados frescos em background
      try {
        const licencas = await getLicencasImportacaoDeferidasHoje();
        const formatadas = licencas.map((item: LicencaImportacao) => ({
          ...item,
          previsaoDeferimento: item.previsaoDeferimento || 'N/A',
          situacao: item.situacao || 'Indefinido',
        }));

        localStorage.setItem(cacheKey, JSON.stringify(formatadas));
        localStorage.setItem(cacheDateKey, today);
        setLiData(formatadas);
      } catch (error) {
        console.error('Erro ao buscar Licenças deferidas hoje:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLicencas();
  }, []);

  useEffect(() => {
    const fetchQuantidades = async () => {
      const monthYear = `${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
      const cacheKey = 'quantidadesLicencasMes';
      const cacheDateKey = 'quantidadesLicencasMesDate';

      const cachedRaw = localStorage.getItem(cacheKey);
      const cachedMonthYear = localStorage.getItem(cacheDateKey);
      if (cachedRaw && cachedMonthYear === monthYear) {
        const { feitas, emAnalise, deferidas } = JSON.parse(cachedRaw);
        setQuantidadeLicencas(feitas);
        setQuantidadeLicencasEmAnalise(emAnalise);
        setQuantidadeLicencasDeferidas(deferidas);
      }

      try {
        const feitas = await getQuantidadeLicencasImportacaoFeitasNoMes();
        const emAnalise = await getQuantidadeLicencasImportacaoEmAnaliseNoMes();
        const deferidas = await getQuantidadeLicencasImportacaoDeferidasNoMes();
        const novas = { feitas, emAnalise, deferidas };

        localStorage.setItem(cacheKey, JSON.stringify(novas));
        localStorage.setItem(cacheDateKey, monthYear);

        setQuantidadeLicencas(feitas);
        setQuantidadeLicencasEmAnalise(emAnalise);
        setQuantidadeLicencasDeferidas(deferidas);
      } catch (error) {
        console.error('Erro ao buscar quantidades:', error);
      }
    };

    fetchQuantidades();
  }, []);

  type StatusStyles = { [key: string]: [string, JSX.Element] };

  const statusBadge = (status: string) => {
    const styles: StatusStyles = {
      Deferida: [
        'bg-green/30 text-green-700',
        <CheckCircleIcon key="deferida" className="size-4 text-green" />,
      ],
      'Em Análise': [
        'bg-yellow-100 text-yellow-700',
        <ClockIcon key="em-analise" className="size-4 text-yellow-600" />,
      ],
      Cancelada: [
        'bg-red/30 text-red-600',
        <XCircleIcon key="cancelada" className="size-4 text-red" />,
      ],
      default: [
        'bg-gray-100 text-gray-600',
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

  const formatBRDate = (dateStr?: string) => {
    // se veio false ou veio explícito 'N/A', joga o traço
    if (!dateStr || dateStr === 'N/A') return '-';

    // tenta dar parse direto na string que vier
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? '-' // parsing falhou
      : date.toLocaleDateString('pt-BR'); // format BR
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
                label: 'PROCESSOS FEITOS NO MÊS',
                value: quantidadeLicencas,
                icon: <FaCheckCircle className="text-3xl text-blue" />,
              },
              {
                label: 'LIS A DEFERIR NO MÊS',
                value: quantidadeLicencasEmAnalise,
                icon: <FaClock className="text-3xl text-blue" />,
              },
              {
                label: 'LIS DEFERIDAS NO MÊS',
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
                  <p className="text-xs text-gray-500 dark:text-light-200">{item.label}</p>
                  <h3 className="text-xl font-bold">{item.value}</h3>
                </div>
                <div>{item.icon}</div>
              </motion.div>
            ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 ">
        <div className="w-full">
          <TotalProcessos />
        </div>
        <div className="w-full">
          <TopProdutosChart />
        </div>
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
                    <td className="py-3">{formatBRDate(item.previsaoDeferimento)}</td>
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
