import { cacheLife } from "next/cache";
import { getRoastSchedule } from "@/lib/schedule";
import { ScheduleProvider } from "@/components/schedule-context";
import { Hero } from "@/components/Hero";
import { Week } from "@/components/Week";
import { Coffees } from "@/components/Coffees";
import { Subscription } from "@/components/Subscription";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { RevealObserver } from "@/components/RevealObserver";
import { StickyCta } from "@/components/StickyCta";

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
      {/* «Занавес»: на широком экране страница уезжает вверх и открывает подвал под собой */}
      <div className="sheet">
        <Hero />
        <main>
          <Week />
          <Coffees />
          <Subscription />
          <About />
          <Contact />
        </main>
      </div>
      <Footer />
      <StickyCta />
      <RevealObserver />
    </ScheduleProvider>
  );
}
