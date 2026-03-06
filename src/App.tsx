import { useState } from "react";
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
    generateMonthSchedule,
  } = useSchedule();
  const [selectedDay, setSelectedDay] = useState<DaySchedule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoScheduleOpen, setIsAutoScheduleOpen] = useState(false);

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
  };

  const handleSaveModal = (
    type: "diurno" | "noturno",
    nurseId: string | null,
    isFolga: boolean,
  ) => {
    if (selectedDay) {
      updateAssignment(selectedDay.date, type, nurseId, isFolga);
    }
  };

  const getNurse = (id: string | null) => {
    if (!id) return null;
    return nurses.find((n) => n.id === id);
  };

  const folguista = nurses.find((n) => n.role === "folguista");

  const getNurseStyle = (colorClass: string) => {
    const colorMap: Record<string, string> = {
      "bg-emerald-600": "text-emerald-200 bg-emerald-500/20",
      "bg-blue-600": "text-blue-200 bg-blue-500/20",
      "bg-amber-600": "text-amber-200 bg-amber-500/20",
      "bg-purple-600": "text-purple-200 bg-purple-500/20",
      "bg-rose-600": "text-rose-200 bg-rose-500/20",
      "bg-cyan-600": "text-cyan-200 bg-cyan-500/20",
      "bg-pink-600": "text-pink-200 bg-pink-500/20",
      "bg-indigo-600": "text-indigo-200 bg-indigo-500/20",
    };
    return colorMap[colorClass] || "text-slate-200 bg-slate-500/20";
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">
      <Sidebar
        nurses={nurses}
        onAddNurse={addNurse}
        onOpenAutoSchedule={() => setIsAutoScheduleOpen(true)}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-white capitalize">
              {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </h2>
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors"
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
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Hoje
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors"
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

          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-900/50 border border-blue-500/30"></div>
              <span className="text-slate-400">Dia Ímpar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-900/50 border border-rose-500/30"></div>
              <span className="text-slate-400">Dia Par</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-900/50 border border-amber-500/30"></div>
              <span className="text-slate-400">Folga</span>
            </div>
          </div>
        </header>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-7 gap-px bg-slate-800 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Weekday Headers */}
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div
                key={day}
                className="bg-slate-900 py-4 text-center text-sm font-semibold text-slate-500 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}

            {/* Days */}
            {calendarDays.map((day, dayIdx) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const schedule = assignments[dateStr];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isEven = day.getDate() % 2 === 0;

              // Resolve display nurses
              const diurnoNurse = schedule?.diurno.isFolga
                ? folguista
                : getNurse(schedule?.diurno.nurseId || null);

              const noturnoNurse = schedule?.noturno.isFolga
                ? folguista
                : getNurse(schedule?.noturno.nurseId || null);

              const hasFolguista =
                schedule?.diurno.isFolga || schedule?.noturno.isFolga;

              return (
                <div
                  key={day.toString()}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "min-h-30 p-2 transition-all cursor-pointer group relative border-t border-slate-800/50 flex flex-col gap-1",
                    !isCurrentMonth
                      ? "bg-slate-950/80 opacity-40 grayscale"
                      : hasFolguista
                        ? "bg-amber-900/30 hover:bg-amber-900/40"
                        : isEven
                          ? "bg-rose-900/20 hover:bg-rose-900/30"
                          : "bg-blue-900/20 hover:bg-blue-900/30",
                    isToday(day) && "ring-1 ring-inset ring-white/30",
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={cn(
                        "text-xs font-semibold px-1.5 py-0.5 rounded",
                        isToday(day)
                          ? "bg-white text-slate-900"
                          : "text-slate-400 group-hover:text-white",
                      )}
                    >
                      {format(day, "dd/MM")}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 px-1 mt-1">
                    {/* Diurno */}
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
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                          Diurno
                        </span>
                      </div>
                      <span
                        className={cn(
                          "font-bold text-xs px-1.5 py-0.5 rounded w-fit max-w-full truncate",
                          diurnoNurse
                            ? cn("shadow-sm", getNurseStyle(diurnoNurse.color))
                            : "text-slate-500 italic pl-0",
                        )}
                      >
                        {diurnoNurse?.name || "---"}
                      </span>
                    </div>

                    {/* Noturno */}
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
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                          Noturno
                        </span>
                      </div>
                      <span
                        className={cn(
                          "font-bold text-xs px-1.5 py-0.5 rounded w-fit max-w-full truncate",
                          noturnoNurse
                            ? cn("shadow-sm", getNurseStyle(noturnoNurse.color))
                            : "text-slate-500 italic pl-0",
                        )}
                      >
                        {noturnoNurse?.name || "---"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

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
    </div>
  );
}
