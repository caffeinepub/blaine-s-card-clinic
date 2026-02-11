import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-sm border-b shadow-sm'
          : 'bg-background/80 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="logo-square w-12 h-12">
              <img
                src="/assets/generated/blaines-card-clinic-logo.dim_512x512.png"
                alt="Blaine's Card Clinic"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground tracking-tight">
                Blaine's Card Clinic
              </span>
              <span className="text-xs text-muted-foreground hidden sm:block">
                Professional TCG Restoration
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              onClick={() => scrollToSection('hero')}
              className="text-foreground hover:text-primary"
            >
              Home
            </Button>
            <Button
              variant="ghost"
              onClick={() => scrollToSection('services')}
              className="text-foreground hover:text-primary"
            >
              Services
            </Button>
            <Button
              variant="ghost"
              onClick={() => scrollToSection('tiers')}
              className="text-foreground hover:text-primary"
            >
              Pricing
            </Button>
            <Button
              onClick={() => scrollToSection('contact')}
              className="ml-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Get a Quote
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground shrink-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t animate-fade-in">
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                onClick={() => scrollToSection('hero')}
                className="justify-start text-foreground hover:text-primary"
              >
                Home
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection('services')}
                className="justify-start text-foreground hover:text-primary"
              >
                Services
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection('tiers')}
                className="justify-start text-foreground hover:text-primary"
              >
                Pricing
              </Button>
              <Button
                onClick={() => scrollToSection('contact')}
                className="justify-start bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Get a Quote
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
