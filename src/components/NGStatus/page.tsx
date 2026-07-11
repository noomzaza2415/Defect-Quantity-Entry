/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, Loader2, Trash2, RefreshCcw, X, Delete as BackspaceIcon } from "lucide-react";
import { NGStatusService } from "../../../services/ngStatusService";

// 1. Numeric Keypad Component (Modal)
const NumericKeypad = ({ isOpen, onClose, onConfirm, initialValue, title = "숫자패드" }: any) => {
    const [val, setVal] = useState("0");

    useEffect(() => {
        if (isOpen) {
            const initial = String(initialValue || "0");
            setVal(Number.isNaN(Number(initial)) ? "0" : initial);
        }
    }, [isOpen, initialValue]);

    const handlePress = (char: string) => {
        setVal((prev) => {
            if (char === "." && prev.includes(".")) return prev;
            if (prev === "0" && char !== ".") return char;
            if (prev.length >= 10) return prev;
            return prev + char;
        });
    };

    const handleBackspace = () => {
        setVal((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    };

    const handleClear = () => setVal("0");

    const handleConfirm = () => {
        const finalValue = val.endsWith(".") ? val.slice(0, -1) : val;
        onConfirm(finalValue || "0");
    };

    if (!isOpen) return null;
    const btnStyle = "flex items-center justify-center h-14 rounded-lg text-2xl font-semibold transition-colors active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2";
    const numBtnStyle = `${btnStyle} bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 focus:ring-blue-500`;
    const actionBtnStyle = `${btnStyle} bg-slate-200 border-slate-300 text-slate-600 hover:bg-slate-300 focus:ring-slate-500`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="bg-slate-50 rounded-xl shadow-xl w-full max-w-xs p-4 flex flex-col gap-4">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full text-slate-500 hover:bg-slate-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Display */}
                <div className="w-full text-right bg-white border border-slate-300 rounded-lg px-4 py-3 text-4xl font-mono text-slate-800 truncate">
                    {val}
                </div>

                {/* Keypad Grid */}
                <div className="grid grid-cols-4 gap-3">
                    {['1', '2', '3'].map(n => <button key={n} onClick={() => handlePress(n)} className={numBtnStyle}>{n}</button>)}
                    <button onClick={handleClear} className={actionBtnStyle}>C</button>

                    {['4', '5', '6'].map(n => <button key={n} onClick={() => handlePress(n)} className={numBtnStyle}>{n}</button>)}
                    <button onClick={handleBackspace} className={actionBtnStyle}><BackspaceIcon className="w-6 h-6" /></button>

                    {['7', '8', '9'].map(n => <button key={n} onClick={() => handlePress(n)} className={numBtnStyle}>{n}</button>)}
                    <button
                        onClick={handleConfirm}
                        className={`${btnStyle} row-span-2 bg-blue-600 text-white font-bold hover:bg-blue-700 focus:ring-blue-500`}
                    >
                        입력
                    </button>

                    <button onClick={() => handlePress('0')} className={`${numBtnStyle} col-span-2`}>0</button>
                    <button onClick={() => handlePress('.')} className={numBtnStyle}>.</button>
                </div>
            </div>
        </div>
    );
};

