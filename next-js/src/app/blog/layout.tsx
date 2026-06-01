import Nav from "../nav";
import Sidebar from "./sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate min-w-80 pb-10 min-h-screen">
      <Nav />
      <div className="w-full px-3 sm:flex-wrap md:flex-nowrap md:inline-flex md:flex-row md:justify-between xl:w-screen max-md:place-items-center">
        <div className="w-full">{children}</div>
        {/* min-h keeps a short post's sidebar reaching the window bottom without
            adding page scroll: nav (h-24 = 6rem) + layout pb-10 (2.5rem) = 8.5rem.
            On longer posts the content is taller, so this min has no effect. */}
        <div className="md:w-80 md:shrink-0 md:relative md:min-h-[calc(100vh-8.5rem)]">
          <div className="md:absolute md:inset-0 md:overflow-y-auto">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
