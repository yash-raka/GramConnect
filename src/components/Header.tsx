import { Landmark, LogOut } from 'lucide-react';

interface HeaderProps {
  isAdmin?: boolean;
  onLogout?: () => void;
}

export function Header({ isAdmin, onLogout }: HeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-amber-100/60 bg-[linear-gradient(135deg,#4f7a3a_0%,#71975b_45%,#d9a25b_100%)] text-white shadow-[0_12px_28px_rgba(79,122,58,0.22)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(91,56,24,0.16),transparent_28%)]" />
      <div className="relative max-w-6xl mx-auto px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/95 p-3 shadow-lg shadow-amber-950/10">
              <Landmark className="w-6 h-6 text-[#5d7f46]" />
            </div>
            <div>
              <h1 className="village-title text-3xl font-bold">GramConnect</h1>
              <p className="text-sm text-amber-50/95">A friendly digital seva desk for your Panchayat</p>
            </div>
          </div>
          
          {isAdmin && onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
