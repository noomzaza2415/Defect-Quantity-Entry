/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";

interface FilterBarProps {
  onSearch: (
    from: string,
    to: string,
    eqNo: string,
    combinedData: string
  ) => void;
  onSave?: () => void;
  totalNG?: number;
}

export function FilterBar({
  onSearch,
  onSave,
  totalNG = 0,
}: FilterBarProps) {
  const { t } = useTranslation();

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  const [dates, setDates] = useState({
    from: getTodayDate(),
    to: getTodayDate(),
  });

  const [selectedMachine, setSelectedMachine] = useState<string>("D1");
  const [selectedShift, setSelectedShift] = useState<string>("A");

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ป้องกันการยิง API ซ้ำตอนเปิดหน้าเว็บครั้งแรก
  const isFirstMount = useRef(true);

  const machineOptions = [
    { value: "D1", label: "D01" },
    { value: "D2", label: "D02" },
    { value: "D3", label: "D03" },
    { value: "D5", label: "Selant-01" },
    { value: "D6", label: "Selant-02" },
  ];

  const shifts = ["A", "B"];

  const getApiEqNo = (mac: string) => {
    if (mac.startsWith("D")) {
      return `D${mac.substring(1).padStart(2, "0")}`;
    }
    return mac;
  };

  const triggerSearch = useCallback(
    (machine: string, shift: string, fromDate: string, toDate: string) => {
      const targetApiEqNo = getApiEqNo(machine);
      const targetCombined = `${machine}_${shift}`;

      setIsLoading(true);
      // ส่งค่า Filter กลับไปให้ Parent Component โหลดข้อมูล
      onSearch(fromDate, toDate, targetApiEqNo, targetCombined);

      // ให้ Parent เป็นคนจัดการการปิด Loading ผ่าน props หรือ State 
      // ในที่นี้เราจำลองปิด Loading หลังจากยิงไปแล้ว
      setTimeout(() => setIsLoading(false), 500);
    },
    [onSearch]
  );

  // 1. ค้นหาครั้งแรกเมื่อโหลด Component
  useEffect(() => {
    if (isFirstMount.current) {
      triggerSearch(selectedMachine, selectedShift, dates.from, dates.to);
      isFirstMount.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMachineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMachine = e.target.value;
    if (newMachine !== selectedMachine) {
      setSelectedMachine(newMachine);
      triggerSearch(newMachine, selectedShift, dates.from, dates.to);
    }
  };

  const handleShiftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newShift = e.target.value;
    if (newShift !== selectedShift) {
      setSelectedShift(newShift);
      triggerSearch(selectedMachine, newShift, dates.from, dates.to);
    }
  };

  const handleSearchClick = () => {
    triggerSearch(selectedMachine, selectedShift, dates.from, dates.to);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white border-b">
      <div className="flex flex-wrap items-center justify-between gap-4">

        <div className="flex flex-wrap items-center gap-4">

          {/* 1. เลือกวันที่ */}
          <div className="flex items-center border border-slate-200 rounded-lg bg-white shadow-sm px-2 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <input
              type="date"
              value={dates.from}
              onChange={(e) => setDates({ ...dates, from: e.target.value })}
              className="bg-transparent text-sm text-slate-600 font-medium px-2 outline-none w-32 cursor-pointer"
            />
            <span className="text-slate-300 font-light px-1">|</span>
            <input
              type="date"
              value={dates.to}
              onChange={(e) => setDates({ ...dates, to: e.target.value })}
              className="bg-transparent text-sm text-slate-600 font-medium px-2 outline-none w-32 cursor-pointer"
            />
          </div>

          {/* 2. เลือกเครื่อง และ เลือกกะ */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-50/80 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-700 mr-1">{t("machine")} :</span>
              <div className="flex flex-wrap gap-2">
                {machineOptions.map((mac) => {
                  const isSelected = selectedMachine === mac.value;
                  return (
                    <label key={mac.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="machineSelection"
                        value={mac.value}
                        checked={isSelected}
                        onChange={handleMachineChange}
                        className="sr-only"
                      />
                      <div
                        className={`px-5 py-2 min-w-[5.5rem] text-sm rounded-lg border transition-all duration-200 select-none active:scale-95 flex items-center justify-center ${isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-md font-bold ring-2 ring-blue-200 ring-offset-1"
                            : "bg-white border-slate-300 text-slate-600 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-900 font-medium"
                          }`}
                      >
                        {mac.label}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-slate-300 mx-2"></div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-700 mr-1">{t("shift")} :</span>
              <div className="flex gap-2">
                {shifts.map((shift) => {
                  const isSelected = selectedShift === shift;
                  return (
                    <label key={shift} className="cursor-pointer">
                      <input
                        type="radio"
                        name="shiftSelection"
                        value={shift}
                        checked={isSelected}
                        onChange={handleShiftChange}
                        className="sr-only"
                      />
                      <div
                        className={`px-6 py-2 min-w-[4.5rem] text-sm rounded-lg border transition-all duration-200 select-none active:scale-95 flex items-center justify-center ${isSelected
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-md font-bold ring-2 ring-emerald-200 ring-offset-1"
                            : "bg-white border-slate-300 text-slate-600 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-900 font-medium"
                          }`}
                      >
                        {shift}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

          {/* 3. ปุ่มค้นหา และ ปุ่มบันทึก */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSearchClick}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm active:scale-95 disabled:opacity-50 text-sm flex items-center justify-center"
            >
              {isLoading ? t("searching") : t("search")}
            </button>
          </div>

        </div>

        {/* ยอดรวม NG (รับค่าผ่าน totalNG ที่ส่งมาจาก Parent) */}
        <div className="flex items-center gap-3 bg-red-50/80 border border-red-200 px-5 py-2.5 rounded-xl shadow-sm">
          <span className="text-xs text-slate-500 font-medium">{t("totalNGAll")}</span>
          <span className="text-xl font-bold text-red-600">
            {totalNG.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-slate-600">{t("itemsUnit")}</span>
        </div>

      </div>
    </div>
  );
}