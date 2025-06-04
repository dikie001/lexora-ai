import React, { useEffect, useState } from "react";
import Bot from "./chatbot/ChatBot";
import { Toaster } from "react-hot-toast";
import { Moon, Sun, Sparkles, Download, X } from "lucide-react";

const App = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    // Using in-memory storage instead of localStorage for Claude.ai compatibility
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      console.log(
        choiceResult.outcome === "accepted"
          ? "✅ User accepted the install"
          : "❌ User dismissed the install"
      );
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 text-slate-900 dark:text-slate-100 transition-all duration-500">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-200/20 to-blue-300/20 dark:from-cyan-600/10 dark:to-blue-700/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/20 to-pink-300/20 dark:from-purple-600/10 dark:to-pink-700/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-6 right-6 z-40">
        <button
          onClick={() => setIsDark(!isDark)}
          className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div className="relative z-10">
            {isDark ? (
              <Sun
                size={20}
                className="text-amber-500 group-hover:rotate-12 transition-transform duration-300"
              />
            ) : (
              <Moon
                size={20}
                className="text-slate-600 group-hover:-rotate-12 transition-transform duration-300"
              />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 dark:from-blue-400/20 dark:to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>

      {/* Install Prompt Modal */}
      {showInstallButton && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-md"
            onClick={() => setShowInstallButton(false)}
          ></div>

          {/* Modal */}
          <div className="relative w-full max-w-md bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden">
            {/* Gradient Header */}
            <div className="relative bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 p-6 text-white">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/50 to-indigo-600/50 animate-pulse"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Sparkles
                      size={24}
                      className="animate-spin"
                      style={{ animationDuration: "3s" }}
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Install Lexora AI</h2>
                    <p className="text-blue-100 text-sm opacity-90">
                      Your AI companion
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInstallButton(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Get instant access with a native app experience. No browser
                  tabs, just pure productivity.
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Faster loading</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Offline ready</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleInstall}
                  className="group relative w-full overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-2">
                    <Download
                      size={20}
                      className="group-hover:animate-bounce"
                    />
                    <span>Install Now</span>
                  </div>
                </button>

                <button
                  onClick={() => setShowInstallButton(false)}
                  className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10">
        <Bot />
      </div>

      {/* Enhanced Toaster */}
      <Toaster
        position="top-center"
        toastOptions={{
          className:
            "backdrop-blur-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 shadow-xl",
          duration: 4000,
          style: {
            borderRadius: "16px",
            padding: "16px",
          },
        }}
      />
    </div>
  );
};

export default App;
