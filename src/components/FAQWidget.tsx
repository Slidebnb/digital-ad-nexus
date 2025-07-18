import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "Ist der Handel sicher?",
    answer: "Ja, wir verwenden Verifizierungssysteme, Bewertungen und sichere Kommunikation für maximale Sicherheit."
  },
  {
    question: "Welche Gebühren fallen an?",
    answer: "Die Anmeldung und das Durchsuchen ist kostenlos. Nur erfolgreiche Trades haben eine kleine Gebühr."
  },
  {
    question: "Wie schnell geht ein Trade?",
    answer: "Die meisten Trades werden binnen weniger Minuten abgewickelt, je nach Kryptowährung."
  },
  {
    question: "Welche Kryptos werden unterstützt?",
    answer: "Bitcoin, Ethereum, Solana und weitere beliebte Kryptowährungen."
  }
];

export function FAQWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <HelpCircle className="h-4 w-4" />
          Häufige Fragen
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b-0">
              <AccordionTrigger className="text-xs py-2 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground pb-2">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}