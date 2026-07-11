/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  FilterBar,
  OrderTable,
  DefectPanel,
} from "@/components/ng-dashboard"
import { DefectService } from "../../../services/defectService";

export default function DashboardPage() {
  const [orderData, setOrderData] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // State to store the last search parameters for re-fetching data
  const [lastSearchParams, setLastSearchParams] = useState<{ from: string; to: string; eqNo: string; combinedData: string; } | null>(null);

  const { t } = useTranslation();

  const handleSearch = async (from: string, to: string, eqNo: string, combinedData: string) => {
    // Store the latest search parameters to be used for re-fetching.
    setLastSearchParams({ from, to, eqNo, combinedData });

    try {
      const data = await DefectService.getOnWorkOrder2(
        eqNo,
        from,
        to
      );

      if (!data.success) throw new Error(`Status: ${data.message}`);

      if (data && data.data.items) {
        setOrderData(data.data.items);

        // ถ้ามีรายการที่กำลัง Running (wrkState = R) ให้เลือกอัตโนมัติ
        const runningOrder = data.data.items.find(
          (o: any) => o.prodQty > 0 && o.wrkState === "R"
        );

        if (runningOrder) {
          setSelectedOrder(runningOrder);
        } else if (selectedOrder) {
          // ถ้าไม่มี R ให้คงรายการเดิมไว้ (ถ้ายังมีอยู่)
          const updatedOrder = data.data.items.find(
            (o: any) => o.noWkOrd === selectedOrder.noWkOrd
          );

          setSelectedOrder(updatedOrder || null);
        } else {
          setSelectedOrder(null);
        }
      } else {
        setOrderData([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setOrderData([]);
    }
  };

  // This function is passed down to DefectPanel.
  // When a new defect is registered, this function is called to refresh the order data.
  const handleDefectRegistered = () => {
    if (lastSearchParams) {
      // Trigger a new search with the last used parameters.
      handleSearch(lastSearchParams.from, lastSearchParams.to, lastSearchParams.eqNo, lastSearchParams.combinedData);
    }
  };

  const calculatedTotalNG = useMemo(() => {
    if (!Array.isArray(orderData)) return 0;
    return orderData.reduce((sum, item) => sum + (Number(item.badQty) || 0), 0);
  }, [orderData]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex h-screen min-h-0 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="font-semibold text-lg">{t('mainDashboardTitle')}</h1>
          <div className="ml-auto"><LanguageSwitcher /></div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden bg-slate-50 p-4">
          <FilterBar
            onSearch={handleSearch}
            totalNG={calculatedTotalNG}
            onSave={() => console.log("Save")}
          />

          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="min-h-[165px] overflow-hidden rounded-lg border bg-white shadow-sm">
              <OrderTable
                data={orderData}
                selectedOrder={selectedOrder}
                onRowClick={(row) => setSelectedOrder(row)}
              />
            </div>

            <div className="flex-1 min-h-[240px] overflow-hidden rounded-lg border bg-white shadow-sm">
              {/* Pass parameters and the callback to DefectPanel */}
              <DefectPanel
                selectedOrderNo={selectedOrder?.noWkOrd || null}
                selectedCdGItem={selectedOrder?.cdGItem || null}
                eqNo={lastSearchParams?.eqNo || "D01"}
                shift={lastSearchParams?.combinedData.split('_')[1] || "A"}
                onDefectRegistered={handleDefectRegistered}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}