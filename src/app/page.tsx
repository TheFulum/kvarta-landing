import { cacheLife } from "next/cache";
import { getRoastSchedule } from "@/lib/schedule";
import { ScheduleProvider } from "@/components/schedule-context";
import { Hero } from "@/components/Hero";
import { Week } from "@/components/Week";
import { Coffees } from "@/components/Coffees";
import { Credits } from "@/components/Credits";
import { RevealObserver } from "@/components/RevealObserver";

// Расписание попадает в статическую оболочку и обновляется раз в час;
// точную дату по часам посетителя досчитывает ScheduleProvider.
async function getInitialSchedule() {
  "use cache";
  cacheLife("hours");
  return getRoastSchedule();
}

export default async function Home() {
  const initial = await getInitialSchedule();

  return (
    <ScheduleProvider initial={initial}>
      <Hero />
      <main>
        <Week />
        <Coffees />
      </main>
      <Credits />
      <RevealObserver />
    </ScheduleProvider>
  );
}
