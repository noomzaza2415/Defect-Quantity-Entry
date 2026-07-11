"use client"

import Link from "next/link"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
  <SidebarMenuButton 
    tooltip={item.title} 
    isActive={item.isActive}
    // ใช้ render prop แทนการครอบ <Link> ไว้ข้างนอก
    render={
      <Link href={item.url}>
        {item.icon}
        <span>{item.title}</span>
      </Link>
    }
  />
</SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}