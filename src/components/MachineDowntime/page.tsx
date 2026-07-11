/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Search,
  Save,
  Loader2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ListChecks,
} from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ngService } from "../../../services/ngService";
import { ReasonSelector } from "@/components/MachineStopReasonSelector";

interface IdleRecord {
  id: string | number;
  lineName: string;
  dateTime: string;
  workOrder: string;
  modelSuffix: string;
  timestartOff: string;
  timestartOn: string;
  totaltimeOff: number;
  reason: string | null;
  actionDes: string | null;
}

export default function MachineStopPage() {
  const [rows, setRows] = React.useState<IdleRecord[]>([]);
  const [selectedRow, setSelectedRow] = React.useState<IdleRecord | null>(null);
  const [actionPlan, setActionPlan] = React.useState("");
  const [reasonCode, setReasonCode] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [cdEquip, setCdEquip] = React.useState("ALL");
  const [loading, setLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const safeDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "-" : d.toLocaleString("th-TH");
  };

  const fetchIdleTime = async () => {
    setLoading(true);
    try {
      const result = await ngService.getLineIdleTime(selectedDate, selectedDate, cdEquip);
      setRows(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Fetch failed:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedRow) return;
    setIsSaving(true);
    try {
      setRows((prev) =>
        prev.map((item) =>
          item.id === selectedRow.id
            ? { ...item, reason: reasonCode, actionDes: actionPlan }
            : item
        )
      );
      setSelectedRow(null);
    } catch (error) {
      console.error("Save failed:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSaving(false);
    }
  };

  React.useEffect(() => {
    fetchIdleTime();
  }, [cdEquip, selectedDate]);

  const summary = React.useMemo(() => {
    const totalStops = rows.length;
    const totalSeconds = rows.reduce((acc, r) => acc + (r.totaltimeOff || 0), 0);
    const unresolved = rows.filter((r) => !r.reason).length;
    const resolved = totalStops - unresolved;
    return { totalStops, totalSeconds, unresolved, resolved };
  }, [rows]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex h-screen min-h-0 flex-col overflow-hidden">
        {/* Header สไตล์เดียวกัน */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="font-semibold text-lg text-slate-800">Machine Downtime Report</h1>
        </header>

        {/* Main Content */}
        <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden bg-slate-50 p-6">

          {/* Summary Strip (ปรับเป็นสีมาตรฐาน Tailwind) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 shrink-0">
            <SummaryCard
              label="รายการหยุดทั้งหมด"
              value={summary.totalStops.toString().padStart(2, "0")}
              icon={ListChecks}
              theme="blue"
            />
            <SummaryCard
              label="เวลาหยุดสะสม"
              value={formatDuration(summary.totalSeconds)}
              icon={Clock}
              theme="red"
              mono
            />
            <SummaryCard
              label="ระบุเหตุผลแล้ว"
              value={summary.resolved.toString().padStart(2, "0")}
              icon={CheckCircle2}
              theme="emerald"
            />
            <SummaryCard
              label="รอดำเนินการ"
              value={summary.unresolved.toString().padStart(2, "0")}
              icon={AlertTriangle}
              theme="amber"
            />
          </div>

          {/* Filter / Action Panel (แถวเดียวกันทั้งหมด 100%) */}
          <Card className="border-slate-200 shadow-sm shrink-0">
            {/* 1. ใส่ overflow-x-auto เพื่อให้เลื่อนซ้าย-ขวาได้ถ้าจอเล็ก */}
            <CardContent className="p-4 overflow-x-auto custom-scrollbar">

              {/* 2. เปลี่ยนเป็น flex-nowrap และ min-w-max เพื่อบังคับแถวเดียว */}
              <div className="flex flex-nowrap items-end gap-4 min-w-max">

                {/* 1: วันที่ */}
                <div className="flex flex-col gap-1.5 w-[140px] shrink-0">
                  <label className="text-xs font-semibold text-slate-500">วันที่</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border-slate-300 focus-visible:ring-blue-500"
                  />
                </div>

                {/* 2: Line */}
                <div className="flex flex-col gap-1.5 w-[120px] shrink-0">
                  <label className="text-xs font-semibold text-slate-500">Line</label>
                  <Select value={cdEquip} onValueChange={(val) => setCdEquip(val ?? "")}>
                    <SelectTrigger className="border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">ALL</SelectItem>
                      <SelectItem value="line1">D1</SelectItem>
                      <SelectItem value="line2">D2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 3: ปุ่มค้นหา */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <label className="text-xs font-semibold invisible">ซ่อน</label>
                  <Button
                    onClick={fetchIdleTime}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition-colors shadow-sm active:scale-95 disabled:opacity-50 text-sm"
        >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    ค้นหา
                  </Button>
                </div>

                {/* เส้นคั่นบางๆ */}
                <div className="w-px h-10 bg-slate-200 mx-1 mb-0.5 shrink-0" />

                {/* 4: เหตุผลการหยุด */}
                <div className="flex flex-col gap-1.5 w-[220px] shrink-0">
                  <label className="text-xs font-semibold text-slate-500">เหตุผลการหยุด</label>
                  <div className="w-full">
                    <ReasonSelector value={reasonCode} onChange={setReasonCode} />
                  </div>
                </div>

                {/* 5: แผนการแก้ไข */}
                <div className="flex flex-col gap-1.5 w-[250px] shrink-0">
                  <label className="text-xs font-semibold text-slate-500">แผนการแก้ไข</label>
                  <Input
                    value={actionPlan}
                    onChange={(e) => setActionPlan(e.target.value)}
                    placeholder="ระบุแผนการแก้ไข..."
                    className="border-slate-300 focus-visible:ring-blue-500 w-full"
                  />
                </div>

                {/* 6: ปุ่มบันทึก */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <label className="text-xs font-semibold invisible">ซ่อน</label>
                  <Button
                    onClick={handleSave}
                    className="bg-emerald-600 text-white px-6 py-2 rounded font-medium hover:bg-emerald-700 transition-colors shadow-sm active:scale-95 text-sm"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "บันทึก..." : "บันทึก"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Records Table (มี Scroll Bar ในตัว, สี Active Row เหมือนหน้า OrderTable) */}
          <div className="flex-1 min-h-[300px] border rounded-lg overflow-y-auto bg-white shadow-sm">
            <Table className="w-full text-sm">
              <TableHeader className="sticky top-0 bg-slate-100 z-10 shadow-sm">
                <TableRow className="border-b">
                  {["Line", "วันที่", "Work Order", "เวลาเริ่ม - จบ", "ระยะเวลา", "เหตุผล", "แผนแก้ไข"].map((h) => (
                    <TableHead key={h} className="text-left font-semibold text-slate-700 whitespace-nowrap">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length > 0 ? (
                  rows.map((row) => {
                    const isSelected = selectedRow?.id === row.id;
                    return (
                      <TableRow
                        key={row.id}
                        onClick={() => {
                          setSelectedRow(row);
                          setReasonCode(row.reason || "");
                          setActionPlan(row.actionDes || "");
                        }}
                        // สีเมื่อเอาเมาส์ชี้ และ สีตอนกดเลือกแถว (ฟ้าอ่อน)
                        className={`cursor-pointer transition-colors border-b ${isSelected ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-slate-50"
                          }`}
                      >
                        <TableCell className="font-medium whitespace-nowrap">{row.lineName}</TableCell>
                        <TableCell className="text-slate-600 whitespace-nowrap">
                          {new Date(row.dateTime).toLocaleDateString("th-TH")}
                        </TableCell>
                        <TableCell className="text-slate-600 whitespace-nowrap">{row.workOrder}</TableCell>
                        <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">
                          {safeDate(row.timestartOff).split(" ")[1]} - {safeDate(row.timestartOn).split(" ")[1]}
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-red-600 whitespace-nowrap">
                            {formatDuration(row.totaltimeOff)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {row.reason ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                              {row.reason}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                              รอดำเนินการ
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-slate-600">
                          {row.actionDes || <span className="text-slate-300">-</span>}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 text-slate-300" />
                        <span>ไม่พบข้อมูลการหยุดเครื่องในวันที่เลือก</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// --- Summary card component (ปรับโค้ดสีให้รองรับ Tailwind Theme) ---
function SummaryCard({
  label,
  value,
  icon: Icon,
  theme,
  mono = false,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  theme: "blue" | "red" | "emerald" | "amber";
  mono?: boolean;
}) {
  const colorMap = {
    blue: { bg: "bg-blue-100", text: "text-blue-600", bar: "bg-blue-500" },
    red: { bg: "bg-red-100", text: "text-red-600", bar: "bg-red-500" },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-600", bar: "bg-emerald-500" },
    amber: { bg: "bg-amber-100", text: "text-amber-600", bar: "bg-amber-500" },
  };

  const colors = colorMap[theme];

  return (
    <Card className="relative overflow-hidden border-slate-200 shadow-sm bg-white">
      {/* แถบสีด้านซ้าย */}
      <span className={`absolute inset-y-0 left-0 w-1 ${colors.bar}`} aria-hidden="true" />
      <CardContent className="flex items-center justify-between p-4 pl-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className={`text-2xl font-bold text-slate-800 ${mono ? "font-mono tabular-nums" : ""}`}>
            {value}
          </p>
        </div>
        {/* ไอคอนพร้อมพื้นหลัง */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors.bg}`}>
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </div>
      </CardContent>
    </Card>
  );
}