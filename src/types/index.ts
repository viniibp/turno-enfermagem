export type ShiftType = "diurno" | "noturno";

export interface Nurse {
  id: string;
  name: string;
  role: "padrao" | "folguista";
  color?: string;
}

export interface ShiftAssignment {
  nurseId: string | null;
  isFolga?: boolean; // If true, the standard nurse is off, and folguista takes over
  folguistaId?: string | null;
}

export interface DaySchedule {
  date: string; // ISO date string YYYY-MM-DD
  diurno: ShiftAssignment;
  noturno: ShiftAssignment;
}

export interface ScheduleState {
  month: number; // 0-11
  year: number;
  nurses: Nurse[];
  assignments: Record<string, DaySchedule>; // Key is date string
}
