"use client";

import type { Application } from "@splinetool/runtime";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ChevronDown, CircleDot, Loader2, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CursorSpotlight } from "@/components/ui/cursor-spotlight";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import {
  type ChartAnalysisReport,
  type ChartFinding,
  analyzeUploadedChart,
} from "@/lib/chart-analysis";
import { DEFAULT_SPLINE_SCENE } from "@/lib/spline-config";
import {
  configureSplinePointerBridge,
  forwardPointerToSpline,
} from "@/lib/spline-mouse";
import { cn } from "@/lib/utils";

/** One “screen” panel height under header + padding (both validation & review use this). */
const VIEWPORT_PANEL =
  "h-[calc(100svh-7rem)] max-h-[calc(100svh-7rem)] min-h-[320px]";

/** Cap height so ~3 issue cards show; remainder scrolls (see compact list spacing). */
const FINDINGS_SCROLL_MAX = "max-h-[13.5rem]";

function severityStyles(f: ChartFinding["severity"]) {
  switch (f) {
    case "missing":
      return "border-rose-500/30 bg-rose-500/10 text-rose-100";
    case "incomplete":
      return "border-amber-500/30 bg-amber-500/10 text-amber-100";
    case "issue":
      return "border-violet-500/30 bg-violet-500/10 text-violet-100";
    default:
      return "border-border bg-muted";
  }
}

function severityLabel(f: ChartFinding["severity"]) {
  switch (f) {
    case "missing":
      return "Missing";
    case "incomplete":
      return "Incomplete";
    case "issue":
      return "Review";
    default:
      return f;
  }
}

