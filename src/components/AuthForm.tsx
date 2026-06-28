import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Workflow, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Mode = 'login' | 'signup';

const COPY: Record<Mode, { title: string; cta: string; switchText: string; switchTo: string; switchLink: string }> = {
  login: {
    title: '다시 오신 걸 환영해요',
    cta: '로그인',
    switchText: '아직 계정이 없으신가요?',
    switchTo: '회원가입',
    switchLink: '/signup',
  },
  signup: {
    title: '소상공인을 위한 프로젝트 관리',
    cta: '회원가입',
    switchText: '이미 계정이 있으신가요?',
    switchTo: '로그인',
    switchLink: '/login',
  },
};

export default function AuthForm({ mode }: { mode: Mode }) {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const copy = COPY[mode];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);

    const action = mode === 'login' ? signIn : signUp;
    const { error: err } = await action(email.trim(), password);

    setSubmitting(false);

    if (err) {
      setError(err);
      return;
    }

    if (mode === 'signup') {
      // 이메일 확인이 켜져 있으면 세션이 바로 생기지 않을 수 있음
      setNotice('가입이 완료되었습니다! 이메일 인증이 필요할 수 있으니 메일함을 확인해 주세요.');
      return;
    }

    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-card">
            <Workflow className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-bold text-slate-900">IM Flow</h1>
          <p className="mt-1 text-sm text-slate-500">{copy.title}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">이메일</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">비밀번호</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6자 이상"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
          {notice && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {copy.cta}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          {copy.switchText}{' '}
          <Link to={copy.switchLink} className="font-semibold text-brand-600 hover:underline">
            {copy.switchTo}
          </Link>
        </p>
      </div>
    </div>
  );
}
