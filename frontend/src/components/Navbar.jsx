"use client";
import React from "react";
import {
  Brain,
  Plus,
  LayoutDashboard,
  FileText,
  MessageCircle,
  Route
} from "lucide-react";
import { Clock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  // Define colors to match your app theme
  const colors = {
    primary: "#3B82F6", // Blue color matching your theme
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Sheets",
      href: "/sheets",
      icon: FileText,
    },
    {
      name: "Chatbot",
      href: "/chatbot",
      icon: MessageCircle,
    },
    {
      name: "Timer",
      href: "/timer",
      icon: Clock
    },
    {
      name: "Personalized Path",
      href: "/personalized-path",
      icon: Route,
    },
  ];

  const isActive = (href) => pathname === href;

  return (
    <header 
      className="backdrop-blur-xl border-b sticky top-0 z-50"
      style={{
        backgroundColor: "rgba(27, 31, 59, 0.85)",
        borderColor: "rgba(79, 70, 229, 0.2)",
        backdropFilter: "blur(12px)"
      }}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Matching your provided design */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div 
              className="p-3 rounded-2xl" 
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <Brain 
                className="w-8 h-8" 
                style={{ color: colors.primary }} 
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                MindMate
              </h1>
              <p className="text-slate-400 text-sm">AI-Powered Learning Hub</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-300 group ${
                    isActive(item.href)
                      ? "bg-white/20 text-white border border-white/30 shadow-lg shadow-white/10"
                      : "text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-300 ${
                    isActive(item.href) ? "scale-110" : "group-hover:scale-105"
                  }`} />
                  <span className="hidden lg:inline text-sm">{item.name}</span>
                </Link>
              );
            })}

            {/* New Sheet Button */}
            <Link
              href="/generate-sheet"
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-medium ml-2 group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden sm:inline text-sm">New Sheet</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;