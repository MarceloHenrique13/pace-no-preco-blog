"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqItem } from "@/lib/schema";

type PostFaqProps = {
  items: FaqItem[];
};

export function PostFaq({ items }: PostFaqProps) {
  if (!items.length) return null;

  return (
    <section className="mt-16 border-t border-line pt-14">
      <h2 className="font-display text-3xl italic tracking-tight text-ink md:text-4xl">
        Perguntas frequentes
      </h2>
      <Accordion type="single" collapsible className="mt-8 space-y-3" defaultValue="faq-0">
        {items.map((item, index) => (
          <AccordionItem key={item.question} value={`faq-${index}`}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
