import { CheckCircle, Shield, Zap } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

export function ProductionReadyBanner() {
  const features = [
    { icon: Shield, text: "Supabase Sicherheit optimiert", variant: "default" as const },
    { icon: CheckCircle, text: "Live Message-Badges", variant: "default" as const },
    { icon: Zap, text: "Structured Logging", variant: "default" as const }
  ];

  return (
    <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-green-800 dark:text-green-200">
            🚀 Production Ready!
          </h3>
        </div>
        <p className="text-sm text-green-700 dark:text-green-300 mb-3">
          Alle kritischen Verbesserungen wurden implementiert:
        </p>
        <div className="flex flex-wrap gap-2">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Badge key={index} variant={feature.variant} className="text-xs">
                <IconComponent className="h-3 w-3 mr-1" />
                {feature.text}
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}