import Nav from "../nav";


export default function Layout({ children }: { children: React.ReactNode }) {
    return (<div className="mb-10">
        <Nav />
        {children}
    </div>
    );
}