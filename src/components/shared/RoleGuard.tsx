'use client';
import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useAuth, ROLE_HOME_ROUTES } from '@/hooks/useAuth';
import type { NCBRole } from '@/data/mockData';

interface RoleGuardProps {
  allowedRoles: NCBRole[];
  featureName: string;
  children: React.ReactNode;
}

const ROLE_DISPLAY_NAMES: Record<NCBRole, string> = {
  ncb_io: 'Investigating Officer (Field IO)',
  ncb_fsl: 'Forensic Science Laboratory (FSL Analyst)',
  ncb_zonal: 'Zonal Director (HQ Command)',
  ncb_court: 'Special NDPS Court Reader',
};

export default function RoleGuard({ allowedRoles, featureName, children }: RoleGuardProps) {
  const { user } = useAuth();

  // If user has not loaded yet or has allowed role, render children
  if (!user || allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  const userRoleTitle = ROLE_DISPLAY_NAMES[user.role] || user.role;
  const allowedTitles = allowedRoles.map(r => ROLE_DISPLAY_NAMES[r] || r).join(', ');
  const homeRoute = ROLE_HOME_ROUTES[user.role] || '/';

  return (
    <div className="max-w-[720px] mx-4 sm:mx-auto my-6 sm:my-12 p-4 sm:p-10 bg-white border border-red-200 rounded-2xl shadow-sm text-center">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4 sm:mb-6">
        <Lock size={28} className="text-red-600" />
      </div>

      <div className="flex items-center justify-center gap-1.5 text-red-600 text-xs font-black uppercase tracking-widest mb-3">
        <ShieldAlert size={15} />
        <span>ROLE CLEARANCE BOUNDARY</span>
      </div>

      <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 break-words">
        Access Restricted to {featureName}
      </h1>

      <p className="text-sm text-slate-600 leading-relaxed mb-6 mx-auto max-w-lg">
        In compliance with NDPS Act procedural safeguards, this capability is restricted to designated personnel:
        <br />
        <strong className="text-slate-900 font-bold">{allowedTitles}</strong>.
      </p>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 mb-6 text-xs text-slate-500 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        <div>
          <span className="text-[0.68rem] uppercase font-bold text-slate-400 block mb-0.5">Active Session</span>
          <div className="font-extrabold text-slate-900 break-words">{user.name}</div>
        </div>
        <div>
          <span className="text-[0.68rem] uppercase font-bold text-slate-400 block mb-0.5">Badge ID</span>
          <div className="font-extrabold text-blue-700 font-mono">{user.badge}</div>
        </div>
        <div>
          <span className="text-[0.68rem] uppercase font-bold text-slate-400 block mb-0.5">Assigned Role</span>
          <div className="font-extrabold text-red-600 break-words">{userRoleTitle}</div>
        </div>
      </div>

      <Link
        href={homeRoute}
        className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-sm no-underline shadow-sm transition-colors w-full sm:w-auto"
      >
        <ArrowLeft size={16} /> Return to Your Authorized Workspace
      </Link>
    </div>
  );
}
