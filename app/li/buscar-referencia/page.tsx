'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Resultado = {
  REF_Cliente: string;
  REF_Apoema: string;
  Produto: string;
  Registro: string;
  CDB: string;
  Marca: string;
  PROCESSO: string;
  CLIENTAO: string;
  DATA: string;
};

const Page = () => {
  const [referencia, setReferencia] = useState('');
  const [data, setData] = useState<Resultado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!referencia) return;

    setLoading(true);
    setError(null);
    setData([]);

    try {
      const response = await fetch(`/api/buscar?referencia=${referencia}`);
      if (!response.ok) throw new Error('Erro ao buscar os dados');
      const result = await response.json();

      const sorted = result.sort((a: Resultado, b: Resultado) => {
        return new Date(b.DATA).getTime() - new Date(a.DATA).getTime();
      });

      setData(sorted);
    } catch (err) {
      setError('Erro ao buscar os dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto p-6 space-y-6">
      <motion.div
        layout
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="bg-white dark:border rounded-2xl dark:border-white/20 dark:bg-zinc-900/80 dark:text-white"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Busca por Referência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="w-full sm:w-auto flex-1"
              >
                <Input
                  type="text"
                  placeholder="Digite a referência"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Buscar'}
                </Button>
              </motion.div>
            </div>
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {data.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-white dark:border rounded-2xl dark:border-white/20 dark:bg-zinc-900/80 dark:text-white"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Resultados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>REF. Cliente</TableHead>
                        <TableHead>REF. Apoema</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Registro</TableHead>
                        <TableHead>Marca</TableHead>
                        <TableHead>PROCESSO</TableHead>
                        <TableHead>CLIENTE</TableHead>
                        <TableHead>DATA</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.REF_Cliente}</TableCell>
                          <TableCell>{item.REF_Apoema}</TableCell>
                          <TableCell>{item.Produto}</TableCell>
                          <TableCell>{item.Registro}</TableCell>
                          <TableCell>{item.Marca}</TableCell>
                          <TableCell className="whitespace-nowrap max-w-[100px] overflow-hidden text-ellipsis">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help block overflow-hidden text-ellipsis whitespace-nowrap">
                                    {item.PROCESSO}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{item.PROCESSO}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="whitespace-nowrap max-w-[100px] overflow-hidden text-ellipsis">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help block overflow-hidden text-ellipsis whitespace-nowrap">
                                    {item.CLIENTAO}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{item.CLIENTAO}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>{new Date(item.DATA).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Page;
