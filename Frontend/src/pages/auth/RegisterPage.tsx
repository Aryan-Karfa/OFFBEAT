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
import { UserPlusIcon, ArrowRightIcon } from "../../components/icons/Icons";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Phase 1: Client-side UI foundation only (No backend auth API call)
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
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
        <CardTitle className="text-xl font-bold text-white">Create an account</CardTitle>
        <CardDescription>
          Join OFFBEAT and start exploring travel beyond conventional algorithms.
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
            id="register-name"
            label="Full Name"
            type="text"
            placeholder="Alex Explorer"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />

          <Input
            id="register-email"
            label="Email Address"
            type="email"
            placeholder="alex@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <Input
            id="register-password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <Input
            id="register-confirm-password"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <div className="pt-2 space-y-2.5">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={isLoading}
              leftIcon={<UserPlusIcon size={16} />}
            >
              Create Account
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="md"
              className="w-full"
              onClick={() => navigate("/dashboard")}
              rightIcon={<ArrowRightIcon size={14} />}
            >
              Continue to Application as Guest
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-[#1f2633] text-center text-xs text-slate-400">
          <span>Already have an account? </span>
          <Link
            to="/login"
            className="text-[#ff5a36] font-medium hover:text-[#ff704f] transition-colors underline underline-offset-2"
          >
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
