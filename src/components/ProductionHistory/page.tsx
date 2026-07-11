/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useCallback, useEffect } from "react";
import { Search, Loader2, Plus, Minus } from "lucide-react";
import { HistoryService } from "../../../services/HistoryService";

// Import Service ที่เราแยกไว้ (ตรวจสอบ path ให้ตรงกับโฟลเดอร์ของคุณ)


export default function NGStatusPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState({
    from: new Date().toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  const [qtyMap, setQtyMap] = useState<Record<number, number>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // เรียกใช้ API ผ่าน Service
      const json = await HistoryService.getNGStatus(dates.from, dates.to);
      setData(json.result || []);
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
  
  const headers = ["เลขล็อต LG", "Model Suffix", "เลขรายการผลิต", "TOOL", "จำนวนตามแพลน", "จำนวนผลิตจริง", "จำนวนงานค้าง", "จำนวนงานเสีย", "จำนวนงานที่รีเวิร์ค", "วันที่ตามแพลน", "หมายเลขคำสั่ง", "หมายเหตุ"];

  const handleIncrease = (index: number) => {
    setQtyMap(prev => ({ ...prev, [index]: (prev[index] || 0) + 1 }));
  };

  const handleDecrease = (index: number) => {
    setQtyMap(prev => ({ ...prev, [index]: Math.max(0, (prev[index] || 0) - 1) }));
  };

  // ฟังก์ชันช่วยจัดการรูปแบบวันที่ให้สวยงาม (ลบตัว T ออก)
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return dateString.replace("T", " ").split(".")[0];
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden p-4 bg-slate-50 gap-4">
      
      {/* ส่วนค้นหา */}
      <div className="flex-none flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
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
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          ค้นหา
        </button>
        <div className="ml-auto font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-100 whitespace-nowrap">
          ยอด NG รวม: {totalNG.toLocaleString()} ชิ้น
        </div>
      </div>

      {/* ตาราง */}
      <div className="flex-1 overflow-auto bg-white rounded-xl border border-slate-200 shadow-sm relative">
        <table className="w-full text-sm text-left border-collapse min-w-[1400px]">
          <thead className="bg-slate-100 border-b sticky top-0 z-10 shadow-sm">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 text-center font-semibold text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={12} className="text-center p-10 text-slate-400">กำลังโหลดข้อมูล...</td></tr>
            ) : data.length > 0 ? (
              data.map((row, i) => (
                <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-4 py-3 text-center whitespace-nowrap">{row.lgNo || "-"}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">{row.modelSuffix || "-"}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">{row.cdGItem || "-"}</td>
                  <td className="px-4 py-3 text-indigo whitespace-nowrap">{row.nmGItem || "-"}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">{row.orderQty || "0"}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">{row.prodQty || "0"}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">{row.backlog || row.remainQty || "0"}</td>
                  <td className="px-4 py-3 text-center font-bold text-red-600 whitespace-nowrap">{row.badQty || "0"}</td>
                  
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={() => handleDecrease(i)} 
                        type="button"
                        className="w-8 h-8 border border-slate-300 rounded-l-md flex items-center justify-center hover:bg-slate-100 active:bg-slate-200"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="text"
                        value={qtyMap[i] || 0}
                        readOnly 
                        className="w-16 h-8 text-center border-y border-slate-300 focus:outline-none cursor-default bg-white"
                      />
                      <button 
                        onClick={() => handleIncrease(i)} 
                        type="button"
                        className="w-8 h-8 border border-slate-300 rounded-r-md flex items-center justify-center hover:bg-slate-100 active:bg-slate-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {formatDate(row.lgStart)}
                  </td>
                  
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.noWkOrd || "-"}</td>
                  
                  <td className="px-4 py-3 min-w-[200px]">
                    <textarea
                      placeholder="พิมพ์หมายเหตุ..."
                      rows={2}
                      className="w-full border border-slate-300 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm overflow-y-auto h-[60px]"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={12} className="text-center p-10 text-slate-400">ไม่พบข้อมูล</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}