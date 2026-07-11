"use client"

import * as React from "react"
// 1. นำเข้า usePathname เพื่อตรวจจับหน้าปัจจุบัน
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  Factory,
  Activity,
  ClipboardList,
  AlertTriangle,
  BarChart3,
  Gauge,
  Wrench,
} from "lucide-react"

const data = {
  user: {
    name: "Admin",
    email: "admin@company.com",
    avatar: "/avatars/admin.jpg",
  },

  teams: [
    {
      name: "MES System",
      logo: <GalleryVerticalEndIcon />,
      plan: "Production",
    },
    {
      name: "Quality Control",
      logo: <AudioLinesIcon />,
      plan: "QC",
    },
    {
      name: "Engineering",
      logo: <TerminalIcon />,
      plan: "Support",
    },
  ],

  navMain: [
    
{
    title: "Assembly Status",
    url: "/assembly-status",
    icon: <Factory />,           
  },
  {
    title: "MachineDowntime",
    url: "/machine-downtime",
    icon: <Activity />,         
  },
  {
    title: "NGRecord(Order)",
    url: "/ng-record",
    icon: <ClipboardList />,     
  },
  {
    title: "NGStatus",
    url: "/ng-status",
    icon: <AlertTriangle />,     
  },
  {
    title: "ProductionHistory",
    url: "/production-history",
    icon: <BarChart3 />,        
  },
  {
    title: "ProductionStatus",
    url: "/production-status",
    icon: <Gauge />,            
  },
  {
    title: "rework",
    url: "/rework",
    icon: <Wrench />,          
  },

  ],
}

export function AppSidebar(
  props: React.ComponentProps<typeof Sidebar>
) {
  // 2. ดึง Path ปัจจุบัน
  const pathname = usePathname()

  // 3. สร้างรายการเมนูใหม่ที่มีสถานะ isActive
  const navMainWithState = data.navMain.map((item) => ({
    ...item,
    isActive: pathname === item.url,
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        {/* 4. ส่งข้อมูลที่แนบสถานะ isActive ไปให้ NavMain */}
        <NavMain items={navMainWithState} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}