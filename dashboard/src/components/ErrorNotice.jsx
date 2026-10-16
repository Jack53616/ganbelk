export default function ErrorNotice({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="text-xs text-ql-red bg-ql-red/10 border border-ql-red/30 rounded-lg px-3 py-2">
      {children}
    </div>
  );
}
