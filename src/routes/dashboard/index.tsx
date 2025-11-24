import { CardView } from "@/components/dashboard/cardView"
import { TableView } from "@/components/dashboard/tableView"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Card className="p-4 grow overflow-x-hidden overflow-y-scroll">
      <Tabs defaultValue="cards" className="w-auto">
        <TabsList>
          <TabsTrigger value="cards">Card View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>
        <TabsContent value="cards">
          <CardView />
        </TabsContent>
        <TabsContent value="table" className="">
          <TableView />
        </TabsContent>
      </Tabs>
    </Card>
  )
}
