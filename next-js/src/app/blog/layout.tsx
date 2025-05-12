import Nav from "../nav";
import Sidebar from "./sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-w-80 mb-10">
      <Nav />
      <div className="w-full px-3 sm:flex-wrap md:flex-nowrap md:inline-flex md:flex-row md:justify-between xl:w-screen max-md:place-items-center">
        <div className="w-full">{children}</div>
        <div>
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
