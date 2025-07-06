import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Quote,
  Verified,
  TrendingUp,
  Shield
} from "lucide-react";

// Mock testimonials data
const testimonials = [
  {
    id: 1,
    name: "Marcus Weber",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    trades: 23,
    verified: true,
    text: "Fantastische Plattform! Ich habe bereits mehrere erfolgreiche Trades gemacht. Die Benutzeroberfläche ist intuitiv und das Bewertungssystem gibt mir Vertrauen.",
    role: "Bitcoin Trader"
  },
  {
    id: 2,
    name: "Sarah Mueller",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5c5?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    trades: 45,
    verified: true,
    text: "Die beste Krypto-Kleinanzeigenplattform, die ich je benutzt habe. Sichere Transaktionen und eine hilfsreite Community. Kann ich nur weiterempfehlen!",
    role: "Ethereum Enthusiastin"
  },
  {
    id: 3,
    name: "David Klein",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    trades: 67,
    verified: true,
    text: "Als langjähriger Krypto-Händler schätze ich die Transparenz und Sicherheit dieser Plattform. Die Verifizierung ist schnell und der Support ist ausgezeichnet.",
    role: "DeFi Spezialist"
  }
];

const trustMetrics = [
  {
    icon: Shield,
    label: "Sicherheit",
    value: "99.9%",
    description: "Erfolgreiche Transaktionen"
  },
  {
    icon: Verified,
    label: "Verifizierung",
    value: "24h",
    description: "Durchschnittliche Bearbeitungszeit"
  },
  {
    icon: TrendingUp,
    label: "Wachstum",
    value: "+150%",
    description: "Nutzer in den letzten 6 Monaten"
  }
];

export function TrustSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-primary">Vertrauen</span> unserer Community
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tausende zufriedene Nutzer vertrauen bereits auf unsere Plattform
          </p>
        </div>

        {/* Trust Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {trustMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <Card key={index} className="gradient-card border-border/50 text-center">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {metric.value}
                  </div>
                  <div className="font-semibold mb-1">{metric.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {metric.description}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="gradient-card border-border/50 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                {/* Quote Icon */}
                <div className="mb-4">
                  <Quote className="h-8 w-8 text-primary/30" />
                </div>

                {/* Testimonial Text */}
                <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                  "{testimonial.text}"
                </p>

                {/* User Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{testimonial.name}</span>
                      {testimonial.verified && (
                        <Verified className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {testimonial.role}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${
                              i < testimonial.rating 
                                ? 'text-yellow-500 fill-current' 
                                : 'text-muted-foreground/30'
                            }`} 
                          />
                        ))}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {testimonial.trades} Trades
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {testimonials.map((testimonial) => (
                <Avatar key={testimonial.id} className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback className="text-xs">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              <div className="h-8 w-8 border-2 border-background rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                +7K
              </div>
            </div>
            <span>Schließe dich über 10.000 zufriedenen Nutzern an</span>
          </div>
        </div>
      </div>
    </section>
  );
}