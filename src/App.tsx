// Phase 0 placeholder: proves Tailwind, tokens and fonts work. Replaced by the app shell in Phase 1.
export default function App() {
  return (
    <main className="flex h-full items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground">
        <p className="text-xs text-muted-foreground">Phase 0 · setup</p>
        <h1 className="mt-1 text-xl font-semibold">Khaled&apos;s Dev Kit</h1>
        <p className="mt-2 text-muted-foreground">Tailwind, theme tokens and fonts are wired up.</p>
        <pre className="mt-4 rounded-md bg-muted p-3 font-mono text-xs">pnpm tauri dev</pre>
        <button className="mt-4 rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground">
          Primary
        </button>
      </div>
    </main>
  );
}
