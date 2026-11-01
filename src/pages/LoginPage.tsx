import React, { useState, useEffect } from 'react';
import { Lock, Mail, User, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/Button';

export const LoginPage: React.FC = () => {
  const { lang, isRtl, navigate, route, authToken, userRole, login } = useStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (authToken) {
      if (userRole === 'admin') {
        navigate({ page: 'admin' });
      } else {
        navigate({ page: 'account' });
      }
    }
  }, [authToken, userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg(
        lang === 'ar'
          ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور'
          : 'Please enter both email and password'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          const message =
            lang === 'ar'
              ? data.error_ar || 'بيانات تسجيل الدخول غير صحيحة. يرجى التحقق وإعادة المحاولة.'
              : data.error || 'Invalid email or password. Please verify and try again.';
          setErrorMsg(message);
          setIsSubmitting(false);
          return;
        }

        // Authentication succeeded
        setSuccessMsg(
          lang === 'ar'
            ? 'تم تسجيل الدخول بنجاح! جاري التحويل...'
            : 'Signed in successfully! Redirecting...'
        );

        // Call store login with the assigned role
        login(data.token, data.user, data.redirectTo);
      } else {
        // Customer Registration
        if (!name.trim()) {
          setErrorMsg(lang === 'ar' ? 'يرجى إدخال اسمك الكريم' : 'Please enter your name');
          setIsSubmitting(false);
          return;
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: cleanEmail,
            phone: phone.trim() || undefined,
            password: cleanPassword,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          const message =
            lang === 'ar'
              ? data.error_ar || 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.'
              : data.error || 'Failed to create account. Please try again.';
          setErrorMsg(message);
          setIsSubmitting(false);
          return;
        }

        setSuccessMsg(
          lang === 'ar'
            ? 'تم إنشاء الحساب وتسجيل الدخول بنجاح! جاري التحويل...'
            : 'Account created and signed in! Redirecting...'
        );

        login(data.token, data.user, data.redirectTo || '/account');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg(
        lang === 'ar'
          ? 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.'
          : 'Failed to connect to the server. Please check your connection.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const redirectAfter = route.page === 'login' ? route.redirectAfter : undefined;

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#0B0B0E]">
      <div className="w-full max-w-md">
        {/* Back to store navigation */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate({ page: 'home' })}
            className="inline-flex items-center gap-2 text-xs text-[#9E9A90] hover:text-[#C6A365] transition-colors cursor-pointer py-1"
          >
            {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{lang === 'ar' ? 'العودة للمتجر الرئيسي' : 'Return to Storefront'}</span>
          </button>
        </div>

        {/* Card Box */}
        <div className="bg-[#131318] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="font-brand text-xl font-bold tracking-widest text-[#F4F1EA]">
              VELTOR
            </span>
            <p className="font-brand text-[10px] tracking-[0.25em] text-[#C6A365] uppercase">
              DRIVE YOUR PASSION
            </p>
            <h1 className="text-lg sm:text-xl font-bold text-[#F4F1EA] pt-2">
              {mode === 'login'
                ? lang === 'ar'
                  ? 'تسجيل الدخول'
                  : 'Client Sign In'
                : lang === 'ar'
                ? 'إنشاء حساب جديد'
                : 'Create New Account'}
            </h1>
            <p className="text-xs text-[#9E9A90] leading-relaxed">
              {mode === 'login'
                ? lang === 'ar'
                  ? 'أدخل بيانات حسابك للوصول إلى لوحة التحكم أو متابعة طلباتك'
                  : 'Enter your credentials to access your portal or track your orders'
                : lang === 'ar'
                ? 'أنشئ حساباً لمتابعة طلباتك وعناوين التوصيل بسهولة'
                : 'Create an account to track orders and delivery details'}
            </p>
          </div>

          {redirectAfter && (
            <div className="p-3 bg-[#1A1A22] border border-[#C6A365]/30 text-xs text-[#C6A365]">
              {lang === 'ar'
                ? 'يرجى تسجيل الدخول بحساب مصرح له لمتابعة الوصول إلى الصفحة المطلوبة.'
                : 'Please sign in with authorized credentials to continue to the requested page.'}
            </div>
          )}

          {/* Feedback messages */}
          {errorMsg && (
            <div
              role="alert"
              className="p-3 bg-red-950/40 border border-red-500/50 text-red-300 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              className="p-3 bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label
                    htmlFor="client-name"
                    className="block text-xs font-medium text-[#9E9A90] mb-1.5"
                  >
                    {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'} *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#9E9A90] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="client-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: أحمد محمد' : 'e.g. John Doe'}
                      className="w-full bg-[#0B0B0E] border border-white/10 ps-10 pe-3 py-2.5 text-sm text-[#F4F1EA] placeholder:text-[#9E9A90]/50 focus:border-[#C6A365] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="client-phone"
                    className="block text-xs font-medium text-[#9E9A90] mb-1.5"
                  >
                    {lang === 'ar' ? 'رقم الهاتف (فودافون كاش / اتصال)' : 'Phone Number'}
                  </label>
                  <input
                    id="client-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full bg-[#0B0B0E] border border-white/10 px-3 py-2.5 text-sm text-[#F4F1EA] placeholder:text-[#9E9A90]/50 focus:border-[#C6A365] focus:outline-none transition-colors"
                  />
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-medium text-[#9E9A90] mb-1.5"
              >
                {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9E9A90] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#0B0B0E] border border-white/10 ps-10 pe-3 py-2.5 text-sm text-[#F4F1EA] placeholder:text-[#9E9A90]/50 focus:border-[#C6A365] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-medium text-[#9E9A90] mb-1.5"
              >
                {lang === 'ar' ? 'كلمة المرور' : 'Password'} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9E9A90] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0B0B0E] border border-white/10 ps-10 pe-3 py-2.5 text-sm text-[#F4F1EA] placeholder:text-[#9E9A90]/50 focus:border-[#C6A365] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="w-full justify-center min-h-[48px]"
              >
                {isSubmitting
                  ? lang === 'ar'
                    ? 'جاري التحقق...'
                    : 'Authenticating...'
                  : mode === 'login'
                  ? lang === 'ar'
                    ? 'تسجيل الدخول'
                    : 'Sign In'
                  : lang === 'ar'
                  ? 'إنشاء الحساب'
                  : 'Create Account'}
              </Button>
            </div>
          </form>

          {/* Mode Switch Toggle */}
          <div className="pt-2 border-t border-white/10 text-center text-xs text-[#9E9A90]">
            {mode === 'login' ? (
              <p>
                {lang === 'ar' ? 'ليس لديك حساب بعد؟' : "Don't have an account yet?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                  }}
                  className="text-[#C6A365] hover:underline font-semibold cursor-pointer ms-1"
                >
                  {lang === 'ar' ? 'إنشاء حساب جديد' : 'Create an Account'}
                </button>
              </p>
            ) : (
              <p>
                {lang === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className="text-[#C6A365] hover:underline font-semibold cursor-pointer ms-1"
                >
                  {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
