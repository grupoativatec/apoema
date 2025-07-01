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
import { HelpCircleIcon } from 'lucide-react';
import { translations } from '@/lib/translations';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function getValidLocale(): 'pt' | 'en' | 'zh' {
  const raw = getCookie('locale');
  if (raw === 'pt' || raw === 'en' || raw === 'zh') return raw;
  return 'pt';
}

export function Faq() {
  const [open, setOpen] = useState(false);
  const locale = getValidLocale();
  const t = translations[locale];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <DialogTitle>{t.faqTitle}</DialogTitle>
        </DialogHeader>

        <Accordion type="single" collapsible className="w-full mt-4">
          <AccordionItem value="termos">
            <AccordionTrigger>{t.faq.termosTitle}</AccordionTrigger>
            <AccordionContent>{t.faq.termosText}</AccordionContent>
          </AccordionItem>

          <AccordionItem value="contato">
            <AccordionTrigger>{t.faq.contatoTitle}</AccordionTrigger>
            <AccordionContent>
              {t.faq.contatoText.split('certificacao@grupoativa.net')[0]}
              <a href={`mailto:${t.faq.contatoEmail}`} className="underline text-primary">
                {t.faq.contatoEmail}
              </a>
              {' ou '}
              <a
                href={`https://wa.me/554792416708?text=${encodeURIComponent(
                  t.faq.contatoWhatsappText,
                )}`}
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
