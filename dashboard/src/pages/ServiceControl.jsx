import { useEffect, useState } from 'react';
import {
  Activity, CheckCircle2, Clock3, LockKeyhole, Power, ShieldAlert,
  SlidersHorizontal, Sparkles, Store, Wrench
} from 'lucide-react';
import { api } from '../lib/api';
import { useLang } from '../context/LangContext';
import ErrorNotice from '../components/ErrorNotice';

const DURATIONS = [15, 30, 60, 120, 360, 720, 1440, 10080];

function formatRemaining(milliseconds) {
  const total = Math.max(0, Math.ceil(milliseconds / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [days, hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

export default function ServiceControl() {
  const { t, lang } = useLang();
  const [state, setState] = useState({ maintenanceEnabled: false, marketPauseUntil: null, updatedAt: null, updatedBy: null });
  const [duration, setDuration] = useState(60);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = () => api.serviceControl().then((result) => {
      if (mounted) {
        setState(result.state);
        setError('');
      }
    }).catch(() => {
      if (mounted) setError(t('action_failed'));
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    load();
    const refresh = setInterval(load, 30000);
    const ticker = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      mounted = false;
      clearInterval(refresh);
      clearInterval(ticker);
    };
  }, [t]);

  async function updateControl(patch) {
    setBusy(true);
    setError('');
    try {
      const result = await api.updateServiceControl(patch);
      setState(result.state);
      setNow(Date.now());
    } catch (_err) {
      setError(t('action_failed'));
    } finally {
      setBusy(false);
    }
  }

  const marketActive = Number(state.marketPauseUntil) > now;
  const maintenanceActive = state.maintenanceEnabled === true;
  const formatDate = (value) => value ? new Date(value).toLocaleString(lang) : '—';

  return (
    <div className="space-y-5 animate-fade-up">
      <section className="glass rounded-3xl p-5 sm:p-7 relative overflow-hidden border border-ql-green/20">
        <div className="absolute -top-20 -right-12 w-64 h-64 rounded-full bg-ql-green/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 left-10 w-56 h-56 rounded-full bg-ql-blue/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-ql-green/25 bg-ql-green/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-ql-green mb-4">
              <LockKeyhole size={13} /> {t('service_control_restricted')}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-ql-green/10 border border-ql-green/20 flex items-center justify-center text-ql-green"><SlidersHorizontal size={22} /></span>
              {t('service_control_title')}
            </h1>
            <p className="text-sm text-ql-text-dim mt-3 leading-relaxed">{t('service_control_subtitle')}</p>
          </div>
          <div className="rounded-2xl glass px-4 py-3 min-w-44">
            <div className="text-[10px] uppercase tracking-[.16em] text-ql-text-dim flex items-center gap-2"><Activity size={13} /> {t('service_control_live')}</div>
            <div className="flex items-center gap-2 mt-2 font-semibold text-sm">
              <span className={`w-2 h-2 rounded-full ${maintenanceActive || marketActive ? 'bg-ql-orange animate-pulse-dot' : 'bg-ql-green animate-pulse-dot'}`} />
              {loading ? t('service_control_loading') : maintenanceActive || marketActive ? t('service_control_paused') : t('service_control_running')}
            </div>
          </div>
        </div>
      </section>

      <ErrorNotice>{error}</ErrorNotice>

      <div className="grid xl:grid-cols-2 gap-4">
        <section className={`glass rounded-3xl p-5 sm:p-6 border transition-colors ${maintenanceActive ? 'border-ql-orange/35 shadow-[0_0_34px_-20px_rgba(255,166,61,.55)]' : 'border-ql-border'}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${maintenanceActive ? 'text-ql-orange bg-ql-orange/10 border-ql-orange/20' : 'text-ql-green bg-ql-green/10 border-ql-green/20'}`}><Wrench size={22} /></span>
              <div>
                <h2 className="font-bold text-lg">{t('service_control_maintenance')}</h2>
                <p className="text-xs text-ql-text-dim mt-1 leading-relaxed max-w-sm">{t('service_control_maintenance_desc')}</p>
              </div>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${maintenanceActive ? 'bg-ql-orange/10 text-ql-orange' : 'bg-white/5 text-ql-text-dim'}`}>
              {maintenanceActive ? t('service_control_paused') : t('service_control_running')}
            </span>
          </div>

          <div className="mt-7 rounded-2xl bg-black/15 border border-ql-border/70 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${maintenanceActive ? 'bg-ql-orange/10 text-ql-orange' : 'bg-white/5 text-ql-text-dim'}`}><Power size={17} /></span>
              <div>
                <div className="text-sm font-semibold">{maintenanceActive ? t('service_control_disable_maintenance') : t('service_control_enable_maintenance')}</div>
                <div className="text-[11px] text-ql-text-dim mt-0.5">{t('service_control_maintenance_hint')}</div>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={maintenanceActive}
              aria-label={t('service_control_maintenance')}
              disabled={busy || loading}
              onClick={() => updateControl({ maintenanceEnabled: !maintenanceActive })}
              className={`relative w-14 h-8 rounded-full border transition-all disabled:opacity-50 ${maintenanceActive ? 'bg-ql-orange/30 border-ql-orange/50 shadow-[0_0_20px_-5px_rgba(255,166,61,.5)]' : 'bg-white/5 border-white/10'}`}
            >
              <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${maintenanceActive ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </section>

        <section className={`glass rounded-3xl p-5 sm:p-6 border transition-colors ${marketActive ? 'border-ql-orange/35 shadow-[0_0_34px_-20px_rgba(255,166,61,.55)]' : 'border-ql-border'}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${marketActive ? 'text-ql-orange bg-ql-orange/10 border-ql-orange/20' : 'text-ql-green bg-ql-green/10 border-ql-green/20'}`}><Store size={22} /></span>
              <div>
                <h2 className="font-bold text-lg">{t('service_control_market_pause')}</h2>
                <p className="text-xs text-ql-text-dim mt-1 leading-relaxed max-w-sm">{t('service_control_market_desc')}</p>
              </div>
            </div>
            {marketActive && <span className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold bg-ql-orange/10 text-ql-orange">{t('service_control_paused')}</span>}
          </div>

          <div className="mt-6 rounded-2xl bg-black/15 border border-ql-border/70 p-4">
            {marketActive ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[.14em] text-ql-text-dim flex items-center gap-2"><Clock3 size={13} /> {t('service_control_remaining')}</div>
                  <div dir="ltr" className="font-mono text-2xl tracking-[.12em] text-ql-orange mt-1">{formatRemaining(Number(state.marketPauseUntil) - now)}</div>
                  <div className="text-[11px] text-ql-text-dim mt-1">{t('service_control_until')} {formatDate(Number(state.marketPauseUntil))}</div>
                </div>
                <button type="button" disabled={busy} onClick={() => updateControl({ marketPauseMinutes: 0 })} className="rounded-xl border border-ql-orange/30 bg-ql-orange/10 px-4 py-2.5 text-xs font-bold text-ql-orange hover:bg-ql-orange/15 transition disabled:opacity-50">
                  {busy ? t('service_control_saving') : t('service_control_clear_pause')}
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
                <label className="block">
                  <span className="text-[11px] font-semibold text-ql-text-dim flex items-center gap-2 mb-2"><Clock3 size={13} /> {t('service_control_duration')}</span>
                  <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full bg-[#101813] border border-ql-border rounded-xl px-3 py-3 text-sm text-ql-text outline-none focus:border-ql-green/45">
                    {DURATIONS.map((minutes) => <option key={minutes} value={minutes}>{minutes < 60 ? `${minutes} ${t('minutes')}` : minutes < 1440 ? `${minutes / 60} ${t('hours')}` : `${minutes / 1440} ${t('days')}`}</option>)}
                  </select>
                </label>
                <button type="button" disabled={busy || loading} onClick={() => updateControl({ marketPauseMinutes: duration })} className="rounded-xl bg-gradient-to-r from-ql-green to-emerald-400 px-4 py-3 text-xs font-extrabold text-[#07130b] shadow-[0_8px_24px_-12px_rgba(34,255,140,.75)] hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]">
                  {busy ? <><Sparkles size={15} className="animate-spin" />{t('service_control_saving')}</> : <><ShieldAlert size={15} />{t('service_control_start_pause')}</>}
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-4 text-[11px] text-ql-text-dim"><CheckCircle2 size={14} className="text-ql-green shrink-0" />{t('service_control_pause_hint')}</div>
        </section>
      </div>

      <div className="glass rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-ql-text-dim">
        <span className="flex items-center gap-2"><Activity size={13} />{t('service_control_last_updated')}: {formatDate(state.updatedAt)}</span>
        <span>{t('service_control_updated_by')}: {state.updatedBy || '—'}</span>
      </div>
    </div>
  );
}
