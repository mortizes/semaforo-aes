import { SemaforoTable } from "@/components/semaforo";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 via-yellow-500 to-red-500 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="white"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Semáforo de AEs
              </h1>
              <p className="text-gray-600">
                Gestión de ocupación del equipo de ventas
              </p>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <SemaforoTable />

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            Los cambios se sincronizan en tiempo real.
            <span className="inline-flex items-center gap-1 ml-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Conectado
            </span>
          </p>
        </footer>
      </div>
    </main>
  );
}
