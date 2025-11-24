import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/')({ ssr: false, component: App })

function App() {
  return (
    <Card>
      <Label>Here is the landing component</Label>
    </Card>
  )
}
