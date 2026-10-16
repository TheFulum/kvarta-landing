"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getRoastSchedule, type RoastSchedule } from "@/lib/schedule";

const ScheduleContext = createContext<RoastSchedule | null>(null);

/**
 * Сервер отдаёт расписание, посчитанное при последней ревалидации (раз в час),
 * а в браузере пересчитываем по часам посетителя: вечером в среду партия меняется.
 */
export function ScheduleProvider({
  initial,
  children,
}: {
  initial: RoastSchedule;
  children: ReactNode;
}) {
  const [schedule, setSchedule] = useState(initial);

  useEffect(() => {
    const update = () => setSchedule(getRoastSchedule());
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return <ScheduleContext.Provider value={schedule}>{children}</ScheduleContext.Provider>;
}

export function useSchedule(): RoastSchedule {
  const value = useContext(ScheduleContext);
  if (!value) throw new Error("useSchedule вне ScheduleProvider");
  return value;
}
