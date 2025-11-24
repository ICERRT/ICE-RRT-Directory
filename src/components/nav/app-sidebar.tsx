import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Gauge, Globe } from "lucide-react"
import { NavMain } from "./main"
import { NavCommunity } from "./community"
import { Link } from "@tanstack/react-router"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Find Resources",
      url: "/dashboard",
      icon: Gauge
    },
  ],
  navCommunity: [
    {
      title: "Our Site",
      url: "#",
      icon: Globe,
      items: [
        {
          title: "Contribution Guide",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="bg-sidebar-background text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img src="./logo192.png" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">ICE RRT</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavCommunity items={data.navCommunity} />
      </SidebarContent>
    </Sidebar>
  )
}
