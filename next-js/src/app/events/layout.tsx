import Nav from "../nav";


export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-full pb-10 min-h-screen">
            <Nav />
            <div className="mx-6">
                {children}
            </div>
        </div>
    );
}