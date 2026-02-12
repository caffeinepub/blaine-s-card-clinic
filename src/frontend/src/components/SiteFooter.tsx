import { SiTiktok, SiFacebook, SiInstagram } from 'react-icons/si';
import { Heart, Shield } from 'lucide-react';
import { assetUrl } from '@/lib/assetUrl';
import { useAdminGate } from '@/context/AdminGateContext';

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = typeof window !== 'undefined' 
    ? encodeURIComponent(window.location.hostname)
    : 'blaines-card-clinic';
  
  const { isUnlocked, openPrompt } = useAdminGate();

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
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={assetUrl('assets/IMG_8094-6.png')}
                alt="Blaine's Card Clinic Logo"
                className="logo-square h-12 w-12"
              />
              <span className="text-lg font-bold">Blaine's Card Clinic</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional TCG card restoration and cleaning services. Bringing your collection back to life.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => {
                    const element = document.getElementById('hero');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const element = document.getElementById('track-package');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Track Order
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const element = document.getElementById('tiers');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const element = document.getElementById('contact');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  onClick={handleAdminClick}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Shield className="h-3 w-3" />
                  Admin
                </button>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Connect With Us</h3>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/share/1BRkn9xHpT/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <SiFacebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@blainescardclinic?_r=1&_t=ZP-93qKaFCVw5P"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="TikTok"
              >
                <SiTiktok className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/blainescardclinic?igsh=MXhkczIxMTJhMmpmZg=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <SiInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} Blaine's Card Clinic. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-4 w-4 text-primary fill-primary" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary font-medium transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
