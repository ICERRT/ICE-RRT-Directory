import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { createFileRoute, redirect } from '@tanstack/react-router'


export const Route = createFileRoute('/')({ 
  ssr: false, 
  component: App,
  loader: () => { throw redirect({ to: '/dashboard'})} 
})

function App() {
  return (
    <Card>
      <Label>Here is the landing component</Label>
    </Card>
  )
}
