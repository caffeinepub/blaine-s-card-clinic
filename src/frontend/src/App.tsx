import { SiteHeader } from './components/SiteHeader';
import { HeroSection } from './components/HeroSection';
import { ServiceTiersSection } from './components/ServiceTiersSection';
import { TrackPackageSection } from './components/TrackPackageSection';
import { ContactFormSection } from './components/ContactFormSection';
import { AdminOrderManagementSection } from './components/AdminOrderManagementSection';
import { AdminPasswordPromptModal } from './components/AdminPasswordPromptModal';
import { SiteFooter } from './components/SiteFooter';
import { AdminGateProvider, useAdminGate } from './context/AdminGateContext';

function AppContent() {
  const { isUnlocked } = useAdminGate();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <ServiceTiersSection />
        <ContactFormSection />
        <TrackPackageSection />
        {/* Stable anchor for admin section */}
        <div id="admin" />
        {isUnlocked && <AdminOrderManagementSection />}
      </main>
      <SiteFooter />
      <AdminPasswordPromptModal />
    </div>
  );
}

function App() {
  return (
    <AdminGateProvider>
      <AppContent />
    </AdminGateProvider>
  );
}

export default App;
