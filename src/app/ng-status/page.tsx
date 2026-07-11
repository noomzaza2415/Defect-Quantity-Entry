// "use client";

// import * as React from "react";
// import { AppSidebar } from "@/components/app-sidebar";
// import { Separator } from "@/components/ui/separator";
// import {
//   SidebarInset,
//   SidebarProvider,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import NGStatusPage from "@/components/NGStatus/page";

// // นำเข้า ReworkTable ของคุณ


// export default function Page() {
//   return (
//     <SidebarProvider>
//       <AppSidebar />
//       <SidebarInset className="overflow-hidden">
//         <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white">
//           <div className="flex items-center gap-2 px-4">
//             <SidebarTrigger className="-ml-1" />
//             <Separator orientation="vertical" className="mr-2 h-4" />
//             <Breadcrumb>
//               <BreadcrumbList>
//                 <BreadcrumbItem className="hidden md:block">
//                   <BreadcrumbLink href="/dashboard">Production System</BreadcrumbLink>
//                 </BreadcrumbItem>
//                 <BreadcrumbSeparator className="hidden md:block" />
//                 <BreadcrumbItem>
//                   <BreadcrumbPage>Rework Management</BreadcrumbPage>
//                 </BreadcrumbItem>
//               </BreadcrumbList>
//             </Breadcrumb>
//           </div>
//         </header>
//         <div className="flex-1 min-h-0 overflow-hidden">
//           <NGStatusPage />
//         </div>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }




"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import NGStatusPage from "@/components/NGStatus/page";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen flex flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Production System</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Rework Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex-1 min-h-0 overflow-hidden">
          <NGStatusPage />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}