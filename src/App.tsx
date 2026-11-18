import React, { useEffect, useRef } from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { Playhead } from './components/motion/Playhead';
import { HomePage } from './pages/HomePage';
import { ExperiencePage } from './pages/ExperiencePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { WorkDetailPage } from './pages/WorkDetailPage';
import { SertifikatPage } from './pages/SertifikatPage';
import { MarketingPage } from './pages/MarketingPage';
import { ContactPage } from './pages/ContactPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ActiveTab } from './types';

const PUBLIC_TABS: ActiveTab[] = ['beranda', 'pengalaman', 'portofolio', 'sertifikat', 'kontak'];

const scrollToHomeSection = (id: string) => {
  let tries = 0;
  const attempt = () => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (tries++ < 24) window.setTimeout(attempt, 50);
  };
  window.setTimeout(attempt, 0);
};

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, activeWorkSlug, setActiveWorkSlug, currentUser, isAuthLoading } = usePortfolio();

  // 1. Dengarkan perubahan URL
  useEffect(() => {
    const handleUrlChange = () => {
      const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      const rawHash = window.location.hash.toLowerCase().replace(/^#\/?/, '').replace(/\/+$/, '');

      // Hash #marketing dialihkan ke portofolio
      if (rawHash === 'marketing' || pathname.endsWith('/marketing')) {
        setActiveTab('portofolio');
        return;
      }

      // Halaman Tentang sudah dilebur ke beranda: hash lama dialihkan ke bagian Tentang
      if (rawHash === 'tentang' || pathname.endsWith('/tentang')) {
        setActiveTab('beranda');
        scrollToHomeSection('section-tentang');
        return;
      }

      // Hash #portofolio/<slug> diarahkan ke halaman detail karya
      if (rawHash.startsWith('portofolio/')) {
        const slug = rawHash.replace(/^portofolio\//, '');
        setActiveWorkSlug(slug);
        setActiveTab('portofolio-detail');
        return;
      }

      // Prioritaskan jika hash adalah tab publik yang valid
      if (PUBLIC_TABS.includes(rawHash as ActiveTab)) {
        setActiveTab(rawHash as ActiveTab);
        return;
      }

      // Cek rute admin
      const isAdminHash =
        rawHash === 'admin' ||
        rawHash === 'porto/admin' ||
        rawHash === 'admin-login' ||
        rawHash === 'admin-dashboard';

      const isAdminPath =
        pathname === '/admin' ||
        pathname.endsWith('/admin') ||
        pathname === '/porto/admin' ||
        pathname.endsWith('/porto/admin');

      if (isAdminHash || isAdminPath) {
        if (isAuthLoading) return;
        setActiveTab(currentUser ? 'admin-dashboard' : 'admin-login');
        return;
      }

      // Cek pathname publik
      for (const tab of PUBLIC_TABS) {
        if (pathname.endsWith(`/${tab}`)) {
          setActiveTab(tab);
          return;
        }
      }

      // Root
      if (!rawHash) {
        setActiveTab('beranda');
      }
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [setActiveTab, setActiveWorkSlug, currentUser, isAuthLoading]);

  // 2. Sinkronkan sesi admin
  useEffect(() => {
    if (isAuthLoading) return;
    if (activeTab === 'admin-login' && currentUser) {
      setActiveTab('admin-dashboard');
    } else if (activeTab === 'admin-dashboard' && !currentUser) {
      setActiveTab('admin-login');
    }
  }, [activeTab, currentUser, isAuthLoading, setActiveTab]);

  // 3. Sinkronkan URL dengan activeTab secara bersih
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (activeTab === 'admin-login' || activeTab === 'admin-dashboard') {
        window.history.replaceState(null, '', '/#admin');
      } else if (activeTab === 'portofolio-detail') {
        window.history.replaceState(null, '', activeWorkSlug ? `/#portofolio/${activeWorkSlug}` : '/#portofolio');
      }
      return;
    }

    if (activeTab === 'admin-login' || activeTab === 'admin-dashboard') {
      window.history.replaceState(null, '', '/#admin');
    } else if (activeTab === 'portofolio-detail') {
      window.history.replaceState(null, '', activeWorkSlug ? `/#portofolio/${activeWorkSlug}` : '/#portofolio');
    } else if (activeTab === 'beranda') {
      window.history.replaceState(null, '', '/');
    } else {
      window.history.replaceState(null, '', `/#${activeTab}`);
    }

    window.scrollTo({ top: 0, behavior: 'instant' });

    // Pindah fokus ke h1 untuk aksesibilitas (Bab 5 M1)
    setTimeout(() => {
      const h1 = document.querySelector('h1');
      if (h1) {
        h1.tabIndex = -1;
        h1.focus();
      }
    }, 50);
  }, [activeTab, activeWorkSlug]);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'beranda':
        return <HomePage />;
      case 'pengalaman':
        return <ExperiencePage />;
      case 'portofolio':
        return <PortfolioPage />;
      case 'portofolio-detail':
        return <WorkDetailPage />;
      case 'marketing':
        return <MarketingPage />;
      case 'sertifikat':
        return <SertifikatPage />;
      case 'kontak':
        return <ContactPage />;
      case 'admin-login':
        return <AdminLoginPage />;
      case 'admin-dashboard':
        return <AdminDashboardPage />;
      default:
        return <HomePage />;
    }
  };

  const isPublicPage = activeTab !== 'admin-login' && activeTab !== 'admin-dashboard';
  const pageKey = `${activeTab}-${activeWorkSlug || ''}`;

  return (
    <div className="min-h-screen relative">
      <Navbar />

      {/* M1: Playhead Cut Antarhalaman */}
      <Playhead triggerKey={pageKey} />

      {/* Konten Halaman Utama dengan Animasi Cut-In */}
      <main className="min-h-[85vh] relative overflow-x-clip">
        <div key={pageKey} className="w-full cut-in">
          {renderActivePage()}
        </div>
      </main>

      {/* Footer */}
      {isPublicPage && <Footer />}

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <PortfolioProvider>
      <AppContent />
    </PortfolioProvider>
  );
}
