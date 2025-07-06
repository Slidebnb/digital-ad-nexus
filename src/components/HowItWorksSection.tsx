import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  UserPlus, 
  Search, 
  MessageCircle, 
  Handshake,
  ArrowRight,
  CheckCircle
} from "lucide-react";

const steps = [
  {
    id: 1,
    icon: UserPlus,
    title: "Registrieren",
    description: "Erstelle dein kostenloses Konto und verifiziere deine Identität für mehr Sicherheit",
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    id: 2,
    icon: Search,
    title: "Suchen & Finden",
    description: "Durchsuche Tausende von Anzeigen oder erstelle deine eigene Verkaufsanzeige",
    color: "text-secondary",
    bgColor: "bg-secondary/10"
  },
  {
    id: 3,
    icon: MessageCircle,
    title: "Kommunizieren",
    description: "Chatte direkt mit Käufern oder Verkäufern über unser sicheres Nachrichtensystem",
    color: "text-accent",
    bgColor: "bg-accent/10"
  },
  {
    id: 4,
    icon: Handshake,
    title: "Handeln",
    description: "Treffe dich sicher und tausche Kryptowährungen direkt mit anderen Nutzern",
    color: "text-success",
    bgColor: "bg-success/10"
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-primary">So</span> funktioniert's
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            In nur vier einfachen Schritten zu deinem ersten Krypto-Trade
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={step.id} className="relative">
                <Card className="gradient-card border-border/50 hover:border-primary/20 transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    {/* Step Number */}
                    <div className="absolute -top-3 left-6 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      {step.id}
                    </div>

                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl ${step.bgColor} mb-4`}>
                      <IconComponent className={`h-8 w-8 ${step.color}`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-primary/30" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Security Features */}
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-gradient-secondary">Sicherheit</span> steht an erster Stelle
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Wir verwenden modernste Sicherheitstechnologien, um deine Trades zu schützen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mb-4">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <h4 className="font-semibold mb-2">Verifizierte Nutzer</h4>
              <p className="text-sm text-muted-foreground">
                Identitätsprüfung und Bewertungssystem für maximales Vertrauen
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mb-4">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <h4 className="font-semibold mb-2">Sichere Kommunikation</h4>
              <p className="text-sm text-muted-foreground">
                Verschlüsselte Nachrichten und sichere Datenübertragung
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mb-4">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <h4 className="font-semibold mb-2">Community-Schutz</h4>
              <p className="text-sm text-muted-foreground">
                Meldesystem und aktive Moderation für eine sichere Umgebung
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link to="/login">
            <Button variant="gradient" size="lg" className="text-lg px-8 py-4 group">
              Jetzt kostenlos starten
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            Keine versteckten Kosten • Sofort einsatzbereit • 100% kostenlos
          </p>
        </div>
      </div>
    </section>
  );
}