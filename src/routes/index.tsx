import { createFileRoute } from '@tanstack/react-router'
import { HeartPlus, Search } from "lucide-react"

import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
          <InputGroupInput placeholder="Search by state, county, or city" autoFocus onInput={(e) => {
            setSearchTerm((e.target as HTMLInputElement).value.trim())
          }} />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
      </header>

      <h2 className="text-xl font-medium text-center py-6 text-gray-500">Local teams</h2>

      {teams.length === 0 && (
        <Spinner className="size-8 opacity-48" />
      )}

      {teams.length > 0 && localTeams.length === 0 && (
        <p className="text-center text-muted-foreground px-4 pb-8">
          Sorry, no local teams matched "{searchTerm}".
          <br />
          <a target="_blank" href="https://submissions.icerrt.com/">
            <HeartPlus className="inline" /> Suggest a team
          </a>
        </p>
      )}

      {localTeams && (
        <div className="gap-4 px-4 pb-8 max-w-7xl mx-auto columns-xs space-y-4">
          {localTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}

      <h2 className="text-xl font-medium text-center py-6 text-gray-500">National teams</h2>

      {nationalTeams && (
        <div className="gap-4 px-4 pb-8 max-w-7xl mx-auto columns-xs space-y-4">
          {nationalTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  )
}

function TeamCard({ team }: { team: RrtGroup }) {
  return (
    <Card className="fade-in w-full py-4 break-inside-avoid" key={team.id}>
      <CardHeader className="px-4">
        <CardTitle className="text-lg pb-2">{team.name}</CardTitle>
        <CardDescription className="flex flex-row justify-between gap-4">
          <div>
            {team.regionNote && <>{team.regionNote}</>}
            <br />
            <strong>{team.stateTerrUs}</strong>
          </div>
          <Button type="submit" className="cursor-pointer" onClick={() => window.open(team.web, '_blank')}>
            Contact
          </Button>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
