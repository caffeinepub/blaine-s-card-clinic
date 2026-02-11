import { SiteHeader } from './components/SiteHeader';
import { HeroSection } from './components/HeroSection';
import { ServiceTiersSection } from './components/ServiceTiersSection';
import { TrackPackageSection } from './components/TrackPackageSection';
import { ContactFormSection } from './components/ContactFormSection';
import { AdminOrderManagementSection } from './components/AdminOrderManagementSection';
import { SiteFooter } from './components/SiteFooter';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <ServiceTiersSection />
        <ContactFormSection />
        <TrackPackageSection />
        <AdminOrderManagementSection />
      </main>
      <SiteFooter />
    </div>
  );
}

export default App;
