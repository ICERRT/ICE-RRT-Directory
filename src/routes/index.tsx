import { AppSidebar } from "@/components/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@radix-ui/react-separator"
import { createFileRoute } from '@tanstack/react-router'
import { ColumnDef } from "@tanstack/react-table"

export type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}

export const payments: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "example@gmail.com",
  },
]
 
export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "status",
    header:  ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
  },
  {
    accessorKey: "email",
    header:  ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "amount",
    header:  ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
  },
]

export const Route = createFileRoute('/')({ component: App })

function App() {
  if (typeof window !== 'undefined' && window.localStorage) {

    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <SidebarProvider
          style={
            {
              "--sidebar-width": "19rem",
            } as React.CSSProperties
          }
        >
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <div className="grow" />
              <ModeToggle />
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <DataTable />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ThemeProvider>
    )
  }
}
