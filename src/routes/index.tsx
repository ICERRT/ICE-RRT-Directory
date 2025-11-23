import { createFileRoute } from '@tanstack/react-router'
import { Search } from "lucide-react"

import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { RippleButton } from '@/components/ui/shadcn-io/ripple-button'
import { Spinner } from '@/components/ui/spinner'
import { fetchCsv, RrtGroup } from '@/csv'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/')({ ssr: false, component: App })

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [teams, setTeams] = useState<RrtGroup[]>([]);

  // Filter teams based on search term.
  const filteredTeams = searchTerm ? teams.filter(team =>
    [team.name, team.stateTerrUs, team.regionNote].join(' ').toLowerCase().includes(searchTerm.toLowerCase())
  ) : teams;

  useEffect(() => {
    (async () => {
      // Fetch teams.
      const teams = await fetchCsv()
      setTeams(teams)
    })()
  }, [])

  return (
    <div className="fade-in">
      <header className="flex h-20 items-center gap-4 px-4 justify-center bg-card">
        <div className="logo">
          <img src="/logo512.png" alt="ICE RRT" className="h-11 w-11" />
        </div>
        <InputGroup className="max-w-64">
          <InputGroupInput placeholder="Search by state..." autoFocus onInput={(e) => {
            setSearchTerm((e.target as HTMLInputElement).value.trim())
          }} />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
      </header>

      <h2 className="text-xl font-medium text-center py-6">Find a Rapid Response Team</h2>

      <div className="flex flex-wrap items-center justify-center gap-4 px-4 pb-8 max-w-4xl mx-auto">
        {teams.length === 0 && (
          <Spinner className="size-8 opacity-48" />
        )}

        {teams.length > 0 && filteredTeams.length === 0 && (
          <p className="text-center text-muted-foreground">Sorry, no teams found for: "{searchTerm}"</p>
        )}

        {filteredTeams.map((team) => (
          <Card className="fade-in w-full max-w-sm" key={team.name}>
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
    </div>
  )
}
