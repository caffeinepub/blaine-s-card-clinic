import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Shield } from 'lucide-react';
import { assetUrl } from '@/lib/assetUrl';
import { LoginButton } from './LoginButton';
import { useAdminGate } from '@/context/AdminGateContext';

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isUnlocked, openPrompt } = useAdminGate();

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

  const handleAdminClick = () => {
    if (isUnlocked) {
      scrollToSection('admin');
    } else {
      openPrompt();
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
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <img 
              src={assetUrl('assets/IMG_8094-6.png')}
              alt="Blaine's Card Clinic Logo"
              className="logo-square h-12 w-12 sm:h-14 sm:w-14"
            />
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
              onClick={() => scrollToSection('track-package')}
              className="text-foreground hover:text-primary"
            >
              Track Order
            </Button>
            <Button
              variant="ghost"
              onClick={() => scrollToSection('tiers')}
              className="text-foreground hover:text-primary"
            >
              Pricing
            </Button>
            <Button
              variant="ghost"
              onClick={handleAdminClick}
              className="text-foreground hover:text-primary"
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>
            <Button
              onClick={() => scrollToSection('contact')}
              className="ml-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Get a Quote
            </Button>
            <LoginButton />
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
                onClick={() => scrollToSection('track-package')}
                className="justify-start text-foreground hover:text-primary"
              >
                Track Order
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection('tiers')}
                className="justify-start text-foreground hover:text-primary"
              >
                Pricing
              </Button>
              <Button
                variant="ghost"
                onClick={handleAdminClick}
                className="justify-start text-foreground hover:text-primary"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
              <Button
                onClick={() => scrollToSection('contact')}
                className="justify-start bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Get a Quote
              </Button>
              <div className="pt-2">
                <LoginButton />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
