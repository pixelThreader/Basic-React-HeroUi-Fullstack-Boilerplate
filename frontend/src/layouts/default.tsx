import { Navbar } from "@/components/navbar";
import { Link } from "react-router-dom";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-6 flex-grow pt-16">
        {children}
      </main>
      <footer className="w-full flex items-center justify-center py-3">
        <Link
          className="flex items-center gap-1 text-current"
          to="https://github.com/pixelThreader"
          title="pixelThreader GitHub"
        >
          <span className="text-default-600">Powered by</span>
          <p className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent font-semibold">pixelThreader</p>
        </Link>
      </footer>
    </div>
  );
}
