import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { useSchedule } from "@/hooks/useSchedule";
import { Sidebar } from "@/components/Sidebar";
import { DayModal } from "@/components/DayModal";
import { AutoScheduleModal } from "@/components/AutoScheduleModal";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DaySchedule } from "@/types";

export function App() {
  const {
    currentDate,
    setCurrentDate,
    nurses,
    assignments,
    updateAssignment,
    getAssignment,
    addNurse,
    removeNurse,
    generateMonthSchedule,
  } = useSchedule();
  const [selectedDay, setSelectedDay] = useState<DaySchedule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoScheduleOpen, setIsAutoScheduleOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCaptureOptionsOpen, setIsCaptureOptionsOpen] = useState(false);
  const calendarCaptureRef = useRef<HTMLDivElement | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const schedule = getAssignment(dateStr);
    setSelectedDay(schedule);
    setIsModalOpen(true);
    setIsSidebarOpen(false);
  };

  const handleSaveModal = (
    type: "diurno" | "noturno",
    nurseId: string | null,
    isFolga: boolean,
    folguistaId: string | null,
  ) => {
    if (selectedDay) {
      updateAssignment(
        selectedDay.date,
        type,
        nurseId,
        isFolga,
        folguistaId,
        "single",
      );
    }
  };

  const getNurse = (id: string | null) => {
    if (!id) return null;
    return nurses.find((n) => n.id === id);
  };

  const defaultFolguista = nurses.find((n) => n.role === "folguista");

  const getNurseStyle = (colorClass: string) => {
    const colorMap: Record<string, string> = {
      "bg-emerald-600": "text-emerald-50 bg-emerald-500/40 ring-1 ring-emerald-200/35",
      "bg-blue-600": "text-blue-50 bg-blue-500/40 ring-1 ring-blue-200/35",
      "bg-amber-600": "text-amber-50 bg-amber-500/40 ring-1 ring-amber-200/35",
      "bg-purple-600": "text-purple-50 bg-purple-500/40 ring-1 ring-purple-200/35",
      "bg-rose-600": "text-rose-50 bg-rose-500/40 ring-1 ring-rose-200/35",
      "bg-cyan-600": "text-cyan-50 bg-cyan-500/40 ring-1 ring-cyan-200/35",
      "bg-pink-600": "text-pink-50 bg-pink-500/40 ring-1 ring-pink-200/35",
      "bg-indigo-600": "text-indigo-50 bg-indigo-500/40 ring-1 ring-indigo-200/35",
    };
    return colorMap[colorClass] || "text-slate-50 bg-slate-500/40 ring-1 ring-slate-200/30";
  };

  const captureCalendarCanvas = async () => {
    if (!calendarCaptureRef.current || isCapturing) return;

    setIsCapturing(true);
    const source = calendarCaptureRef.current;
    const exportWrapper = document.createElement("div");
    const exportClone = source.cloneNode(true) as HTMLDivElement;
    const exportWidth = Math.max(source.scrollWidth, source.offsetWidth);
    const exportHeight = Math.max(source.scrollHeight, source.offsetHeight);

    exportWrapper.style.position = "fixed";
    exportWrapper.style.left = "0";
    exportWrapper.style.top = "0";
    exportWrapper.style.padding = "0";
    exportWrapper.style.margin = "0";
    exportWrapper.style.background = "#020617";
    exportWrapper.style.overflow = "visible";
    exportWrapper.style.zIndex = "-1";

    exportClone.style.width = `${exportWidth}px`;
    exportClone.style.minWidth = `${exportWidth}px`;
    exportClone.style.height = `${exportHeight}px`;
    exportClone.style.overflow = "visible";

    exportWrapper.appendChild(exportClone);
    document.body.appendChild(exportWrapper);

    try {
      return await html2canvas(exportClone, {
        backgroundColor: "#020617",
        scale: Math.min(window.devicePixelRatio || 1, 2),
        useCORS: true,
        logging: false,
        foreignObjectRendering: true,
        width: exportWidth,
        height: exportHeight,
        windowWidth: exportWidth,
        windowHeight: exportHeight,
        scrollX: 0,
        scrollY: 0,
      });
    } finally {
      document.body.removeChild(exportWrapper);
      setIsCapturing(false);
    }
  };

  const handleDownloadCalendarImage = async () => {
    const canvas = await captureCalendarCanvas();
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = dataUrl;
    downloadLink.download = `escala-${format(currentDate, "yyyy-MM")}.png`;
    downloadLink.click();
  };

  const handleShareCalendarImage = async () => {
    const canvas = await captureCalendarCanvas();
    if (!canvas) return;

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((result) => resolve(result), "image/png"),
    );
    if (!blob) return;

    const fileName = `escala-${format(currentDate, "yyyy-MM")}.png`;
    const file = new File([blob], fileName, { type: "image/png" });

    if (
      navigator.share &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        title: "Escala de Enfermagem",
        text: `Escala ${format(currentDate, "MMMM yyyy", { locale: ptBR })}`,
        files: [file],
      });
      return;
    }

    if (navigator.clipboard && "ClipboardItem" in window) {
      try {
        const clipboardItem = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([clipboardItem]);
        window.alert("Imagem copiada. Agora voce pode colar onde quiser.");
        return;
      } catch {
        // fall through to download
      }
    }

    const dataUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = dataUrl;
    downloadLink.download = fileName;
    downloadLink.click();
  };

  const handleCaptureAction = async (mode: "share" | "download") => {
    setIsCaptureOptionsOpen(false);
    try {
      if (mode === "share") {
        await handleShareCalendarImage();
        return;
      }
      await handleDownloadCalendarImage();
    } catch (error) {
      console.error("Falha ao exportar imagem da escala:", error);
      window.alert(
        "Nao foi possivel gerar a imagem agora. Tente novamente em alguns segundos.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen lg:h-screen">
        {isSidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Fechar menu lateral"
          />
        )}

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-[85vw] max-w-xs transform transition-transform duration-300 lg:static lg:z-auto lg:w-80 lg:max-w-none lg:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <Sidebar
            nurses={nurses}
            onAddNurse={addNurse}
            onRemoveNurse={removeNurse}
            onOpenAutoSchedule={() => {
              setIsAutoScheduleOpen(true);
              setIsSidebarOpen(false);
            }}
            onCloseMobile={() => setIsSidebarOpen(false)}
          />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col lg:h-full lg:overflow-hidden">
          <header className="border-b border-slate-800 bg-slate-900 px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-200 hover:bg-slate-700"
                  aria-label="Abrir menu lateral"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>

                <div className="min-w-0">
                  <h2 className="text-xl font-bold capitalize sm:text-2xl lg:text-3xl">
                    {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                  </h2>
                </div>
              </div>

              <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="p-2 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors"
                  aria-label="Mes anterior"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors sm:px-4"
                >
                  Hoje
                </button>
                <button
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="p-2 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors"
                  aria-label="Proximo mes"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3 sm:gap-4 sm:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-900/50 border border-blue-500/30" />
                  <span className="text-slate-200 font-medium">Dia Impar</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-900/50 border border-rose-500/30" />
                  <span className="text-slate-200 font-medium">Dia Par</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-900/50 border border-amber-500/30" />
                  <span className="text-slate-200 font-medium">Folga</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCaptureOptionsOpen(true)}
                  disabled={isCapturing}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCapturing ? "Gerando imagem..." : "Exportar imagem"}
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8">
            <div className="overflow-x-auto pb-2">
              <div
                ref={calendarCaptureRef}
                className="grid min-w-[760px] grid-cols-7 gap-px overflow-hidden rounded-2xl border border-slate-800 bg-slate-800 shadow-2xl"
              >
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                  <div
                    key={day}
                    className="bg-slate-900 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-200 sm:text-sm"
                  >
                    {day}
                  </div>
                ))}

                {calendarDays.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const schedule = assignments[dateStr];
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isEven = day.getDate() % 2 === 0;

                  const diurnoNurse = schedule?.diurno.isFolga
                    ? getNurse(
                        schedule?.diurno.folguistaId || defaultFolguista?.id || null,
                      )
                    : getNurse(schedule?.diurno.nurseId || null);

                  const noturnoNurse = schedule?.noturno.isFolga
                    ? getNurse(
                        schedule?.noturno.folguistaId ||
                          defaultFolguista?.id ||
                          null,
                      )
                    : getNurse(schedule?.noturno.nurseId || null);
                  const diurnoIsFolguista = schedule?.diurno.isFolga === true;
                  const noturnoIsFolguista = schedule?.noturno.isFolga === true;

                  const hasFolguista =
                    schedule?.diurno.isFolga || schedule?.noturno.isFolga;

                  return (
                    <button
                      key={day.toString()}
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        "min-h-[128px] p-2 transition-all cursor-pointer group relative border-t border-slate-800/50 flex flex-col gap-1 text-left sm:min-h-[136px]",
                        !isCurrentMonth
                          ? "bg-slate-950/80 opacity-40 grayscale"
                          : hasFolguista
                            ? "bg-amber-900/40 hover:bg-amber-900/50"
                            : isEven
                              ? "bg-rose-900/30 hover:bg-rose-900/40"
                              : "bg-blue-900/30 hover:bg-blue-900/40",
                        isToday(day) && "ring-1 ring-inset ring-white/30",
                      )}
                    >
                      <div className="mb-1 flex items-start justify-between">
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-xs font-semibold",
                            isToday(day)
                              ? "bg-white text-slate-900"
                              : "text-slate-200 group-hover:text-white",
                          )}
                        >
                          {format(day, "dd/MM")}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-col gap-2 px-1">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-3 h-3 text-yellow-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                            <span className="text-[10px] uppercase tracking-wider text-slate-200 font-semibold">
                              Diurno
                            </span>
                            {diurnoIsFolguista && (
                              <span className="inline-flex items-center rounded-full bg-amber-400/30 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-100 ring-1 ring-amber-300/50">
                                Folguista
                              </span>
                            )}
                          </div>
                          <div
                            className={cn(
                              "inline-flex w-fit max-w-full items-center gap-1 rounded px-1.5 py-0.5 text-xs font-bold",
                              diurnoNurse
                                ? cn("shadow-sm", getNurseStyle(diurnoNurse.color))
                                : "text-slate-300 italic pl-0",
                            )}
                          >
                            <span className="truncate">{diurnoNurse?.name || "---"}</span>
                            {diurnoIsFolguista && (
                              <span
                                title="Cobertura de folguista"
                                className="inline-flex h-5 w-5 items-center justify-center rounded bg-amber-300/35 text-amber-50 ring-1 ring-amber-200/60"
                              >
                                <svg
                                  className="h-3.5 w-3.5"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.33 0-6 2.67-6 6h12c0-3.33-2.67-6-6-6z" />
                                </svg>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-3 h-3 text-indigo-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                              />
                            </svg>
                            <span className="text-[10px] uppercase tracking-wider text-slate-200 font-semibold">
                              Noturno
                            </span>
                            {noturnoIsFolguista && (
                              <span className="inline-flex items-center rounded-full bg-amber-400/30 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-100 ring-1 ring-amber-300/50">
                                Folguista
                              </span>
                            )}
                          </div>
                          <div
                            className={cn(
                              "inline-flex w-fit max-w-full items-center gap-1 rounded px-1.5 py-0.5 text-xs font-bold",
                              noturnoNurse
                                ? cn("shadow-sm", getNurseStyle(noturnoNurse.color))
                                : "text-slate-300 italic pl-0",
                            )}
                          >
                            <span className="truncate">{noturnoNurse?.name || "---"}</span>
                            {noturnoIsFolguista && (
                              <span
                                title="Cobertura de folguista"
                                className="inline-flex h-5 w-5 items-center justify-center rounded bg-amber-300/35 text-amber-50 ring-1 ring-amber-200/60"
                              >
                                <svg
                                  className="h-3.5 w-3.5"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.33 0-6 2.67-6 6h12c0-3.33-2.67-6-6-6z" />
                                </svg>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>

      {selectedDay && (
        <DayModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          daySchedule={selectedDay}
          nurses={nurses}
          onSave={handleSaveModal}
        />
      )}

      <AutoScheduleModal
        isOpen={isAutoScheduleOpen}
        onClose={() => setIsAutoScheduleOpen(false)}
        nurses={nurses}
        onGenerate={generateMonthSchedule}
      />

      {isCaptureOptionsOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setIsCaptureOptionsOpen(false)}
            aria-label="Fechar opcoes de imagem"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-white">Exportar escala</h3>
            <p className="mt-1 text-xs text-slate-400">
              Deseja compartilhar agora ou baixar a imagem?
            </p>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => void handleCaptureAction("share")}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 hover:bg-slate-700"
              >
                Compartilhar
              </button>
              <button
                type="button"
                onClick={() => void handleCaptureAction("download")}
                className="rounded-lg border border-slate-700 bg-blue-600 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-blue-500"
              >
                Baixar imagem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
