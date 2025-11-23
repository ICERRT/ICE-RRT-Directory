import { createFileRoute } from '@tanstack/react-router'
import { Search } from "lucide-react"

import { ThemeProvider } from "@/components/theme-provider"
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { RippleButton } from '@/components/ui/shadcn-io/ripple-button'
import { useEffect, useState } from 'react'
import { fetchCsv, RrtGroup } from '@/csv'

export const Route = createFileRoute('/')({ ssr: false, component: App })

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [teams, setTeams] = useState<RrtGroup[]>([]);

  // Filter teams based on search term.
  const filteredTeams = searchTerm ? teams.filter(team =>
    [team.name, team.stateTerrUs, team.regionNote].join(' ').toLowerCase().includes(searchTerm.trim().toLowerCase())
  ) : teams;

  useEffect(() => {
    (async () => {
      // Fetch teams.
      const teams = await fetchCsv()
      setTeams(teams)
    })()
  }, [])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <header className="flex h-20 items-center gap-4 px-4 justify-center bg-card">
        <div className="logo">
          <img src="/logo512.png" alt="ICE RRT" className="h-11 w-11" />
        </div>
        <InputGroup className="max-w-64">
          <InputGroupInput placeholder="Search by state..." autoFocus onInput={(e) => {
            setSearchTerm((e.target as HTMLInputElement).value.toLowerCase())
          }} />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
      </header>

      <h2 className="text-xl font-medium text-center py-6">Find the right Rapid Response Team</h2>

      <div className="flex flex-wrap items-center justify-center gap-4 px-4 pb-8 max-w-4xl mx-auto">
        {teams.length === 0 && (
          <p className="text-center text-muted-foreground">Loading teams...</p>
        )}

        {teams.length > 0 && filteredTeams.length === 0 && (
          <p className="text-center text-muted-foreground">No teams matched the search term: "{searchTerm}".</p>
        )}

        {filteredTeams.map((team) => (
          <Card className="w-full max-w-sm" key={team.name}>
            <CardHeader className="px-4">
              <CardTitle className="h-8">{team.name}</CardTitle>
              <CardDescription>
                {team.comment}
                <br />
                <br />

                Services: {team.type.split(';').join(', ')}
              </CardDescription>
            </CardHeader>

            <CardFooter className="flex-row px-4 justify-between">
              <div className="flex flex-row gap-1">
                <Badge variant="secondary">{team.regionNote}, {team.stateTerrUs}</Badge>
              </div>

              <RippleButton type="submit" className="" onClick={() => window.open(team.web, '_blank')}>
                Contact
              </RippleButton>
            </CardFooter>
          </Card>
        ))}
      </div>
    </ThemeProvider>
  )
}
