/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useCallback, useEffect } from "react";
import { Search, Loader2, Wrench, RefreshCw } from "lucide-react";
import { RegisterReworkPayload, ReworkService } from "../../../services/reworkService";

// Import Service ที่เราแยกไว้ (ปรับ path ให้ตรงกับโครงสร้างโปรเจกต์ของคุณ)


export default function ReworkTable() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [dates, setDates] = useState({
        from: new Date().toISOString().split("T")[0],
        to: new Date().toISOString().split("T")[0],
    });

    const [, setQtyMap] = useState<Record<number, number>>({});

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // เรียกใช้ API ผ่าน Service
            const json = await ReworkService.getWorkOrders(dates.from, dates.to);
            setData(json.data.items || []);
            setQtyMap({});
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [dates.from, dates.to]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const totalNG = data.reduce((acc, curr) => acc + (Number(curr.badQty) || 0), 0);

    const reasonOptions = [
        { value: "QC01", label: "การทำงาน" },
        { value: "QC02", label: "ชิ้นส่วน" },
        { value: "QC03", label: "งานฉีด" },
        { value: "QC05", label: "โครงงาน" },
        { value: "QC06", label: "อื่นๆ" },
    ];

    const [selectedReason, setSelectedReason] = useState("QC01");
    const [remark, setRemark] = useState("");
    const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedReason(e.target.value);
    };

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const [confirmData, setConfirmData] = useState<{
        title: string;
        message: string;
        action: "change" | "rework";
        row: any;
    } | null>(null);

    const headers = ["เวลาที่พบ", "เลขล็อต LG", "Model Suffix", "TOOL", "เลขรายการผลิต", "ชื่อรายการผลิต", "ชิ้นส่วนงานเสีย", "ชื่องานเสีย", "เปลี่ยนใหม่", "รีเวิร์คได้"];

    const handleRegisterRework = async () => {
        if (!confirmData) return;

        const kdBad =
            confirmData.action === "change"
                ? "I"
                : "O";

        const row = confirmData.row;

        const payload: RegisterReworkPayload = {
            badId: row.badId,
            cdEquip: row.cdEquip,
            cdGItem: row.cdGItem,
            kdBad: confirmData.action === "change" ? "I" : "O",
            cdCause: selectedReason,
            badQty: 1,
            remarks: remark.trim(),
            logUser: "SYSTEM",
        };
        try {
            setProcessing(true);

            const result = await ReworkService.registerRework(payload);

            if (result.success) {

                alert(
                    kdBad === "I"
                        ? "เปลี่ยนใหม่สำเร็จ"
                        : "รีเวิร์คสำเร็จ"
                );

                setRemark("");
                fetchData();
                setConfirmOpen(false);
                setConfirmData(null);

            } else {
                alert(result.message);
            }

        } catch (err) {
            alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden p-4 bg-slate-50 gap-4">

            {/* ส่วนค้นหา */}
            <div className="flex-none flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <input
                    type="date"
                    value={dates.from}
                    onChange={(e) => setDates({ ...dates, from: e.target.value })}
                    className="p-2 border rounded text-sm"
                />
                <span>~</span>
                <input
                    type="date"
                    value={dates.to}
                    onChange={(e) => setDates({ ...dates, to: e.target.value })}
                    className="p-2 border rounded text-sm"
                />
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Search className="w-4 h-4" />
                    )}
                    ค้นหา
                </button>

                <div className="flex items-center gap-2 ml-2">
                    <span className="text-sm font-semibold text-slate-700">
                        สาเหตุงานเสีย :
                    </span>

                    <div className="flex flex-wrap gap-2">
                        {reasonOptions.map((item) => {
                            const active = selectedReason === item.value;

                            return (
                                <label key={item.value} className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={item.value}
                                        checked={active}
                                        onChange={handleReasonChange}
                                        className="sr-only"
                                    />

                                    <div
                                        className={`px-4 py-2 rounded-lg border text-sm transition-all duration-200
                        ${active
                                                ? "bg-blue-600 border-blue-600 text-white font-bold shadow-md"
                                                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                                            }`}
                                    >
                                        {item.label}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                        <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                            หมายเหตุ :
                        </span>

                        <input
                            type="text"
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="กรอกหมายเหตุ..."
                            className="w-60 rounded-lg border border-slate-300 px-3 py-2 text-sm
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                </div>

                <div className="ml-auto font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                    ยอด NG รวม: {totalNG.toLocaleString()} ชิ้น
                </div>
            </div>

            {/* ตาราง */}
            <div className="flex-1 overflow-auto bg-white rounded-xl border border-slate-200 shadow-sm relative">
                <table className="w-full text-sm text-left border-collapse whitespace-nowrap min-w-[1200px]">
                    <thead className="bg-slate-100 border-b sticky top-0 z-10 shadow-sm">
                        <tr>
                            {headers.map((h) => (
                                <th key={h} className="px-4 py-3 text-center font-semibold text-slate-700">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={10} className="text-center p-10 text-slate-400">กำลังโหลดข้อมูล...</td></tr>
                        ) : data.length > 0 ? (
                            data.map((row, i) => (
                                <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-4 py-3 text-center text-slate-500">
                                        {row.badTime2}
                                    </td>
                                    <td className="px-4 py-3 text-center">{row.lgNo || "-"}</td>
                                    <td className="px-4 py-3 text-center">{row.modelSuffix || "-"}</td>
                                    <td className="px-4 py-3 text-center">{row.itemMat || "-"}</td>
                                    <td className="px-4 py-3 text-center">{row.cdGItem || "0"}</td>
                                    <td className="px-4 py-3 text-center">{row.productName || "0"}</td>
                                    <td className="px-4 py-3 text-center">{row.categoryNameENG || "0"}</td>
                                    <td className="px-4 py-3 text-center font-bold text-red-600">{row.defectNameENG || "0"}</td>

                                    {/* 9. ปุ่มเปลี่ยนใหม่ (Change) */}
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => {
                                                setConfirmData({
                                                    title: "ยืนยันการเปลี่ยนใหม่",
                                                    message: "คุณต้องการเปลี่ยนชิ้นงานนี้ใช่หรือไม่?",
                                                    action: "change",
                                                    row,
                                                });

                                                setConfirmOpen(true);
                                            }}
                                            type="button"
                                            className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 transition-colors text-xs font-medium"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                            เปลี่ยน
                                        </button>
                                    </td>

                                    {/* 10. ปุ่มรีเวิร์ค (Rework) */}
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => {
                                                setConfirmData({
                                                    title: "ยืนยันการรีเวิร์ค",
                                                    message: "คุณต้องการรีเวิร์คชิ้นงานนี้ใช่หรือไม่?",
                                                    action: "rework",
                                                    row,
                                                });

                                                setConfirmOpen(true);
                                            }}
                                            type="button"
                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs font-medium"
                                        >
                                            <Wrench className="w-3.5 h-3.5" />
                                            รีเวิร์ค
                                        </button>
                                    </td>

                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={10} className="text-center p-10 text-slate-400">ไม่พบข้อมูล</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {confirmOpen && confirmData && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">

                    <div className="w-[520px] overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                        <div
                            className={`px-6 py-5 text-white ${confirmData.action === "change"
                                    ? "bg-amber-500"
                                    : "bg-blue-600"
                                }`}
                        >
                            <div className="flex items-center gap-4">

                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">

                                    {confirmData.action === "change"
                                        ? <RefreshCw className="h-7 w-7" />
                                        : <Wrench className="h-7 w-7" />}

                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold">
                                        {confirmData.title}
                                    </h2>

                                    <p className="text-white/80">
                                        กรุณาตรวจสอบข้อมูลก่อนดำเนินการ
                                    </p>
                                </div>

                            </div>
                        </div>

                        <div className="space-y-5 p-6">

                            <div
                                className={`rounded-xl border p-4 text-center ${confirmData.action === "change"
                                        ? "bg-amber-50 border-amber-200"
                                        : "bg-blue-50 border-blue-200"
                                    }`}
                            >
                                <p
                                    className={`font-bold ${confirmData.action === "change"
                                            ? "text-amber-700"
                                            : "text-blue-700"
                                        }`}
                                >
                                    {confirmData.message}
                                </p>

                                <p className="mt-2 text-sm text-slate-500">
                                    การดำเนินการนี้จะมีผลกับข้อมูลในระบบ
                                </p>
                            </div>

                        </div>

                        <div className="flex gap-4 border-t bg-slate-100 p-5">

                            <button
                                onClick={() => {
                                    setConfirmOpen(false);
                                    setConfirmData(null);
                                }}
                                className="flex-1 rounded-xl border border-slate-300 bg-white py-3 font-semibold"
                            >
                                ยกเลิก
                            </button>

                            <button
                                disabled={processing}
                                onClick={handleRegisterRework}
                                className={`flex-1 rounded-xl py-3 font-semibold text-white ${confirmData.action === "change"
                                        ? "bg-amber-500 hover:bg-amber-600"
                                        : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                            >
                                {processing
                                    ? "กำลังดำเนินการ..."
                                    : confirmData.action === "change"
                                        ? "🔄 ยืนยันการเปลี่ยน"
                                        : "🔧 ยืนยันการรีเวิร์ค"}
                            </button>

                        </div>

                    </div>

                </div>
            )}
        </div>
    );
}