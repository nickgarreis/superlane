import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, ArrowRight, Mail, Lock, User, Github, Check } from "lucide-react";

type AuthMode = "login" | "signup";

interface AuthPageProps {
  onLogin: () => void;
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.44 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  icon,
  autoFocus,
  rightElement,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  autoFocus?: boolean;
  rightElement?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const isFloating = focused || hasValue;

  return (
    <div className="relative group">
      <div
        className={`
          relative flex items-center rounded-xl border transition-all duration-200
          ${focused
            ? "border-[#58AFFF]/50 shadow-[0_0_0_3px_rgba(88,175,255,0.08)]"
            : "border-white/[0.08] hover:border-white/[0.14]"
          }
          bg-white/[0.03]
        `}
      >
        <div className={`pl-3.5 transition-colors duration-200 ${focused ? "text-[#58AFFF]" : "text-white/25"}`}>
          {icon}
        </div>
        <div className="relative flex-1">
          <label
            htmlFor={id}
            className={`
              absolute left-3 transition-all duration-200 pointer-events-none select-none
              ${isFloating
                ? "top-[7px] text-[10px] tracking-wide text-white/35"
                : "top-1/2 -translate-y-1/2 text-[13px] text-white/30"
              }
            `}
          >
            {label}
          </label>
          <input
            id={id}
            type={type}
            value={value}
            autoFocus={autoFocus}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`
              w-full bg-transparent text-[13px] text-[#E8E8E8] outline-none px-3
              ${isFloating ? "pt-[18px] pb-[6px]" : "py-[13px]"}
              transition-all duration-200
            `}
            autoComplete={type === "password" ? "current-password" : type === "email" ? "email" : "off"}
          />
        </div>
        {rightElement && (
          <div className="pr-2 flex items-center">{rightElement}</div>
        )}
      </div>
    </div>
  );
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Reset fields on mode switch
  useEffect(() => {
    setPassword("");
    setShowPassword(false);
  }, [mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate a brief loading state
    setTimeout(() => {
      setIsSubmitting(false);
      onLogin();
    }, 800);
  };

  const isLoginValid = email.length > 0 && password.length > 0;
  const isSignupValid = name.length > 0 && email.length > 0 && password.length >= 6 && agreeTerms;
  const isValid = mode === "login" ? isLoginValid : isSignupValid;

  // Password strength indicator for signup
  const getPasswordStrength = (pw: string) => {
    if (pw.length === 0) return { level: 0, label: "", color: "" };
    if (pw.length < 6) return { level: 1, label: "Too short", color: "#ef4444" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 2, label: "Weak", color: "#f59e0b" };
    if (score <= 2) return { level: 3, label: "Fair", color: "#f59e0b" };
    if (score <= 3) return { level: 4, label: "Good", color: "#22c55e" };
    return { level: 5, label: "Strong", color: "#22c55e" };
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="min-h-screen w-full bg-[#141515] flex items-center justify-center p-4 font-['Roboto',sans-serif] antialiased relative overflow-hidden">
      {/* Subtle radial gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-[#58AFFF]/[0.02] blur-[120px]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-[400px] relative z-10"
      >
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-gradient-to-br from-[#58AFFF]/20 to-[#58AFFF]/5 border border-[#58AFFF]/10 mb-5 shadow-[0_0_40px_rgba(88,175,255,0.08)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#58AFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-[22px] font-medium text-[#E8E8E8] mb-1.5 tracking-[-0.01em]">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-[13px] text-white/35">
                {mode === "login"
                  ? "Sign in to continue to your workspace"
                  : "Get started with your free account"
                }
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Auth Card */}
        <div className="bg-[#191A1A] border border-white/[0.06] rounded-2xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
          {/* Social Buttons */}
          <div className="flex gap-3 mb-5">
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2.5 h-[42px] rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.14] transition-all duration-200 text-[13px] text-[#E8E8E8]/80 cursor-pointer group"
              onClick={onLogin}
            >
              <GoogleIcon className="size-4" />
              <span className="group-hover:text-[#E8E8E8] transition-colors">Google</span>
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2.5 h-[42px] rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.14] transition-all duration-200 text-[13px] text-[#E8E8E8]/80 cursor-pointer group"
              onClick={onLogin}
            >
              <Github size={16} className="text-white/70" />
              <span className="group-hover:text-[#E8E8E8] transition-colors">GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[11px] text-white/25 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              ref={formRef}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: mode === "signup" ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "signup" ? -20 : 20 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col gap-3"
            >
              {mode === "signup" && (
                <FloatingInput
                  id="name"
                  label="Full name"
                  value={name}
                  onChange={setName}
                  autoFocus
                  icon={<User size={16} />}
                />
              )}
              <FloatingInput
                id="email"
                label="Email address"
                type="email"
                value={email}
                onChange={setEmail}
                autoFocus={mode === "login"}
                icon={<Mail size={16} />}
              />
              <div>
                <FloatingInput
                  id="password"
                  label={mode === "signup" ? "Password (min. 6 characters)" : "Password"}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  icon={<Lock size={16} />}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors text-white/25 hover:text-white/50 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />
                {/* Password strength bar - signup only */}
                {mode === "signup" && password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 px-1"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="h-[3px] flex-1 rounded-full transition-all duration-300"
                            style={{
                              backgroundColor:
                                i <= strength.level
                                  ? strength.color
                                  : "rgba(255,255,255,0.06)",
                            }}
                          />
                        ))}
                      </div>
                      <span
                        className="text-[10px] font-medium min-w-[52px] text-right transition-colors"
                        style={{ color: strength.color }}
                      >
                        {strength.label}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Login extras */}
              {mode === "login" && (
                <div className="flex items-center justify-between mt-0.5">
                  <button
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    className="flex items-center gap-2 group cursor-pointer"
                  >
                    <div
                      className={`
                        size-[16px] rounded-[4px] border flex items-center justify-center transition-all duration-200
                        ${rememberMe
                          ? "bg-[#58AFFF] border-[#58AFFF] shadow-[0_0_8px_rgba(88,175,255,0.2)]"
                          : "border-white/15 bg-white/[0.03] group-hover:border-white/25"
                        }
                      `}
                    >
                      {rememberMe && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <Check size={10} className="text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </div>
                    <span className="text-[12px] text-white/40 group-hover:text-white/55 transition-colors select-none">
                      Remember me
                    </span>
                  </button>
                  <button
                    type="button"
                    className="text-[12px] text-[#58AFFF]/70 hover:text-[#58AFFF] transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Signup terms agreement */}
              {mode === "signup" && (
                <button
                  type="button"
                  onClick={() => setAgreeTerms(!agreeTerms)}
                  className="flex items-start gap-2.5 mt-0.5 group cursor-pointer text-left"
                >
                  <div
                    className={`
                      size-[16px] rounded-[4px] border flex items-center justify-center transition-all duration-200 mt-0.5 shrink-0
                      ${agreeTerms
                        ? "bg-[#58AFFF] border-[#58AFFF] shadow-[0_0_8px_rgba(88,175,255,0.2)]"
                        : "border-white/15 bg-white/[0.03] group-hover:border-white/25"
                      }
                    `}
                  >
                    {agreeTerms && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <Check size={10} className="text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </div>
                  <span className="text-[12px] text-white/40 group-hover:text-white/55 transition-colors select-none leading-[1.5]">
                    I agree to the{" "}
                    <span className="text-[#58AFFF]/70 hover:text-[#58AFFF]">Terms of Service</span>{" "}
                    and{" "}
                    <span className="text-[#58AFFF]/70 hover:text-[#58AFFF]">Privacy Policy</span>
                  </span>
                </button>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className={`
                  mt-3 h-[44px] rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 transition-all duration-200 relative overflow-hidden cursor-pointer
                  ${isValid && !isSubmitting
                    ? "bg-[#58AFFF] text-white hover:bg-[#6BBAFF] shadow-[0_2px_12px_rgba(88,175,255,0.25)] hover:shadow-[0_4px_20px_rgba(88,175,255,0.35)]"
                    : "bg-white/[0.05] text-white/20 cursor-not-allowed"
                  }
                `}
              >
                {isSubmitting ? (
                  <motion.div
                    className="size-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <>
                    {mode === "login" ? "Sign in" : "Create account"}
                    <ArrowRight size={15} className={`transition-transform ${isValid ? "group-hover:translate-x-0.5" : ""}`} />
                  </>
                )}
              </button>
            </motion.form>
          </AnimatePresence>
        </div>

        {/* Toggle mode */}
        <div className="text-center mt-6">
          <span className="text-[13px] text-white/30">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-[#58AFFF]/80 hover:text-[#58AFFF] transition-colors cursor-pointer font-medium"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </span>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[11px] text-white/15">
            Protected by reCAPTCHA and subject to our Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
}
