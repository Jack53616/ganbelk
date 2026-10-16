import { useState } from 'react';
import { Menu, LogOut, ChevronDown } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import LanguageSelect from './LanguageSelect';

export default function Topbar({ onMenu }) {
  const { t } = useLang();
  const { admin, logout, isSuperAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="h-16 shrink-0 flex items-center gap-3 px-4 md:px-6 glass border-b border-ql-border sticky top-0 z-30">
      <button onClick={onMenu} className="md:hidden p-2 rounded-lg hover:bg-white/5 text-ql-text-dim">
        <Menu size={20} />
      </button>

      <div className="flex-1" />
      <LanguageSelect />

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 pe-1 ps-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
        >
          <Avatar name={admin?.name} url={admin?.avatarUrl} size={32} />
          <div className="hidden md:block text-start">
            <div className="text-xs font-semibold leading-tight">{admin?.name}</div>
            <div className="text-[10px] text-ql-text-dim leading-tight">{isSuperAdmin ? t('super_admin') : t('admin')}</div>
          </div>
          <ChevronDown size={14} className="text-ql-text-dim hidden md:block" />
        </button>
        {menuOpen && (
          <div className="absolute end-0 mt-2 w-44 glass rounded-xl p-1.5 shadow-2xl animate-fade-up">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ql-red hover:bg-ql-red/10 transition-colors"
            >
              <LogOut size={15} /> {t('logout')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
