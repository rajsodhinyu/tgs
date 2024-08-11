import Nav from "../nav"
export default function AboutLayout({children,}: {children: React.ReactNode}) {
    return (<div>
        

      <body>
      <div className="w-full h-screen place-content-center p-9 bg-gradient-to-r from-pink-500 to-purple-500">
        <Nav />
        <main>{children}</main>
        </div>
      </body>
      </div>
)
  }

