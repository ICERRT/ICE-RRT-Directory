import { ThemeProvider } from "@/components/theme-provider"
import { DataTable } from "@/components/ui/data-table"
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ ssr: false, component: App })

function App() {
  if (typeof window !== 'undefined' && window.localStorage) {

    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          Hi...
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <DataTable />
        </div>
      </ThemeProvider>
    )
  }
}
