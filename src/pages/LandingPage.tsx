import React from 'react';
import { Link } from 'react-router-dom';
import {
  Workflow,
  ListChecks,
  LayoutDashboard,
  Smartphone,
  ArrowRight,
  Check,
} from 'lucide-react';
import { STAGES } from '../lib/constants';

const FEATURES = [
  {
    icon: Workflow,
    title: '단계로 관리하는 프로젝트',
    desc: '준비 → 진행 → 검토 → 완료. 지금 어디까지 왔는지 한눈에 보여요.',
  },
  {
    icon: ListChecks,
    title: '단계별 할일 체크',
    desc: '각 단계마다 할일을 적고 체크하세요. 다음 단계로 끌어올리기도 한 번에.',
  },
  {
    icon: LayoutDashboard,
    title: '대시보드 한눈에',
    desc: '전체 프로젝트 진행률과 마감 임박을 대시보드에서 바로 확인해요.',
  },
  {
    icon: Smartphone,
    title: '모바일에서도 편하게',
    desc: '가게에서, 이동 중에. 휴대폰 화면에 딱 맞게 만들었어요.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 상단바 */}
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Workflow className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold text-slate-900">IM Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              로그인
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-brand-600 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              시작하기
            </Link>
          </div>
        </div>
      </header>

      {/* 히어로 */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 0%, #d9e6ff 0%, rgba(255,255,255,0) 70%)',
          }}
        />
        <div className="mx-auto max-w-3xl px-4 pb-12 pt-16 text-center sm:pt-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            한국 소상공인을 위한 프로젝트 관리
          </span>

          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            복잡한 일은 단순하게,
            <br />
            <span className="text-brand-600">한 흐름으로.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base text-slate-500 sm:text-lg">
            신메뉴 출시부터 매장 오픈까지. IM Flow 와 함께라면
            <br className="hidden sm:block" />
            모든 프로젝트를 준비부터 완료까지 한눈에 관리할 수 있어요.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700 sm:w-auto"
            >
              무료로 시작하기
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="flex w-full items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              이미 계정이 있어요
            </Link>
          </div>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            신용카드 없이 바로 시작 · 한국어 지원
          </p>
        </div>

        {/* 단계 미리보기 */}
        <div className="mx-auto max-w-2xl px-4 pb-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <p className="mb-3 text-left text-xs font-medium text-slate-400">프로젝트 진행 단계</p>
            <div className="flex items-center gap-1.5">
              {STAGES.map((stage, idx) => (
                <React.Fragment key={stage.key}>
                  <div
                    className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border px-2 py-3 ${
                      idx === 1
                        ? 'border-brand-200 bg-brand-50'
                        : 'border-slate-100 bg-slate-50'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${stage.dot}`} />
                    <span className="text-xs font-semibold text-slate-600">{stage.label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 기능 */}
      <section className="border-t border-slate-100 bg-slate-50/60 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-slate-900">사장님께 딱 필요한 기능만</h2>
            <p className="mt-2 text-sm text-slate-500">
              어렵지 않게, 꼭 필요한 것만 담았어요.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <f.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 마무리 CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="rounded-3xl bg-brand-600 px-6 py-12 text-center text-white shadow-card">
            <h2 className="text-2xl font-bold">오늘 첫 프로젝트를 시작해 보세요</h2>
            <p className="mt-2 text-sm text-brand-100">
              가입은 30초면 충분해요. 바로 무료로 써볼 수 있습니다.
            </p>
            <Link
              to="/signup"
              className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              무료로 시작하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-xs text-slate-400">
        © 2026 IM Flow · 한국 소상공인을 위한 프로젝트 관리
      </footer>
    </div>
  );
}
