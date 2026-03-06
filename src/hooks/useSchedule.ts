import { useState, useEffect } from "react";
import { Nurse, ScheduleState, DaySchedule } from "@/types";
import { getDaysInMonth, format, setDate } from "date-fns";

export function useSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [assignments, setAssignments] = useState<Record<string, DaySchedule>>(
    {},
  );

  // Helper to get assignment for a specific date, creating it if missing
  const getAssignment = (dateStr: string): DaySchedule => {
    return (
      assignments[dateStr] || {
        date: dateStr,
        diurno: { nurseId: null },
        noturno: { nurseId: null },
      }
    );
  };

  const updateAssignment = (
    dateStr: string,
    type: "diurno" | "noturno",
    nurseId: string | null,
    isFolga: boolean = false,
  ) => {
    setAssignments((prev) => {
      const current = prev[dateStr] || {
        date: dateStr,
        diurno: { nurseId: null },
        noturno: { nurseId: null },
      };

      const newAssignments = {
        ...prev,
        [dateStr]: {
          ...current,
          [type]: { nurseId, isFolga },
        },
      };

      // Auto-fill logic for "Even/Odd" days if a standard nurse is selected
      // "ao colocar o diurno em um dia par, ele vai ser automaticamente colocado em todos os dias pares"
      if (nurseId && !isFolga) {
        const day = parseInt(dateStr.split("-")[2]);
        const isEven = day % 2 === 0;
        const daysInMonth = getDaysInMonth(new Date(dateStr));

        // Iterate through the month and apply to same parity days
        // ONLY if those days are currently empty or belong to the same nurse (to allow overwrites but prevent accidental wipes)
        // For simplicity based on request, we force overwrite to match the "automaticamente colocado" requirement
        for (let i = 1; i <= daysInMonth; i++) {
          if ((i % 2 === 0) === isEven) {
            const targetDate = new Date(dateStr);
            targetDate.setDate(i);
            const targetDateStr = format(targetDate, "yyyy-MM-dd");

            // Don't overwrite the specific day we just clicked if we are iterating (though logic handles it)
            // We need to preserve existing "Folga" states if we want to be smart,
            // but the prompt implies a strong pattern application.
            // Let's apply the nurse, but keep "isFolga" false for the others unless manually set?
            // Actually, let's just set the nurse.

            const targetCurrent = newAssignments[targetDateStr] || {
              date: targetDateStr,
              diurno: { nurseId: null },
              noturno: { nurseId: null },
            };

            newAssignments[targetDateStr] = {
              ...targetCurrent,
              [type]: {
                ...targetCurrent[type],
                nurseId: nurseId,
                isFolga: false,
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
    setNurses([...nurses, newNurse]);
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
        diurno: { nurseId: null },
        noturno: { nurseId: null },
      };

      newAssignments[dateStr] = {
        ...current,
        diurno: {
          nurseId: isEven ? diurnoParId : diurnoImparId,
          isFolga: false,
        },
        noturno: {
          nurseId: isEven ? noturnoParId : noturnoImparId,
          isFolga: false,
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
    getAssignment,
    generateMonthSchedule,
  };
}
