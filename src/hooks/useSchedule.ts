import { useState, useEffect } from "react";
import { Nurse, DaySchedule, ShiftAssignment } from "@/types";
import { getDaysInMonth, format, parse } from "date-fns";

const NURSES_STORAGE_KEY = "turno-enfermagem:nurses";
const ASSIGNMENTS_STORAGE_KEY = "turno-enfermagem:assignments";
const CURRENT_DATE_STORAGE_KEY = "turno-enfermagem:current-date";

const normalizeShiftAssignment = (shift: unknown): ShiftAssignment => {
  if (!shift || typeof shift !== "object") {
    return { nurseId: null, isFolga: false, folguistaId: null };
  }

  const parsed = shift as Partial<ShiftAssignment>;
  return {
    nurseId: typeof parsed.nurseId === "string" ? parsed.nurseId : null,
    isFolga: parsed.isFolga === true,
    folguistaId: typeof parsed.folguistaId === "string" ? parsed.folguistaId : null,
  };
};

const normalizeDaySchedule = (
  dateStr: string,
  schedule: unknown,
): DaySchedule | null => {
  if (!schedule || typeof schedule !== "object") return null;

  const parsed = schedule as Partial<DaySchedule>;
  return {
    date: typeof parsed.date === "string" ? parsed.date : dateStr,
    diurno: normalizeShiftAssignment(parsed.diurno),
    noturno: normalizeShiftAssignment(parsed.noturno),
  };
};

