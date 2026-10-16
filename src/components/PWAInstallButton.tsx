import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'full' | 'compact' | 'icon' }> = ({
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone mode, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'icon') {
      return (
        <button
          onClick={install}
          title="Install Duba App"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 hover:text-cyan-300 transition-colors"
        >
          <Download className="h-4 w-4" />
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:from-cyan-400 hover:to-indigo-500 transition-all active:scale-95"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Install Duba App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition"
        >
          <Download className="h-3.5 w-3.5 text-cyan-400" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-100">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Download className="h-4 w-4 text-cyan-400" />
                Install Duba on iPhone / iPad
              </h3>

              <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-2.5 rounded-lg bg-slate-800/60 p-2.5 border border-slate-700/60">
                  <Share2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p>
                    1. Tap the <strong>Share</strong> icon in the Safari bottom bar.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 rounded-lg bg-slate-800/60 p-2.5 border border-slate-700/60">
                  <PlusSquare className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p>
                    2. Scroll down and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-cyan-600 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-cyan-500 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Default fallback install button if ambient
  return null;
};
