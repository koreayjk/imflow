import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Workflow } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Workflow className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold text-slate-900">IM Flow</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden max-w-[160px] truncate text-sm text-slate-500 sm:inline">
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
