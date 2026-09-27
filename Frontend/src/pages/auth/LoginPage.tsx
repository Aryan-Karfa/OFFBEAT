import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { LogInIcon, ArrowRightIcon } from "../../components/icons/Icons";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email or username.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    // Phase 1: Client-side UI foundation only (No backend auth API call)
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to dashboard
      navigate("/dashboard");
    }, 500);
  };

  return (
    <Card className="border-[#1f2633] bg-[#12161f]/90 shadow-2xl backdrop-blur-xl">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-2">
          <Badge variant="accent" size="sm">
            Phase 1 Auth Foundation
          </Badge>
        </div>
        <CardTitle className="text-xl font-bold text-white">Welcome back</CardTitle>
        <CardDescription>
          Sign in to access your travel taste and saved collections.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
              {error}
            </div>
          )}

          <Input
            id="login-email"
            label="Email or Username"
            type="text"
            placeholder="traveler@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="login-password" className="text-xs font-medium text-slate-300">
                Password
              </label>
              <button
                type="button"
                className="text-xs text-[#ff5a36] hover:text-[#ff704f] transition-colors focus:outline-none"
                onClick={() => alert("Password reset is part of future authentication phases.")}
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-[#ff5a36] focus:ring-[#ff5a36] focus:ring-offset-0"
            />
            <label htmlFor="remember" className="text-xs text-slate-400 select-none cursor-pointer">
              Remember this device
            </label>
          </div>

          <div className="pt-2 space-y-2.5">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={isLoading}
              leftIcon={<LogInIcon size={16} />}
            >
              Sign In
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="md"
              className="w-full"
              onClick={() => navigate("/dashboard")}
              rightIcon={<ArrowRightIcon size={14} />}
            >
              Enter Application as Guest
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-[#1f2633] text-center text-xs text-slate-400">
          <span>New to OFFBEAT? </span>
          <Link
            to="/register"
            className="text-[#ff5a36] font-medium hover:text-[#ff704f] transition-colors underline underline-offset-2"
          >
            Create an account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
