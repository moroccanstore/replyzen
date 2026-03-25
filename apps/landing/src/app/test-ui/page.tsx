export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="max-w-md w-full glass-panel p-10 rounded-xl ambient-glow transition-all hover:scale-[1.02]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AUTOWHATS UI Test</h1>
        </div>
        
        <div className="space-y-4">
          <p className="text-foreground/80 leading-relaxed">
            This is a validation for the premium design system. If you see a deep dark background, 
            soft white text, and a glowing purple primary button, then the foundation is ready.
          </p>
          
          <div className="pt-4">
            <button className="w-full py-3 px-6 rounded-lg bg-gradient-primary text-white font-semibold shadow-xl hover:opacity-90 transition-opacity">
              Validate Foundation
            </button>
          </div>
          
          <div className="mt-8 p-4 rounded-lg bg-muted border border-border">
            <p className="text-sm text-muted-foreground font-mono">
              Background: #0c0e14<br />
              Primary: #7c3aed<br />
              Effect: glass-panel + ambient-glow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