function SectionFindingsList({ findings }: { findings: ChartFinding[] }) {
  const needsScroll = findings.length > 3;

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <div
          className={cn(
            "scroll-panel-teal overflow-y-auto rounded-lg border border-border/50 bg-black/20 py-1 pl-2 pr-1",
            FINDINGS_SCROLL_MAX
          )}
        >
          <ul className="space-y-1.5 py-1 pr-0.5">
            {findings.map((f) => (
              <li
                key={f.id}
                className={cn(
                  "rounded-lg border px-2.5 py-1.5 text-sm leading-snug",
                  severityStyles(f.severity)
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <CircleDot className="h-4 w-4 shrink-0 opacity-80" />
                  <span className="font-medium">{f.label}</span>
                  <span className="rounded-md bg-black/25 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                    {severityLabel(f.severity)}
                  </span>
                </div>
                {f.note && (
                  <p className="mt-1 pl-5 text-[11px] leading-snug opacity-90">{f.note}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
        {needsScroll && (
          <div
            className="pointer-events-none absolute bottom-px left-px right-3 h-9 rounded-b-lg bg-linear-to-t from-background from-40% to-transparent"
            aria-hidden
          />
        )}
      </div>
      {needsScroll && (
        <p className="flex items-center gap-1.5 text-[11px] leading-tight text-teal-400/95">
          <ChevronDown className="size-3.5 shrink-0" aria-hidden />
          <span>
            Scroll to view all {findings.length} issues in this category
          </span>
        </p>
      )}
    </div>
  );
}

function HeroGrid({
  dragOver,
  file,
  inputRef,
  loading,
  onDrop,
  onPickFiles,
  onSplineLoad,
  openFilePicker,
  previewUrl,
  rightPanelRef,
  setDragOver,
}: {
  dragOver: boolean;
  file: File | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  loading: boolean;
  onDrop: (e: React.DragEvent) => void;
  onPickFiles: (list: FileList | null) => void;
  onSplineLoad: (app: Application) => void;
  openFilePicker: () => void;
  previewUrl: string | null;
  rightPanelRef: React.RefObject<HTMLDivElement | null>;
  setDragOver: (v: boolean) => void;
}) {
  return (
    <div className="relative z-10 grid min-h-full grid-cols-1 lg:grid-cols-2 lg:items-stretch">
      <div className="flex min-h-0 flex-col gap-8 bg-background/90 p-6 backdrop-blur-md sm:p-8">
        <div className="space-y-3 text-left">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Live Chart Validation
          </h1>
          <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Upload a patient visit chart image for a rapid documentation review against
            CMS-oriented completeness check: demographics, medical necessity, coding, and
            payer-ready provider details.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-left text-sm font-medium text-foreground">Upload Patient Chart</h2>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPickFiles(e.target.files)}
          />

          {previewUrl && file ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
              <div className="min-w-0 flex-1">
                <div className="overflow-hidden rounded-lg border border-border/60 bg-black/25">
                  <div className="relative aspect-4/3 w-full max-h-64 sm:max-h-72">
                    <Image
                      src={previewUrl}
                      alt={file.name}
                      fill
                      className="object-contain"
                      sizes="(max-width:640px) 100vw, 40vw"
                      unoptimized
                    />
                  </div>
                  <p className="truncate px-3 py-2 text-xs text-muted-foreground">{file.name}</p>
                </div>
              </div>
              <div className="flex w-full shrink-0 flex-col justify-center gap-2 sm:w-52">
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openFilePicker();
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={openFilePicker}
                  className={cn(
                    "flex min-h-[132px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-3 py-4 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50",
                    dragOver
                      ? "border-teal-400/70 bg-teal-500/10"
                      : "border-muted-foreground/35 bg-muted/25 hover:border-teal-500/45 hover:bg-muted/35"
                  )}
                >
                  {loading ? (
                    <Loader2 className="h-7 w-7 animate-spin text-teal-400" />
                  ) : (
                    <UploadCloud className="h-7 w-7 text-teal-400/90" />
                  )}
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {loading ? "Replacing…" : "Replace Chart"}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      Drop or Click — PNG, JPG, HEIC
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  disabled={loading}
                  onClick={(e) => {
                    e.stopPropagation();
                    openFilePicker();
                  }}
                >
                  Choose Different File
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openFilePicker();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={openFilePicker}
              >
                <div
                  className={cn(
                    "flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50",
                    dragOver
                      ? "border-teal-400/70 bg-teal-500/10"
                      : "border-muted-foreground/30 bg-muted/30 hover:border-teal-500/50 hover:bg-muted/40"
                  )}
                >
                  {loading ? (
                    <Loader2 className="h-10 w-10 animate-spin text-teal-400" />
                  ) : (
                    <UploadCloud className="h-10 w-10 text-teal-400/90" />
                  )}
                  <div>
                    <p className="text-base font-medium text-foreground">
                      {loading ? "Reviewing chart…" : "Drag & Drop or Click to Upload"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      PNG, JPG, or HEIC images of the chart
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={loading}
                  onClick={(e) => {
                    e.stopPropagation();
                    openFilePicker();
                  }}
                >
                  Choose file
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <div
        ref={rightPanelRef}
        className="relative min-h-[280px] bg-background/90 backdrop-blur-md lg:min-h-full"
      >
        <div className="absolute inset-0 z-0">
          <SplineScene
            scene={DEFAULT_SPLINE_SCENE}
            className="h-full w-full"
            onLoad={onSplineLoad}
          />
        </div>
        <Spotlight
          className="pointer-events-none -top-36 left-0 z-1 md:-top-16 md:left-1/4"
          fill="rgb(45 212 191)"
        />
      </div>
    </div>
  );
}

export function ChartValidationWorkspace() {
  const inputRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const splineAppRef = useRef<Application | null>(null);
  const rafRef = useRef<number | null>(null);

  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ChartAnalysisReport | null>(null);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const onSplineLoad = useCallback((app: Application) => {
    splineAppRef.current = app;
    configureSplinePointerBridge(app);
  }, []);

  const updatePointerFromClient = useCallback((clientX: number, clientY: number) => {
    const app = splineAppRef.current;
    const right = rightPanelRef.current;
    if (!app || !right) return;
    const rect = right.getBoundingClientRect();
    let nx = (clientX - rect.left) / rect.width;
    let ny = (clientY - rect.top) / rect.height;
    nx = Math.min(1, Math.max(0, nx));
    ny = Math.min(1, Math.max(0, ny));
    forwardPointerToSpline(app, nx, ny);
  }, []);

  const onHeroPointerMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        updatePointerFromClient(e.clientX, e.clientY);
      });
    },
    [updatePointerFromClient]
  );

  const onHeroTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const t = e.touches[0];
      if (!t) return;
      updatePointerFromClient(t.clientX, t.clientY);
    },
    [updatePointerFromClient]
  );

  const runAnalysis = useCallback(async (next: File) => {
    setLoading(true);
    try {
      const result = await analyzeUploadedChart(next);
      setReport(result);
    } finally {
      setLoading(false);
    }
  }, []);

  const onPickFiles = (list: FileList | null) => {
    const next = list?.[0];
    if (!next || !next.type.startsWith("image/")) return;
    setFile(next);
    void runAnalysis(next);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    onPickFiles(e.dataTransfer.files);
  };

  const openFilePicker = () => inputRef.current?.click();

  return (
    <div className="flex w-full flex-col gap-10 pb-16">
      {/* Screen 1: fixed height — scroll inside if upload preview + copy overflow */}
      <Card
        className={cn(
          "flex w-full flex-col overflow-hidden border-teal-500/15 bg-card/70 ring-1 ring-teal-500/10",
          VIEWPORT_PANEL
        )}
      >
        <div
          ref={heroRef}
          className="scroll-panel-teal relative min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1"
          onMouseMove={onHeroPointerMove}
          onTouchMove={onHeroTouchMove}
        >
          <CursorSpotlight trackingRef={heroRef} size={110} />
          <HeroGrid
            dragOver={dragOver}
            file={file}
            inputRef={inputRef}
            loading={loading}
            onDrop={onDrop}
            onPickFiles={onPickFiles}
            onSplineLoad={onSplineLoad}
            openFilePicker={openFilePicker}
            previewUrl={previewUrl}
            rightPanelRef={rightPanelRef}
            setDragOver={setDragOver}
          />
        </div>
      </Card>

      {/* Screen 2: separate card below — scroll page to reach; panel scrolls inside */}
      {report && (
        <Card
          className={cn(
            "flex w-full flex-col overflow-hidden border-teal-500/15 bg-card/70 ring-1 ring-teal-500/10",
            VIEWPORT_PANEL
          )}
        >
          <CardHeader className="shrink-0 space-y-1 border-b border-border/40 px-4 pb-3 pt-4 sm:px-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
              <div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <CardDescription className="text-sm">{report.subtitle}</CardDescription>
              </div>
            </div>
            <p className="pl-7 text-[11px] text-muted-foreground">
              Scroll this panel for all categories. Where a category has more than three
              issues, scroll that list to view the rest.
            </p>
          </CardHeader>
          <CardContent className="scroll-panel-teal min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-4 sm:px-6">
            <div className="space-y-5 pr-0.5">
              {report.sections.map((section) => (
                <section key={section.id} className="space-y-2">
                  <div>
                    <h3 className="text-sm font-semibold tracking-wide text-teal-300/90 uppercase">
                      {section.title}
                    </h3>
                    {section.description && (
                      <p className="text-xs text-muted-foreground">{section.description}</p>
                    )}
                  </div>
                  <SectionFindingsList findings={section.findings} />
                </section>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
