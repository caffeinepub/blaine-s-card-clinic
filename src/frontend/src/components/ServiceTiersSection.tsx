import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

export function ServiceTiersSection() {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const tiers = [
    {
      name: 'Super Potion',
      price: '$5',
      description: 'Basic cleaning for lightly used cards',
      features: [
        'Surface cleaning',
        'Dust removal',
        'Basic inspection',
        '3-5 day turnaround (local)',
        '5-7 day turnaround (shipped)',
      ],
      popular: false,
    },
    {
      name: 'Hyper Potion',
      price: '$25',
      description: 'Deep cleaning for moderately damaged cards',
      features: [
        'Deep cleaning',
        'Minor scratch removal',
        'Edge restoration',
        'Protective sleeve included',
        '7-14 day turnaround',
      ],
      popular: true,
    },
    {
      name: 'Max Potion',
      price: '$50',
      description: 'Complete restoration for heavily damaged cards',
      features: [
        'Complete restoration',
        'Advanced scratch removal',
        'Edge and corner repair',
        'Premium protective case',
        '3-5 week turnaround',
      ],
      popular: false,
    },
  ];

  return (
    <section id="tiers" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-balance">
            Choose Your <span className="text-primary">Restoration Level</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the perfect service tier for your card's condition. All services include expert care and handling.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative flex flex-col ${
                tier.popular
                  ? 'border-primary shadow-lg scale-105 bg-card'
                  : 'bg-card/50'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-primary">{tier.price}</span>
                  <span className="text-muted-foreground"> / card</span>
                </div>
                <CardDescription className="text-base">
                  {tier.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={scrollToContact}
                  className={`w-full ${
                    tier.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  Get Started
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            * Prices are per card. Bulk discounts available for orders of 10+ cards.
          </p>
        </div>
      </div>
    </section>
  );
}
