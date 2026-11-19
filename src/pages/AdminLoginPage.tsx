import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Key, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowLeft, 
  Shield
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export const AdminLoginPage: React.FC = () => {
  const { loginAdmin, setActiveTab, currentUser } = usePortfolio();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to dashboard
  if (currentUser) {
    return (
      <div className="pt-32 pb-16 max-w-md mx-auto px-4 text-center space-y-4">
        <div className="w-12 h-12 border border-rule flex items-center justify-center mx-auto" style={{ backgroundColor: 'var(--paper-2)' }}>
          <ShieldCheck className="w-6 h-6 text-ink" />
        </div>
        <h2
          className="font-bold text-2xl text-ink"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Sesi Admin Aktif
        </h2>
        <p className="label-mono text-xs text-ink-2">
          Anda sudah masuk sebagai <strong>{currentUser.name}</strong> ({currentUser.email}).
        </p>
        <div className="pt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('admin-dashboard')}
            className="btn-primary"
          >
            BUKA DASHBOARD CMS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('beranda')}
            className="btn-primary"
            style={{ backgroundColor: 'transparent', color: 'var(--ink)', border: '1px solid var(--rule)' }}
          >
            KEMBALI KE BERANDA
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const result = await loginAdmin(email, password);
    setIsSubmitting(false);

    if (result.success) {
      setActiveTab('admin-dashboard');
    } else {
      setError(result.error || 'Email atau kata sandi tidak cocok. Akses hanya untuk pemilik portofolio.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center pt-24 pb-16 px-4">
      <div
        className="w-full max-w-md p-8 border border-rule space-y-6"
        style={{ backgroundColor: 'var(--paper)', borderRadius: 0 }}
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border border-rule flex items-center justify-center mx-auto" style={{ backgroundColor: 'var(--paper-2)' }}>
            <Lock className="w-5 h-5 text-ink" />
          </div>
          <h1
            className="font-bold text-2xl text-ink"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Portal Akses Pemilik
          </h1>
          <p className="label-mono text-xs text-ink-2">
            Area administrasi khusus pemilik portofolio.
          </p>
        </div>

        {error && (
          <div className="border-l-2 border-ink pl-3 py-1 text-xs label-mono text-ink">
            <span className="font-semibold">GALAT: </span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block label-mono text-ink mb-1.5">
              Email Pemilik *
            </label>
            <div className="relative flex items-center border border-rule bg-paper focus-within:border-ink transition-colors">
              <span className="pl-3 pr-2 text-ink-2 shrink-0 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-transparent border-none py-2.5 pr-3 text-ink font-sans text-sm focus:outline-none placeholder:text-ink-2/60"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block label-mono text-ink mb-1.5">
              Kata Sandi *
            </label>
            <div className="relative flex items-center border border-rule bg-paper focus-within:border-ink transition-colors">
              <span className="pl-3 pr-2 text-ink-2 shrink-0 flex items-center justify-center">
                <Key className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi…"
                className="w-full bg-transparent border-none py-2.5 pr-10 text-ink font-sans text-sm focus:outline-none placeholder:text-ink-2/60"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-2 hover:text-ink cursor-pointer bg-transparent border-none p-1 flex items-center justify-center"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full mt-2"
          >
            {isSubmitting ? 'MEMERIKSA…' : 'MASUK KE PANEL PEMILIK'}
          </button>
        </form>

        {/* Security notice */}
        <div className="flex items-center justify-center gap-1.5 label-mono text-xs text-ink-2 pt-1">
          <Shield className="w-3.5 h-3.5 text-ink" />
          <span>Sistem Terproteksi · Akses Khusus Pemilik Portofolio</span>
        </div>

        {/* Back to public link */}
        <div className="text-center pt-2 border-t border-rule">
          <button
            type="button"
            onClick={() => setActiveTab('beranda')}
            className="text-link label-mono text-ink-2 cursor-pointer bg-transparent border-none inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Utama</span>
          </button>
        </div>
      </div>
    </div>
  );
};
