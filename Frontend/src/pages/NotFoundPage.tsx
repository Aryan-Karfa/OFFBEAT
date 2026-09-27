import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { CompassIcon, ArrowRightIcon } from "../components/icons/Icons";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md mx-auto space-y-5">
        <Badge variant="danger" size="md">
          404 — Off the Map
        </Badge>

        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-[#ff5a36] shadow-glow-accent">
          <CompassIcon size={32} />
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Destination Not Found
        </h1>

        <p className="text-sm text-slate-400">
          The trail you followed doesn&apos;t exist or has moved. Return to the discovery dashboard
          to find your route.
        </p>

        <div className="pt-2">
          <Link to="/dashboard">
            <Button
              variant="primary"
              size="md"
              leftIcon={<CompassIcon size={16} />}
              rightIcon={<ArrowRightIcon size={14} />}
            >
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
