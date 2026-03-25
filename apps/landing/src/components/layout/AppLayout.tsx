"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Bot, 
  LayoutDashboard, 
  Download, 
  BookOpen, 
  HelpCircle, 
  CreditCard, 
  LifeBuoy,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { name: "Home", href: "/", icon: LayoutDashboard },
  { name: "Product", href: "/product", icon: Bot },
  { name: "Install", href: "/install", icon: Download },
  { name: "How to Use", href: "/how-to-use", icon: BookOpen },
  { name: "Docs", href: "/docs", icon: HelpCircle },
  { name: "Pricing", href: "/pricing", icon: CreditCard },
  { name: "Support", href: "/support", icon: LifeBuoy },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <header 
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 border-b",
          isScrolled 
            ? "glass-panel border-border py-2" 
            : "bg-transparent border-transparent py-4"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="font-bold text-xl tracking-tight">AUTOWHATS</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:text-primary",
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-foreground/70"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
            <div className="ml-4 pl-4 border-l border-border/50">
              <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-primary to-[#9f67ff] text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] border-t border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700 ease-in-out" />
                <span className="relative z-10 drop-shadow-md">Try Dashboard</span>
              </button>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border shadow-2xl overflow-y-auto animate-in fade-in pb-10">
            {/* Nav Header inside menu to allow closing */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between border-b border-border/50 mb-6">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">A</span>
                </div>
                <span className="font-bold text-xl tracking-tight">AUTOWHATS</span>
              </Link>
              <button 
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex flex-col gap-4 px-4 sm:px-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 py-3 px-4 rounded-xl text-lg font-medium transition-colors",
                    pathname === item.href ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-muted"
                  )}
                >
                  <item.icon size={20} className={pathname === item.href ? "text-primary" : "text-muted-foreground"} />
                  {item.name}
                </Link>
              ))}
              <div className="pt-6 mt-4 border-t border-border px-4">
                <button className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-primary to-[#9f67ff] text-white shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_50px_rgba(124,58,237,0.6)] border-t border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700 ease-in-out" />
                  <span className="relative z-10 drop-shadow-md">Try Dashboard</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow pb-24 sm:pb-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">A</span>
                </div>
                <span className="font-bold text-xl tracking-tight">AUTOWHATS</span>
              </Link>
              <p className="text-muted-foreground max-w-sm">
                The ultimate AI-powered WhatsApp CRM for premium sales automation and customer engagement.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/product" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/install" className="hover:text-primary transition-colors">Self-hosted</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link href="/support" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="/how-to-use" className="hover:text-primary transition-colors">Tutorials</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} AUTOWHATS. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
