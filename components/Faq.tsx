'use client';

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useState } from 'react';
import { Button } from './ui/button';
import { GlobeIcon, HelpCircleIcon } from 'lucide-react';

export function Faq() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Botão com ícone flutuante */}
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="gap-2 px-3 shadow-sm h-8"
        >
          <HelpCircleIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Dúvidas frequentes</DialogTitle>
        </DialogHeader>

        <Accordion type="single" collapsible className="w-full mt-4">
          <AccordionItem value="termos">
            <AccordionTrigger>Pra que serve o termo?</AccordionTrigger>
            <AccordionContent>
              O termo garante que o cliente esteja ciente das normas técnicas exigidas por
              certificações como INMETRO e ANATEL, e também define responsabilidades legais sobre o
              uso das etiquetas.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="contato">
            <AccordionTrigger>Como entro em contato com vocês?</AccordionTrigger>
            <AccordionContent>
              Você pode enviar um e-mail para{' '}
              <a href="mailto:certificacao@grupoativa.net" className="underline text-primary">
                certificacao@grupoativa.net
              </a>{' '}
              ou falar com a gente via{' '}
              <a
                href="https://wa.me/554792416708?text=Olá%2C+gostaria+de+falar+com+a+Apoema!"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-primary"
              >
                WhatsApp
              </a>
              .
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}
