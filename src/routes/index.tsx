import { createFileRoute } from '@tanstack/react-router'
import { Search } from "lucide-react"

import { ThemeProvider } from "@/components/theme-provider"
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { RippleButton } from '@/components/ui/shadcn-io/ripple-button'

export const Route = createFileRoute('/')({ ssr: false, component: App })

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <header className="flex h-20 items-center gap-4 px-4 justify-center bg-card">
        <div className="logo">
          <img src="/logo512.png" alt="ICE RRT" className="h-11 w-11" />
        </div>
        <InputGroup className="max-w-64">
          <InputGroupInput placeholder="Search by state..." autoFocus />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
      </header>

      <h2 className="text-xl font-medium text-center py-6">Find the right Rapid Response Team</h2>

      <div className="flex flex-wrap items-center gap-4 px-4 pb-8 justify-center max-w-3xl mx-auto">
        <SampleCard />
        <SampleCard extra />
        <SampleCard />
        <SampleCard />
        <SampleCard />
        <SampleCard />
      </div>
    </ThemeProvider>
  )
}

function SampleCard({ extra }: { extra?: boolean } = { extra: false }) {
  return (<Card className="w-full max-w-40">
    <CardHeader className="px-4">
      <CardTitle className="h-8">National Care Network</CardTitle>
      <CardDescription className="h-15 line-clamp-3">
        Providing nationwide support and rapid assistance for communities across the country.
        {extra && " We are committed to delivering goodly swift and effective aid to those in need, ensuring that help is just a call away."}
      </CardDescription>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">National</Badge>
      </div>
    </CardHeader>

    <CardFooter className="flex-col gap-2 px-4">
      <RippleButton type="submit" className="w-full" onClick={() => window.open('https://google.com', '_blank')}>
        Contact
      </RippleButton>
    </CardFooter>
  </Card>);
}
