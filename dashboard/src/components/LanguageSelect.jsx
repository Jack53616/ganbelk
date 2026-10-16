import { useLang } from '../context/LangContext';

const LANGUAGES = [
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'English' },
  { value: 'it', label: 'Italiano' },
];

export default function LanguageSelect({ className = '' }) {
  const { lang, setLang, t } = useLang();

  return (
    <label className={className}>
      <span className="sr-only">{t('language')}</span>
      <select
        aria-label={t('language')}
        value={lang}
        onChange={(event) => setLang(event.target.value)}
        className="bg-black/25 border border-ql-border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-ql-green/50"
      >
        {LANGUAGES.map((language) => (
          <option key={language.value} value={language.value}>{language.label}</option>
        ))}
      </select>
    </label>
  );
}
