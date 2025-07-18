import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const testimonials = [
  {
    name: "Maria K.",
    text: "Schnell und sicher. Habe bereits mehrere Trades gemacht.",
    rating: 5,
    initials: "MK"
  },
  {
    name: "Alex P.",
    text: "Beste Plattform für Krypto-Kleinanzeigen in Deutschland.",
    rating: 5,
    initials: "AP"
  },
  {
    name: "Tom S.",
    text: "Einfache Bedienung, faire Preise, top Support!",
    rating: 5,
    initials: "TS"
  }
];

export function TestimonialWidget() {
  const currentTestimonial = testimonials[Math.floor(Date.now() / 10000) % testimonials.length];
  
  return (
    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/10 dark:border-amber-800">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Quote className="h-3 w-3 text-amber-600" />
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">
            Kundenstimme
          </span>
        </div>
        
        <div className="flex items-start gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs bg-amber-100 text-amber-800">
              {currentTestimonial.initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              {[...Array(currentTestimonial.rating)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            
            <p className="text-xs text-amber-700 dark:text-amber-300 mb-1">
              "{currentTestimonial.text}"
            </p>
            
            <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
              - {currentTestimonial.name}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}