import { TanStackDevtools } from '@tanstack/react-devtools'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import StoreDevtools from '../lib/demo-store-devtools'
import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { AppSidebar } from "@/components/nav/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@radix-ui/react-select"

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  ssr: false,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'ICE RRT',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
    styles: [
      { dangerouslySetInnerHTML: { __html: `body { background: black; }` } }
    ]
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <style>{`body { background: black; }`}</style>
      </head>
      <body>
        {typeof window !== 'undefined' && typeof window.localStorage !== 'undefined' ? (
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <SidebarProvider
              style={
                {
                  "--sidebar-width": "19rem",
                } as React.CSSProperties
              }
            >
              <AppSidebar className="bg-background" />
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator
                    className="mr-2 data-[orientation=vertical]:h-4"
                  />
                  <div className="grow flex">
                    <div className="logo mx-auto">
                      <img src="/logo512.png" alt="ICE RRT" className="h-11 w-11" />
                    </div>
                  </div>
                  <ModeToggle />
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                  <Outlet />
                </div>
              </SidebarInset>
            </SidebarProvider>
          </ThemeProvider>
        ) : null}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
            StoreDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html >
  )
}
