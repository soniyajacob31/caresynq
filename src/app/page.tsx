import { ChartValidationWorkspace } from "@/components/chart-validation-workspace";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 shrink-0 border-b border-border/50 bg-background/85 backdrop-blur-md supports-backdrop-filter:bg-background/70">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:h-16">
          <span className="bg-linear-to-r from-teal-200 via-cyan-200 to-teal-300 bg-clip-text text-xl font-semibold tracking-tight text-transparent sm:text-2xl">
            CareSynq
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
        <ChartValidationWorkspace />
      </main>
    </div>
  );
}
