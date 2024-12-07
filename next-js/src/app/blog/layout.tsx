import Nav from "../nav";
import Sidebar from "./sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (<div>
        <Nav />
        <div className="px-3 sm:flex-wrap gap-2.5 md:flex-nowrap md:inline-flex md:flex-row md:justify-between xl:w-screen max-md:place-items-center "> 
  {/* Whole Site */}
    <div className="w-fit"> {/* Right Side, Carousel + */} 
      {children}
    </div>
    <div className="w-fit md:w-9/12 lg:w-8/12 xl:w-3/12 flex-col md:justify-center max-md:place-items-center rounded-xl"> {/* Left Side */}
    <Sidebar items={6}></Sidebar>
    </div>
  </div>
    </div>
    );
}