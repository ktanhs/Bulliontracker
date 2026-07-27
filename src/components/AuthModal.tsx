import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  ShieldCheck,
  Building2,
  Sparkles,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile } from '../types';
import { registerNewUser, getUsers, setActiveUser } from '../utils/userAuth';

interface AuthModalProps {
  onClose: () => void;
  onUserAuthenticated: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onUserAuthenticated,
}) => {
  const [mode, setMode] = useState<'SIGN_UP' | 'SIGN_IN'>('SIGN_UP');
  
  // Sign Up Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [investorType, setInvestorType] = useState<UserProfile['investorType']>('Physical Stacker');
  const [preferredCurrency, setPreferredCurrency] = useState<'SGD' | 'USD'>('SGD');
  const [vaultLocation, setVaultLocation] = useState('Silver Bullion The Safe, SG');

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    try {
      const user = registerNewUser(
        name.trim(),
        email.trim(),
        investorType,
        preferredCurrency,
        vaultLocation
      );
      setSuccessMsg('Account created successfully! Logging you in...');
      setTimeout(() => {
        onUserAuthenticated(user);
        onClose();
      }, 600);
    } catch (err: any) {
      setError('Failed to create account. Please try again.');
    }
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginEmail.trim()) {
      setError('Please enter your account email.');
      return;
    }

    const users = getUsers();
    const found = users.find((u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase());

    if (found) {
      setActiveUser(found.id);
      setSuccessMsg(`Welcome back, ${found.name}!`);
      setTimeout(() => {
        onUserAuthenticated(found);
        onClose();
      }, 500);
    } else {
      setError('No user account found with this email. Please sign up first.');
    }
  };

  const handleDemoSignIn = () => {
    const users = getUsers();
    const demo = users.find((u) => u.id === 'user-demo-1') || users[0];
    if (demo) {
      setActiveUser(demo.id);
      onUserAuthenticated(demo);
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto cursor-pointer"
    >
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden my-8 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl text-slate-950 shadow-lg">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>{mode === 'SIGN_UP' ? 'Create Bullion Tracker Account' : 'Sign In to Your Portfolio'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Track your owned physical gold/silver stack & items of interest
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle Switcher */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-center space-x-2">
          <button
            onClick={() => {
              setMode('SIGN_UP');
              setError(null);
            }}
            className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 cursor-pointer ${
              mode === 'SIGN_UP'
                ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Account (Sign Up)</span>
          </button>

          <button
            onClick={() => {
              setMode('SIGN_IN');
              setError(null);
            }}
            className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 cursor-pointer ${
              mode === 'SIGN_IN'
                ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        </div>

        {/* Alert Notifications */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200 font-medium flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0 animate-ping"></span>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 font-medium flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6">
          {mode === 'SIGN_UP' ? (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Tan"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.tan@sgbullion.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Investor Archetype</label>
                  <select
                    value={investorType}
                    onChange={(e) => setInvestorType(e.target.value as any)}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Physical Stacker">Physical Stacker (Gold & Silver)</option>
                    <option value="Bullion Collector">Bullion Collector & Numismatist</option>
                    <option value="Institutional Accumulator">Institutional / Vault Client</option>
                    <option value="Retail Investor">Retail Precious Metals Trader</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Preferred Base Currency</label>
                  <select
                    value={preferredCurrency}
                    onChange={(e) => setPreferredCurrency(e.target.value as any)}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="SGD">Singapore Dollar (SGD S$)</option>
                    <option value="USD">US Dollar (USD $)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Vault / Primary Storage Location</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={vaultLocation}
                    onChange={(e) => setVaultLocation(e.target.value)}
                    placeholder="e.g. Silver Bullion The Safe, SG or Home Safe"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Complete Free Registration & Start Stack Profile</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Account Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="alex.tan@sgbullion.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to My Account</span>
              </button>
            </form>
          )}

          {/* Quick Demo Login Option */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 mb-2 font-medium">
              Want to try without creating a new password?
            </p>
            <button
              onClick={handleDemoSignIn}
              className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sign In as Demo Stacker (Alex Tan — 2 Gold Eagles, 100 oz Silver Bar)</span>
            </button>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-center space-x-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Local Client-Side Storage Guarantee • Private Bullion Tracking</span>
        </div>
      </div>
    </div>
  );
};
