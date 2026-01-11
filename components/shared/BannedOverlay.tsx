"use client";

import { SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import React from 'react';

interface Props {
  reason?: string;
  expiration?: Date | string;
}

const BannedOverlay = ({ reason, expiration }: Props) => {
  const [timeLeft, setTimeLeft] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!expiration) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = new Date(expiration).getTime() - now;

      if (distance < 0) {
        setTimeLeft("Expired");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      let timeString = "";
      if (days > 0) timeString += `${days}d `;
      if (hours > 0) timeString += `${hours}h `;
      timeString += `${minutes}m`;

      setTimeLeft(timeString);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 10000); // update every 10 seconds for better responsiveness

    return () => clearInterval(timer);
  }, [expiration]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden">
      {/* Background Blur Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
      
      {/* Content Card */}
      <div className="relative flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-6 flex items-center justify-center rounded-full border-2 border-red-500/50 bg-red-500/10 p-6 shadow-[0_0_50px_rgba(239,68,68,0.4)] animate-pulse">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="64" 
            height="64" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]"
          >
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
            <path d="m15 9-6 6"/>
            <path d="m9 9 6 6"/>
          </svg>
        </div>
        
        <h1 className="text-6xl font-extrabold tracking-tighter text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,1)] sm:text-8xl">
          BANNED
        </h1>
        
        <div className="mt-8 max-w-lg rounded-3xl border border-white/20 bg-black/40 p-10 backdrop-blur-2xl shadow-2xl">
          <p className="text-2xl font-bold text-white tracking-tight">
            ACCOUNT TERMINATED
          </p>
          <p className="mt-4 text-light-700 leading-relaxed text-lg">
            Your access to the Rotōs forum has been restricted for violating our Terms of Service.
          </p>
          
          <div className="mt-8 flex flex-col gap-4">
            <div className="rounded-xl bg-red-500/5 p-4 border border-red-500/10">
              <p className="text-xs text-light-500 uppercase tracking-widest font-bold mb-1">
                Reason for ban
              </p>
              <p className="text-red-400 font-medium">{reason || "Access Restricted"}</p>
            </div>

            {expiration ? (
              <div className="rounded-xl bg-yellow-500/5 p-4 border border-yellow-500/10">
                <p className="text-xs text-light-500 uppercase tracking-widest font-bold mb-1">
                  Time Remaining
                </p>
                <p className="text-yellow-400 font-medium">
                  {timeLeft || "Calculating..."}
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-red-500/5 p-4 border border-red-500/10">
                <p className="text-xs text-light-500 uppercase tracking-widest font-bold mb-1">
                  Duration
                </p>
                <p className="text-red-400 font-medium uppercase tracking-widest">
                  Permanent
                </p>
              </div>
            )}

            <div className="pt-4">
              <p className="text-sm text-light-800 uppercase tracking-widest font-semibold mb-4">
                Appeal this decision
              </p>
              <Link 
                href="https://discord.gg/QUdUhgUxFY"
                target="_blank"
                className="flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
              >
                <div className="rounded-full bg-white/5 p-3 border border-white/10 group-hover:border-[#5865F2]/50 group-hover:bg-[#5865F2]/10 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_30px_rgba(88,101,242,0.3)]">
                  <svg 
                    viewBox="0 0 24 24" 
                    width="28" 
                    height="28" 
                    fill="currentColor" 
                    className="text-white group-hover:text-[#5865F2] transition-colors"
                  >
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.946 2.419-2.157 2.419z"/>
                  </svg>
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-10">
            <SignOutButton>
              <button className="w-full rounded-xl bg-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-black transition-all hover:bg-light-800 active:scale-95">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannedOverlay;
