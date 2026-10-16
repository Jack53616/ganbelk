import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useLang } from '../context/LangContext';
import ErrorNotice from '../components/ErrorNotice';

const ACTION_COLORS = {
  key_created: 'bg-ql-green',
  key_activated: 'bg-ql-green',
  user_registered: 'bg-ql-blue',
  key_revoked: 'bg-ql-red',
  key_expired: 'bg-ql-red',
  key_plan_changed: 'bg-ql-orange',
  key_billing_changed: 'bg-ql-orange',
  key_extended: 'bg-ql-purple',
  key_device_reset: 'bg-ql-orange',
  key_deleted: 'bg-ql-red',
  admin_created: 'bg-ql-blue',
  admin_updated: 'bg-ql-orange',
  admin_deleted: 'bg-ql-red',
  admin_login: 'bg-ql-text-dim',
  service_control_updated: 'bg-ql-green',
};

function activityLabel(t, entry) {
  const key = `activity_${entry.action}`;
  const translated = t(key);
  return translated === key ? entry.message || key : translated;
}

export default function Activity() {
  const { t, lang } = useLang();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');
  const limit = 20;
  const pages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    api.activity({ limit, page }).then((res) => {
      setItems(res.items);
      setTotal(res.total);
      setError('');
    }).catch(() => setError(t('action_failed')));
  }, [page, t]);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">{t('nav_activity')}</h1>
      <ErrorNotice>{error}</ErrorNotice>
      <div className="glass rounded-2xl p-4 animate-fade-up">
        <div className="space-y-1">
          {items.map((a) => (
            <div key={a.id} className="flex items-start gap-3 text-sm py-2.5 border-b border-ql-border/40 last:border-0">
              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${ACTION_COLORS[a.action] || 'bg-ql-text-dim'}`} />
              <div className="min-w-0 flex-1">
                  <div>{activityLabel(t, a)}</div>
                  <div className="text-[11px] text-ql-text-dim mt-0.5 flex items-center gap-2">
                    <span>{a.actor_name || t('system')}</span>
                  <span>·</span>
                  <span>{new Date(a.created_at).toLocaleString(lang)}</span>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="py-8 text-center text-ql-text-dim text-xs">{t('no_data')}</div>}
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-ql-text-dim">
          <span>{total} {t('total')}</span>
          <div className="flex items-center gap-2">
            <button aria-label={t('previous')} disabled={page === 0} onClick={() => setPage((current) => current - 1)} className="px-3 py-1.5 rounded-lg glass disabled:opacity-40">‹</button>
            <span>{t('page')} {page + 1} {t('of')} {pages}</span>
            <button aria-label={t('next')} disabled={page >= pages - 1} onClick={() => setPage((current) => current + 1)} className="px-3 py-1.5 rounded-lg glass disabled:opacity-40">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
