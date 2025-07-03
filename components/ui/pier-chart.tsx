'use client';

import * as React from 'react';
import Cookies from 'js-cookie';
import { TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig = {
  pendentes: {
    label: 'Pendentes',
    color: 'hsl(var(--chart-1))',
  },
  emAndamento: {
    label: 'Em Andamento',
    color: 'hsl(var(--chart-2))',
  },
  concluidos: {
    label: 'Concluídos',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const { status, count, fill } = payload[0].payload as {
    status: keyof typeof chartConfig;
    count: number;
    fill: string;
  };

  return (
    <div className="rounded bg-background p-2 shadow border text-sm">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: fill }} />
        <span className="font-medium">
          {chartConfig[status]?.label}: <span className="ml-1 text-muted-foreground">{count}</span>
        </span>
      </div>
    </div>
  );
}

export function TotalProcessos() {
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      const cached = Cookies.get('processo_status');

      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const isValid = Date.now() < parsed.expiration;

          if (isValid) {
            setChartData(parsed.data);
            setTotal(parsed.data.reduce((acc: number, curr: any) => acc + curr.count, 0));
            setLoading(false);
            return;
          } else {
            Cookies.remove('processo_status');
          }
        } catch (err) {
          console.error('Erro ao fazer parse do cookie processo_status:', err);
          Cookies.remove('processo_status');
        }
      }

      const res = await fetch('/api/processos/status');
      const data = await res.json();

      const formatted = [
        { status: 'pendentes', count: data.pendentes },
        { status: 'emAndamento', count: data.emAndamento },
        { status: 'concluidos', count: data.concluidos },
      ].map((item) => ({
        ...item,
        fill: chartConfig[item.status as keyof typeof chartConfig]?.color,
      }));

      const expiration = Date.now() + 60 * 60 * 1000;
      Cookies.set('processo_status', JSON.stringify({ data: formatted, expiration }), {
        expires: 1 / 24,
      });

      setChartData(formatted);
      setTotal(formatted.reduce((acc, curr) => acc + curr.count, 0));
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card className="w-full space-y-4 p-4">
        <Skeleton className="h-6 w-1/3" /> {/* Título */}
        <Skeleton className="h-4 w-2/3" /> {/* Descrição */}
        <Skeleton className="mx-auto h-[250px] w-[250px] rounded-full" /> {/* Gráfico */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" /> {/* Footer linha 1 */}
          <Skeleton className="h-4 w-2/3" /> {/* Footer linha 2 */}
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white dark:border rounded-2xl dark:border-white/20 dark:bg-zinc-900/80 dark:text-white">
      <CardHeader className="items-center pb-0">
        <CardTitle>Processos por Status</CardTitle>
        <CardDescription>Status atual dos processos LI</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<CustomTooltip />} />
            <Pie data={chartData} dataKey="count" nameKey="status" innerRadius={60} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total Processos
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Atualizado recentemente <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Visualização do status atual dos processos
        </div>
      </CardFooter>
    </Card>
  );
}