export default function NGStatusPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isKeypadOpen, setIsKeypadOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);

    const [dates, setDates] = useState({
        from: new Date().toISOString().split("T")[0],
        to: new Date().toISOString().split("T")[0],
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const items = await NGStatusService.getNGStatus(
                dates.from,
                dates.to,
                "D01"
            );

            setData(items);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [dates.from, dates.to]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const [confirmOpen, setConfirmOpen] = useState(false);

    const [confirmData, setConfirmData] = useState<{
        title: string;
        message: string;
        action: "delete" | "reset";
        row: any;
    } | null>(null);

    const [processing, setProcessing] = useState(false);

    // ฟังก์ชันอัปเดตข้อมูล
    const handleUpdateBadQty = async (newQty: string) => {
        if (!selectedRow) return;
        try {
            const result = await NGStatusService.updateWorkOrderNgStatus(selectedRow.badId, Number(newQty));
            if (result.success) {
                alert("อัปเดตข้อมูลสำเร็จ");
                fetchData(); // ดึงข้อมูลใหม่
                setIsKeypadOpen(false);
            } else {
                alert(`เกิดข้อผิดพลาดในการอัปเดต: ${result.message || 'ไม่สามารถอัปเดตได้'}`);
            }
        } catch (error) {
            console.error("API Error on update:", error);
            alert(`เกิดข้อผิดพลาดในการอัปเดต: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    const handleConfirm = async () => {
        if (!confirmData) return;

        setProcessing(true);

        try {
            let result;

            if (confirmData.action === "delete") {
                result = await NGStatusService.deleteNgRecord(
                    confirmData.row.badId
                );
            } else {
                result = await NGStatusService.Resetrework(
                    confirmData.row.badId
                );
            }

            if (result.success) {
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


    const totalNG = data.reduce((acc, curr) => acc + (Number(curr.badQty) || 0), 0);
    const headers = ["เวลา", "เลขล็อต LG", "Model Suffix", "TOOL", "เลขรายการผลิต", "ชื่อรายการผลิต", "ชิ้นส่วนที่ NG", "ประเภทงาน NG", "จำนวนงาน NG", "จำนวนเปลี่ยน", "จำนวนรีเวิร์ค", "ลบงานเปลี่ยน"];

    return (
        <div className="flex flex-col h-full bg-slate-50 p-6 gap-6 overflow-hidden">
            <NumericKeypad
                isOpen={isKeypadOpen}
                onClose={() => setIsKeypadOpen(false)}
                onConfirm={handleUpdateBadQty}
                title="수량 수정"
                initialValue={selectedRow?.badQty}
            />

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 shrink-0">
                {/* ... Header UI เดิมของคุณ ... */}
                <div className="flex items-center gap-3">
                    <input type="date" value={dates.from} onChange={(e) => setDates({ ...dates, from: e.target.value })} className="p-2 border rounded text-sm" />
                    <span className="text-slate-400 font-bold">~</span>
                    <input type="date" value={dates.to} onChange={(e) => setDates({ ...dates, to: e.target.value })} className="p-2 border rounded text-sm" />
                    <button onClick={fetchData} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700">
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                        ค้นหา
                    </button>
                </div>
                <div className="bg-orange-50 px-4 py-2 rounded-lg text-orange-700 font-bold">ยอด NG รวม: {totalNG.toLocaleString()} ชิ้น</div>
            </div>

            <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="h-full overflow-x-auto overflow-y-auto">
                    <table className="min-w-[1400px] w-full text-sm text-left border-collapse">
                        {/* ... Table Header เดิมของคุณ ... */}
                        <thead
                            className="
                                sticky
                                top-0
                                z-30
                                backdrop-blur-xl
                                bg-slate-100/70
                                border-b
                                border-slate-200
                                supports-[backdrop-filter]:bg-slate-100/60
                            "
                        >
                            <tr>
                                {headers.map((h) => <th key={h} className="px-4 py-3 text-center font-semibold text-slate-700 whitespace-nowrap">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.map((row, i) => (
                                <tr key={i} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-4 py-3 text-center text-slate-500 whitespace-nowrap">{row.badTime2}</td>
                                    <td className="px-4 py-3 text-center">{row.lgNo}</td>
                                    <td className="px-4 py-3 text-center">{row.modelSuffix}</td>
                                    <td className="px-4 py-3 text-center">{row.itemMat || "-"}</td>
                                    <td className="px-4 py-3 text-center">{row.cdGItem}</td>
                                    <td className="px-4 py-3 text-center">{row.productName}</td>
                                    <td className="px-4 py-3 text-center">{row.categoryNameENG || "-"}</td>
                                    <td className="px-4 py-3 text-center text-red-600">{row.defectNameENG || "-"}</td>

                                    {/* 💡 จุดที่แก้ไข: ดับเบิ้ลคลิกเพื่อเปิด Keypad */}
                                    <td
                                        className="px-4 py-3 text-center font-bold text-red-600 whitespace-nowrap cursor-pointer hover:bg-red-50 hover:ring-2 hover:ring-red-200 rounded transition-all"
                                        onDoubleClick={() => {
                                            setSelectedRow(row);
                                            setIsKeypadOpen(true);
                                        }}
                                    >
                                        {row.badQty}
                                    </td>

                                    <td className="px-4 py-3 text-center ">{row.icnt || "-"}</td>
                                    <td className="px-4 py-3 text-center ">{row.ocnt || "-"}</td>
                                    <td className="px-2 py-2">
                                        <div className="flex items-center justify-center gap-x-4">
                                            <button
                                                onClick={() => {
                                                    setConfirmData({
                                                        title: "รีเซ็ตงานเปลี่ยน",
                                                        message: "คุณต้องการรีเซ็ตงานเปลี่ยนนี้ใช่หรือไม่?",
                                                        action: "reset",
                                                        row,
                                                    });

                                                    setConfirmOpen(true);
                                                }}
                                                className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-600"
                                            >
                                                <RefreshCcw className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setConfirmData({
                                                        title: "ลบรายการ NG",
                                                        message: "คุณต้องการลบรายการ NG นี้ใช่หรือไม่?",
                                                        action: "delete",
                                                        row,
                                                    });

                                                    setConfirmOpen(true);
                                                }}
                                                className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {confirmOpen && confirmData && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">

                    <div className="w-[520px] overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                        {/* Header */}
                        <div
                            className={`px-6 py-5 text-white ${confirmData.action === "delete"
                                ? "bg-red-600"
                                : "bg-blue-600"
                                }`}
                        >
                            <div className="flex items-center gap-4">

                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                                    {confirmData.action === "delete" ? (
                                        <Trash2 className="h-7 w-7" />
                                    ) : (
                                        <RefreshCcw className="h-7 w-7" />
                                    )}
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

                        {/* Body */}

                        <div className="space-y-5 p-6">

                            <div
                                className={`rounded-xl border p-4 text-center ${confirmData.action === "delete"
                                    ? "border-red-200 bg-red-50"
                                    : "border-blue-200 bg-blue-50"
                                    }`}
                            >
                                <p
                                    className={`font-bold ${confirmData.action === "delete"
                                        ? "text-red-700"
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

                        {/* Footer */}

                        <div className="flex gap-4 border-t bg-slate-100 p-5">

                            <button
                                onClick={() => {
                                    setConfirmOpen(false);
                                    setConfirmData(null);
                                }}
                                className="flex-1 rounded-xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                ยกเลิก
                            </button>

                            <button
                                disabled={processing}
                                onClick={handleConfirm}
                                className={`flex-1 rounded-xl py-3 font-semibold text-white transition
                    ${confirmData.action === "delete"
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-blue-600 hover:bg-blue-700"
                                    }
                    disabled:opacity-50`}
                            >
                                {processing
                                    ? "กำลังดำเนินการ..."
                                    : confirmData.action === "delete"
                                        ? "🗑 ยืนยันการลบ"
                                        : "🔄 ยืนยันการรีเซ็ต"}
                            </button>

                        </div>

                    </div>

                </div>
            )}
        </div>

    );
}