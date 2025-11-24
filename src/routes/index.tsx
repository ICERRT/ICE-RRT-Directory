import { createFileRoute } from '@tanstack/react-router'
import { HeartPlus, Search } from "lucide-react"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Spinner } from '@/components/ui/spinner'
import { fetchCsv, RrtGroup } from '@/csv'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/')({ ssr: false, component: App })

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [teams, setTeams] = useState<RrtGroup[]>([]);

  // Separate national teams from local teams.
  const nationalTeams = [];
  const localTeams = [];
  for (const team of teams) {
    if (team.stateTerrUs === 'National') {
      nationalTeams.push(team);
    } else {
      // Filter local teams based on search term.
      if (searchTerm) {
        const teamText = [team.name, team.stateTerrUs, team.regionNote].join(' ').toLowerCase();
        if (!teamText.includes(searchTerm.toLowerCase())) {
          continue;
        }
      }
      localTeams.push(team);
    }
  }

  useEffect(() => {
    (async () => {
      // Fetch teams and geolocation in parallel.
      const teamsPromise = fetchCsv()
      const geolocationPromise = fetch('https://ipv4-check-perf.radar.cloudflare.com/api/info').then(res => res.json()).catch(() => undefined)
      const [teams, geolocation] = await Promise.all([teamsPromise, geolocationPromise])

      // If geolocation is available, sort teams by proximity.
      if (geolocation?.country === 'US') {
        const city = geolocation.city.toLowerCase();
        const state = geolocation.region.toLowerCase();
        teams.sort((a, b) => {
          // State matches are weighted less heavily than city matches.
          const stateMatchA = a.stateTerrUs.toLowerCase().includes(state) ? 1 : 0;
          const stateMatchB = b.stateTerrUs.toLowerCase().includes(state) ? 1 : 0;

          // City matches are weighted more heavily than state matches.
          const cityMatchA = a.regionNote.toLowerCase().includes(city) ? 2 : 0;
          const cityMatchB = b.regionNote.toLowerCase().includes(city) ? 2 : 0;

          // Sort by total match score (state + city).
          return (stateMatchB + cityMatchB) - (stateMatchA + cityMatchA);
        });
      }

      setTeams(teams)
    })()
  }, [])

  return (
    <div className="fade-in">
      <header className="flex h-20 items-center gap-4 px-4 justify-center sticky top-0 shadow-lg border-b">
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

      {teams.length === 0 && (
        <Spinner className="size-8 opacity-48" />
      )}

      {teams.length > 0 && localTeams.length === 0 && (
        <p className="text-center text-muted-foreground pb-8">
          Sorry, no local teams matched "{searchTerm}". &nbsp;
          <a target="_blank" href="https://submissions.icerrt.com/">
            <HeartPlus className="inline" /> Suggest a team
          </a>
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-4 px-4 pb-8 max-w-4xl mx-auto">
        {localTeams.concat(nationalTeams).map((team) => (
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
                <Badge variant="secondary">
                  {team.regionNote && <>{team.regionNote}, </>}
                  {team.stateTerrUs}
                </Badge>
              </div>

              <Button type="submit" className="cursor-pointer" onClick={() => window.open(team.web, '_blank')}>
                Contact
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div >
  )
}
