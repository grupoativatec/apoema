'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis } from 'recharts';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

// Tipo dos itens vindos da API
interface Produto {
  Produto: string;
  Registro: string;
  Marca: string;
  QTD: number;
}

export function TopProdutosChart() {
  const [data, setData] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatNumber = (value: number) => value.toLocaleString('pt-BR');

  const chartConfig = {
    QTD: { label: 'Quantidade', color: 'hsl(var(--chart-1))' },
  } satisfies ChartConfig;

  useEffect(() => {
    const fetchData = () => {
      fetch('/api/top-produtos')
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((json: Produto[]) => {
          setData(json);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError('Não foi possível carregar os dados.');
          setLoading(false);
        });
    };

    // Inicializa os dados
    fetchData();

    // Atualiza os dados a cada 5 minutos (300000ms)
    const intervalId = setInterval(fetchData, 300000); // 5 minutos

    // Cleanup do intervalo ao desmontar o componente
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <Card className="w-full animate-pulse ">
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/4 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
        <CardFooter className="flex-col items-start gap-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </CardFooter>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Top Produtos</CardTitle>
          <CardDescription>Erro ao carregar</CardDescription>
        </CardHeader>
        <CardContent>{error}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white dark:border rounded-2xl dark:border-white/20 dark:bg-zinc-900/80 dark:text-white">
      <CardHeader>
        <CardTitle>Ranking de Produtos</CardTitle>
        <CardDescription>TOP 6 🚀</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full text-[10px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="Produto"
                tickLine={false}
                axisLine={false}
                interval={0}
                tick={{ fontSize: 10 }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
                formatter={(value) => formatNumber(value as number)}
              />
              <Bar dataKey="QTD" fill="var(--color-QTD)" radius={8}>
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={formatNumber}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Emissão mensal de etiquetas INMETRO <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Total de etiquetas geradas por produto
        </div>
      </CardFooter>
    </Card>
  );
}
