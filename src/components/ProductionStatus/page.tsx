/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
    Calendar, Clock, Wrench, BarChart3,
    AlertTriangle, CheckCircle2,
    Users, Target, TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    startConnections,
    connectionD1,
} from "@/lib/signalr";
import { Skeleton } from "@/components/ui/skeleton";
import { ngService } from "../../../services/ngService";
import dayjs from "dayjs";
import { t_production } from "./translations";

export default function ProductionSummary() {
    const [dataMap, setDataMap] = React.useState<Record<string, any[]>>({});
    const [kpiMap, setKpiMap] = React.useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = React.useState(true);
    const [selectedRowId, setSelectedRowId] = React.useState<string | null>(null);
    const [lang, setLang] = React.useState<"en" | "th" | "kr" | "mm">("en");

    // Pagination State
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 15;

    React.useEffect(() => {
        const savedLang = localStorage.getItem("app_lang") as "en" | "th" | "kr" | "mm";
        if (savedLang) setLang(savedLang);
    }, []);

    const handleSelectLang = (nextLang: "en" | "th" | "kr" | "mm") => {
        setLang(nextLang);
        localStorage.setItem("app_lang", nextLang);
    };

    React.useEffect(() => {
        let isMounted = true;
        const init = async () => {
            setIsLoading(true);
            try {
                const result = await ngService.getProductionStatus("D01", dayjs().format("YYYY-MM-DD"));
                if (isMounted && result?.result && result.result.length > 0) {
                    const initialKey = result.result[0].cdGItem || "initial";
                    setDataMap({ [initialKey]: result.result });
                    if (result.summary && result.summary.length > 0) {
                        setKpiMap({ [initialKey]: result.summary[0] });
                    }
                }
            } catch (error) { } finally {
                if (isMounted) setIsLoading(false);
            }
            await startConnections();
            const onReceiveD1 = (workOrder: any[], summary: any[]) => {
                if (!isMounted) return;
                if (workOrder && Array.isArray(workOrder) && workOrder.length > 0) {
                    const key = workOrder[0].cdGItem || "unknown";
                    setDataMap(prev => ({ ...prev, [key]: workOrder }));
                    if (summary && Array.isArray(summary) && summary.length > 0) {
                        setKpiMap(prev => ({ ...prev, [key]: summary[0] }));
                    }
                }
            };
            connectionD1.on("ReceiveMessageD1", onReceiveD1);
        };
        init();
        return () => { isMounted = false; connectionD1.off("ReceiveMessageD1"); };
    }, []);

    const allData = React.useMemo(() => Object.values(dataMap).flat(), [dataMap]);

    // Reset หน้าเมื่อข้อมูลเปลี่ยน
    React.useEffect(() => { setCurrentPage(1); }, [allData]);

    const paginatedData = React.useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return allData.slice(startIndex, startIndex + itemsPerPage);
    }, [allData, currentPage]);

    const totalPages = Math.ceil(allData.length / itemsPerPage);

    const activeData = React.useMemo(() => allData.find((d: any) => d.noWkOrd === selectedRowId) || allData[0] || {}, [allData, selectedRowId]);
    const activeKpi = React.useMemo(() => kpiMap[activeData.cdGItem] || activeData || {}, [activeData, kpiMap]);
    const combinedKpi = React.useMemo(() => {
        const kpis = Object.values(kpiMap);
        if (kpis.length === 0) return null;
        return kpis.reduce((acc, curr) => ({
            orderQty: (acc.orderQty || 0) + (curr.orderQty || 0),
            planQty: (acc.planQty || 0) + (curr.planQty || 0),
            prodQty: (acc.prodQty || 0) + (curr.prodQty || 0),
            badQty: (acc.badQty || 0) + (curr.badQty || 0),
            idleTime: (acc.idleTime || 0) + (curr.idleTime || 0),
            uphTt: acc.uphTt || curr.uphTt,
            planRate: acc.planRate || curr.planRate,
            prodRate: acc.prodRate || curr.prodRate,
        }), {} as any);
    }, [kpiMap]);

    const targetPercent = combinedKpi?.planQty > 0 ? Math.round((combinedKpi.prodQty / combinedKpi.planQty) * 100) : 0;
    const progressPercent = combinedKpi?.prodRate ?? 0;

    return (
        <div className="p-6 space-y-6 bg-[#F7F8FA] min-h-screen">
            <div className="bg-[#0B1F3A] text-white p-4 rounded-t-xl flex justify-between items-center shadow-md">
                <h1 className="text-xl font-bold flex items-center gap-2.5 tracking-tight">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                        <BarChart3 className="h-4 w-4 text-[#C9A668]" />
                    </span>
                    {t_production[lang].title}
                </h1>

                <DropdownMenu>
                    {/* ใช้ prop `render` และส่ง <Button> เข้าไปแทน */}
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="outline"
                                size="sm"
                                className="font-semibold border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white shadow-xs"
                            >
                                🌐 {{ en: "EN", th: "TH", kr: "KR", mm: "MM" }[lang]}
                            </Button>
                        }
                    />

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleSelectLang("th")}>ไทย (TH)</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSelectLang("en")}>English (EN)</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSelectLang("kr")}>한국어 (KR)</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSelectLang("mm")}>မြန်မာဘာသာ (MM)</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white border-x border-b border-[#E3E7ED] rounded-b-xl shadow-sm">
                {[
                    { icon: Calendar, label: t_production[lang].date, value: activeData?.dtWkOrd ? dayjs(activeData.lgStart).format('YYYY-MM-DD') : '-' },
                    { icon: Clock, label: t_production[lang].lotNo, value: activeData?.lgNo || '-' },
                    { icon: Wrench, label: t_production[lang].itemCode, value: activeData?.cdGItem || '-' },
                    { icon: Users, label: t_production[lang].workOrder, value: activeData?.noWkOrd || '-' },
                    { icon: Users, label: t_production[lang].planQty, value: activeKpi?.orderQty?.toLocaleString() || '0' },
                    { icon: Users, label: t_production[lang].actualQty, value: activeKpi?.prodQty?.toLocaleString() || '0' },
                    { icon: CheckCircle2, label: t_production[lang].goodQty, value: ((activeKpi?.prodQty || 0) - (activeKpi?.badQty || 0)).toLocaleString() || '0' },
                    { icon: AlertTriangle, label: t_production[lang].ngQty, value: activeKpi?.badQty?.toLocaleString() || '0' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-[#0B1F3A]/6 rounded-lg text-[#0B1F3A] shrink-0">
                            <item.icon size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-[#9AA3B0]">{item.label}</p>
                            <p className="font-semibold text-[#0B1F3A] truncate" title={String(item.value)}>{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="shadow-sm border-[#E3E7ED] overflow-hidden">
                        <Table>
                            <TableHeader className="bg-[#FAFBFC]">
                                <TableRow className="border-b border-[#E3E7ED] hover:bg-[#FAFBFC]">
                                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-[#5B6472]">{t_production[lang].workingPeriod}</TableHead>
                                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-[#5B6472]">{t_production[lang].lotNo}</TableHead>
                                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-[#5B6472]">{t_production[lang].modelSuffix}</TableHead>
                                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-[#5B6472]">{t_production[lang].tool}</TableHead>
                                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-[#5B6472]">{t_production[lang].itemCode}</TableHead>
                                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-[#5B6472]">{t_production[lang].partName}</TableHead>
                                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-[#5B6472]">{t_production[lang].planQty}</TableHead>
                                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-[#5B6472]">{t_production[lang].actualQty}</TableHead>
                                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-[#5B6472]">{t_production[lang].ngQty}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={9}><Skeleton className="h-10 w-full" /></TableCell></TableRow>)
                                ) : paginatedData.length > 0 ? (
                                    paginatedData.map((row: any, index: number) => (
                                        <TableRow
                                            key={`${row.noWkOrd}-${index}`}
                                            onClick={() => setSelectedRowId(row.noWkOrd)}
                                            className={`cursor-pointer border-b border-[#EEF0F3] transition-colors ${selectedRowId === row.noWkOrd ? "bg-[#0B1F3A]/6 hover:bg-[#0B1F3A]/8" : "hover:bg-[#FAFBFC]"}`}
                                        >
                                            <TableCell className="text-center text-[#3D4554]">{row.plnStime ? dayjs(row.plnStime).format("MM-DD HH:mm") : "-"}</TableCell>
                                            <TableCell className="text-center text-[#3D4554]">{row.lgNo || "-"}</TableCell>
                                            <TableCell className="text-center text-[#3D4554]">{row.modelSuffix || "-"}</TableCell>
                                            <TableCell className="text-center text-[#3D4554]">{row.nmGItem || "-"}</TableCell>
                                            <TableCell className="text-center text-[#3D4554]">{row.cdGItem || "-"}</TableCell>
                                            <TableCell className="text-center font-medium text-[#0B1F3A]">{row.noWkOrd || "-"}</TableCell>
                                            <TableCell className="text-center font-mono font-semibold text-[#0B1F3A]">{row.orderQty?.toLocaleString() || 0}</TableCell>
                                            <TableCell className="text-center font-mono font-semibold text-[#1F6F4D]">{row.prodQty?.toLocaleString() || 0}</TableCell>
                                            <TableCell className="text-center font-mono font-bold text-[#C1463D]">{row.badQty?.toLocaleString() || 0}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={9} className="text-center py-10 text-[#9AA3B0]">{t_production[lang].noData}</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {/* Pagination Footer */}
                        <div className="flex items-center justify-between p-4 border-t border-[#E3E7ED]">
                            <span className="text-xs text-[#9AA3B0]">Page {currentPage} of {totalPages || 1}</span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="border-[#E3E7ED] text-[#3D4554] hover:bg-[#0B1F3A]/5">Previous</Button>
                                <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="border-[#E3E7ED] text-[#3D4554] hover:bg-[#0B1F3A]/5">Next</Button>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-4 h-fit">
                    {/* ===== Hero KPIs: Target / Progress — จุดสำคัญที่สุดของหน้านี้ ===== */}
                    <div className="grid grid-cols-2 gap-4">
                        <HeroStatCard
                            title={t_production[lang].percentTarget}
                            percent={targetPercent}
                            icon={Target}
                        />
                        <HeroStatCard
                            title={t_production[lang].percentProgress}
                            percent={progressPercent}
                            icon={TrendingUp}
                        />
                    </div>

                    {/* ===== Supporting raw-number KPIs ===== */}
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard title={t_production[lang].totalDailyPlan} value={combinedKpi?.orderQty?.toLocaleString() ?? "0"} unit={t_production[lang].unitPcs} icon={Calendar} />
                        <StatCard title={t_production[lang].targetQty} value={combinedKpi?.planQty?.toLocaleString() ?? "0"} unit={t_production[lang].unitPcs} icon={CheckCircle2} />
                        <StatCard title={t_production[lang].actualQty} value={combinedKpi?.prodQty?.toLocaleString() ?? "0"} unit={t_production[lang].unitPcs} icon={CheckCircle2} accent="#1F6F4D" />
                        <StatCard title={t_production[lang].ngQty} value={combinedKpi?.badQty?.toLocaleString() ?? "0"} unit={t_production[lang].unitPcs} icon={AlertTriangle} accent="#C1463D" />
                        <StatCard title={t_production[lang].totalIdleTime} value={Math.floor((combinedKpi?.idleTime ?? 0) / 60)} unit={t_production[lang].unitMin} icon={AlertTriangle} accent="#C9A668" />
                        <StatCard title={t_production[lang].standardCT} value={`${combinedKpi?.uphTt ?? 0}`} unit={t_production[lang].unitSec} icon={CheckCircle2} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Hero card: ตัวเลขเปอร์เซ็นต์หลัก ใหญ่ เด่น มี ring แสดงสัดส่วนจริง ---
function HeroStatCard({ title, percent, icon: Icon }: { title: string; percent: number; icon: any }) {
    const clamped = Math.max(0, Math.min(100, percent));
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clamped / 100) * circumference;
    const isOnTarget = percent >= 100;

    return (
        <Card className="relative overflow-hidden border-[#0B1F3A] bg-[#0B1F3A] text-white shadow-md">
            <span className="absolute inset-y-0 left-0 w-0.75 bg-[#C9A668]" aria-hidden="true" />
            <CardContent className="flex flex-col items-center gap-2 p-4 pl-5">
                <div className="flex w-full items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#C9A668]">
                    <Icon className="h-3.5 w-3.5" />
                    {title}
                </div>
                <div className="relative flex h-20 w-20 items-center justify-center">
                    <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
                        <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
                        <circle
                            cx="40" cy="40" r={radius} fill="none"
                            stroke={isOnTarget ? "#1F6F4D" : "#C9A668"}
                            strokeWidth="6"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className="absolute font-mono text-xl font-bold tabular-nums">{percent}%</span>
                </div>
            </CardContent>
        </Card>
    );
}

// --- Supporting card: ตัวเลขดิบ ใช้พื้นขาว เป็นชั้นรองจาก Hero ---
function StatCard({ title, value, unit, icon: Icon, accent = "#0B1F3A" }: any) {
    return (
        <Card className="border-[#E3E7ED] shadow-sm">
            <CardContent className="p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#9AA3B0]">
                    <Icon className="h-3 w-3" style={{ color: accent }} />
                    <span className="truncate">{title}</span>
                </div>
                <div className="font-mono text-lg font-bold tabular-nums" style={{ color: accent }}>
                    {value} <span className="text-xs font-normal text-[#9AA3B0]">{unit}</span>
                </div>
            </CardContent>
        </Card>
    );
}