export function useSchedule() {
  const [currentDate, setCurrentDate] = useState(() => {
    if (typeof window === "undefined") return new Date();

    try {
      const stored = window.localStorage.getItem(CURRENT_DATE_STORAGE_KEY);
      if (!stored) return new Date();

      const parsed = new Date(stored);
      return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    } catch {
      return new Date();
    }
  });
  const [nurses, setNurses] = useState<Nurse[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const stored = window.localStorage.getItem(NURSES_STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];

      return parsed.filter(
        (n): n is Nurse =>
          typeof n?.id === "string" &&
          typeof n?.name === "string" &&
          (n?.role === "padrao" || n?.role === "folguista") &&
          typeof n?.color === "string",
      );
    } catch {
      return [];
    }
  });
  const [assignments, setAssignments] = useState<Record<string, DaySchedule>>(
    () => {
      if (typeof window === "undefined") return {};

      try {
        const stored = window.localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
        if (!stored) return {};

        const parsed = JSON.parse(stored);
        if (!parsed || typeof parsed !== "object") return {};

        const normalized: Record<string, DaySchedule> = {};
        for (const [dateStr, schedule] of Object.entries(parsed)) {
          const daySchedule = normalizeDaySchedule(dateStr, schedule);
          if (daySchedule) {
            normalized[dateStr] = daySchedule;
          }
        }

        return normalized;
      } catch {
        return {};
      }
    },
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(NURSES_STORAGE_KEY, JSON.stringify(nurses));
    } catch {
      // Ignore persistence errors (private mode or quota issues)
    }
  }, [nurses]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        ASSIGNMENTS_STORAGE_KEY,
        JSON.stringify(assignments),
      );
    } catch {
      // Ignore persistence errors (private mode or quota issues)
    }
  }, [assignments]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CURRENT_DATE_STORAGE_KEY,
        currentDate.toISOString(),
      );
    } catch {
      // Ignore persistence errors (private mode or quota issues)
    }
  }, [currentDate]);

  // Helper to get assignment for a specific date, creating it if missing
  const getAssignment = (dateStr: string): DaySchedule => {
    return (
      assignments[dateStr] || {
        date: dateStr,
        diurno: { nurseId: null, folguistaId: null },
        noturno: { nurseId: null, folguistaId: null },
      }
    );
  };

  const updateAssignment = (
    dateStr: string,
    type: "diurno" | "noturno",
    nurseId: string | null,
    isFolga: boolean = false,
    folguistaId: string | null = null,
  ) => {
    setAssignments((prev) => {
      const current = prev[dateStr] || {
        date: dateStr,
        diurno: { nurseId: null, folguistaId: null },
        noturno: { nurseId: null, folguistaId: null },
      };

      const newAssignments = {
        ...prev,
        [dateStr]: {
          ...current,
          [type]: {
            ...current[type],
            nurseId,
            isFolga,
            folguistaId: isFolga ? folguistaId : null,
          },
        },
      };

      // Auto-fill logic for "Even/Odd" days if a standard nurse is selected
      // "ao colocar o diurno em um dia par, ele vai ser automaticamente colocado em todos os dias pares"
      if (nurseId && !isFolga) {
        const parsedDate = parse(dateStr, "yyyy-MM-dd", new Date());
        const day = parsedDate.getDate();
        const isEven = day % 2 === 0;
        const daysInMonth = getDaysInMonth(parsedDate);

        // Iterate through the month and apply to same parity days
        // ONLY if those days are currently empty or belong to the same nurse (to allow overwrites but prevent accidental wipes)
        // For simplicity based on request, we force overwrite to match the "automaticamente colocado" requirement
        for (let i = 1; i <= daysInMonth; i++) {
          if ((i % 2 === 0) === isEven) {
            const targetDate = new Date(parsedDate);
            targetDate.setDate(i);
            const targetDateStr = format(targetDate, "yyyy-MM-dd");

            // Don't overwrite the specific day we just clicked if we are iterating (though logic handles it)
            // We need to preserve existing "Folga" states if we want to be smart,
            // but the prompt implies a strong pattern application.
            // Let's apply the nurse, but keep "isFolga" false for the others unless manually set?
            // Actually, let's just set the nurse.

            const targetCurrent = newAssignments[targetDateStr] || {
              date: targetDateStr,
              diurno: { nurseId: null, folguistaId: null },
              noturno: { nurseId: null, folguistaId: null },
            };

            newAssignments[targetDateStr] = {
              ...targetCurrent,
              [type]: {
                ...targetCurrent[type],
                nurseId: nurseId,
                isFolga: false,
                folguistaId: null,
              }, // Reset folga when applying pattern
            };
          }
        }
      }

      return newAssignments;
    });
  };

  const addNurse = (
    name: string,
    role: "padrao" | "folguista",
    color: string,
  ) => {
    const newNurse: Nurse = {
      id: crypto.randomUUID(),
      name,
      role,
      color: color,
    };
    setNurses((prev) => [...prev, newNurse]);
  };

  const removeNurse = (nurseId: string) => {
    setNurses((prev) => prev.filter((n) => n.id !== nurseId));
    setAssignments((prev) => {
      const updated: Record<string, DaySchedule> = {};

      for (const [dateStr, schedule] of Object.entries(prev)) {
        const diurno =
          schedule.diurno.nurseId === nurseId
            ? { nurseId: null, isFolga: false, folguistaId: null }
            : schedule.diurno.folguistaId === nurseId
              ? { ...schedule.diurno, folguistaId: null }
              : schedule.diurno;
        const noturno =
          schedule.noturno.nurseId === nurseId
            ? { nurseId: null, isFolga: false, folguistaId: null }
            : schedule.noturno.folguistaId === nurseId
              ? { ...schedule.noturno, folguistaId: null }
              : schedule.noturno;

        updated[dateStr] = {
          ...schedule,
          diurno,
          noturno,
        };
      }

      return updated;
    });
  };

  const generateMonthSchedule = (
    diurnoParId: string | null,
    diurnoImparId: string | null,
    noturnoParId: string | null,
    noturnoImparId: string | null,
  ) => {
    const daysInMonth = getDaysInMonth(currentDate);
    const newAssignments = { ...assignments };

    for (let i = 1; i <= daysInMonth; i++) {
      const targetDate = new Date(currentDate);
      targetDate.setDate(i);
      const dateStr = format(targetDate, "yyyy-MM-dd");
      const isEven = i % 2 === 0;

      const current = newAssignments[dateStr] || {
        date: dateStr,
        diurno: { nurseId: null, folguistaId: null },
        noturno: { nurseId: null, folguistaId: null },
      };

      newAssignments[dateStr] = {
        ...current,
        diurno: {
          nurseId: isEven ? diurnoParId : diurnoImparId,
          isFolga: false,
          folguistaId: null,
        },
        noturno: {
          nurseId: isEven ? noturnoParId : noturnoImparId,
          isFolga: false,
          folguistaId: null,
        },
      };
    }

    setAssignments(newAssignments);
  };

  return {
    currentDate,
    setCurrentDate,
    nurses,
    assignments,
    updateAssignment,
    addNurse,
    removeNurse,
    getAssignment,
    generateMonthSchedule,
  };
}
