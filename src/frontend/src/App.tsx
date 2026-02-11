import { SiteHeader } from './components/SiteHeader';
import { HeroSection } from './components/HeroSection';
import { ServiceTiersSection } from './components/ServiceTiersSection';
import { ContactFormSection } from './components/ContactFormSection';
import { SiteFooter } from './components/SiteFooter';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <ServiceTiersSection />
        <ContactFormSection />
      </main>
      <SiteFooter />
    </div>
  );
}

export default App;
