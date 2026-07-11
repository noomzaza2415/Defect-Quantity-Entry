/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DefectService } from "../../../services/defectService";
import { ngService } from "../../../services/ngService"; // ตรวจสอบ Path ให้ถูกต้อง
import {
    categoryTranslations,
    DefectTranslationsSt,
    DefectTranslationsNd,
    DefectTranslationsRd
} from "@/components/ng-dashboard/translations";

interface CategoryItem {
    codeId: string;
    cMaType1: string;
    codeName_TR: string;
    codeName_ENG: string;
}

interface DefectItem {
    codeId: string;
    cMaType1: string;
    codeName_ENG: string;
    codeName_TR: string;
    codeName_MM: string;
    badQty: number;
}

// 1. DefectGrid Component
const DefectGrid = ({
    items,
    totalRows = 8,
    onItemClick,
    getTranslatedName
}: {
    items: DefectItem[],
    totalRows?: number,
    onItemClick: (item: DefectItem) => void,
    getTranslatedName: (englishName: string) => string;
}) => {
    const dummyCount = Math.max(0, totalRows - items.length);
    const dummyBoxes = Array.from({ length: dummyCount });

    return (
        <div
            className="grid grid-cols-1 auto-rows-fr gap-2 min-h-full h-full"
            style={{ minHeight: `${totalRows * 48}px` }}
        >
            {items.map((item) => (
                <div
                    key={item.codeId}
                    onClick={() => onItemClick(item)}
                    className={`min-h-[42px] flex border px-3 justify-between items-center rounded shadow-sm transition-all cursor-pointer select-none active:scale-[0.98] ${item.badQty > 0
                        ? 'bg-red-50 border-red-300 hover:bg-red-100/80'
                        : 'bg-white border-slate-200 hover:bg-slate-50 border-dashed'
                        }`}
                >
                    <div className="flex flex-col mr-2 overflow-hidden">
                        <span className="text-sm font-semibold truncate" title={getTranslatedName(item.codeName_ENG)}>
                            {getTranslatedName(item.codeName_ENG)}
                        </span>
                    </div>
                    <span className={`text-base font-bold shrink-0 px-2 py-0.5 rounded ${item.badQty > 0 ? 'text-red-600 bg-red-100/60' : 'text-slate-500 bg-slate-100'}`}>
                        {item.badQty}
                    </span>
                </div>
            ))}
            {dummyBoxes.map((_, index) => (
                <div
                    key={`dummy-${index}`}
                    className="min-h-[42px] border border-dashed border-slate-200 bg-slate-50/40 rounded opacity-60 pointer-events-none"
                />
            ))}
        </div>
    );
};

// 2. Main DefectPanel Component
export function DefectPanel({
    selectedOrderNo,
    selectedCdGItem,
    eqNo,
    shift,
    onDefectRegistered
}: {
    selectedOrderNo: string | null,
    selectedCdGItem: string | null,
    eqNo: string,
    shift: string,
    onDefectRegistered: () => void;
}) {
    const { t, i18n } = useTranslation();
    const currentLang = (i18n.resolvedLanguage as keyof typeof categoryTranslations[string]) || "en";

    const defectTranslationsByEnglishName = useMemo(() => {
        const allDefects = { ...DefectTranslationsSt, ...DefectTranslationsNd, ...DefectTranslationsRd };
        const map: Record<string, { th: string; mm: string; en: string; kr: string }> = {};
        for (const codeId in allDefects) {
            const entry = allDefects[codeId as keyof typeof allDefects];
            map[entry.en] = entry;
        }
        return map;
    }, []);

    const getTranslatedName = useCallback((englishName: string) => {
        if (typeof englishName !== 'string') return '';
        const key = englishName.trim();
        if (categoryTranslations[key] && categoryTranslations[key][currentLang]) {
            return categoryTranslations[key][currentLang];
        }
        if (defectTranslationsByEnglishName[key] && defectTranslationsByEnglishName[key][currentLang]) {
            return defectTranslationsByEnglishName[key][currentLang];
        }
        return englishName;
    }, [currentLang, defectTranslationsByEnglishName]);

    const [categoryItems1, setCategoryItems1] = useState<CategoryItem[]>([]);
    const [selectedItem1, setSelectedItem1] = useState<CategoryItem | null>(null);
    const [categoryItems2, setCategoryItems2] = useState<CategoryItem[]>([]);
    const [selectedItem2, setSelectedItem2] = useState<CategoryItem | null>(null);
    const [defectSt, setDefectSt] = useState<DefectItem[]>([]);
    const [defectNd, setDefectNd] = useState<DefectItem[]>([]);
    const [defectRd, setDefectRd] = useState<DefectItem[]>([]);

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        item: DefectItem | null;
    }>({ isOpen: false, item: null });

    const [isUpdating, setIsUpdating] = useState<boolean>(false);

    useEffect(() => {
        DefectService.getCategorySt("QM01").then(data => {
            if (data.result) {
                setCategoryItems1(data.result);
                setSelectedItem1(data.result[0] || null);
            }
        });
    }, []);

    useEffect(() => {
        if (!selectedItem1) return;
        DefectService.getCategoryNd(selectedItem1.cMaType1).then(data => {
            if (data.result) setCategoryItems2(data.result);
        });
    }, [selectedItem1]);

    const fetchDefectData = useCallback(async (cMaType: string) => {
        if (!selectedOrderNo) return;
        const [st, nd, rd] = await Promise.all([
            DefectService.getDefectList("GetDefectStAsync", cMaType, selectedOrderNo),
            DefectService.getDefectList("GetDefectNdAsync", cMaType, selectedOrderNo),
            DefectService.getDefectList("GetDefectRdAsync", cMaType, selectedOrderNo),
        ]);
        setDefectSt(st?.result || []);
        setDefectNd(nd?.result || []);
        setDefectRd(rd?.result || []);
    }, [selectedOrderNo]);

    useEffect(() => {
        if (selectedItem1) {
            fetchDefectData(selectedItem1.codeId);
            setSelectedItem2(null);
        }
    }, [selectedItem1, fetchDefectData]);

    const handleConfirmUpdate = async () => {
        if (!modalConfig.item || !selectedOrderNo) return;

        const currentItem = modalConfig.item;
        setIsUpdating(true);

        const payload = {
            cdEquip: eqNo,
            noWkOrd: selectedOrderNo,
            cdGItem: selectedCdGItem || "",
            cdBadss: currentItem.codeId,
            cdProce: "ASSY",
            idWkOrd: shift, // 💡 แก้ไข: idWkOrd จะมีค่าเท่ากับ Shift ที่ส่งมา
            logUser: "SYSTEM",
            badQty: null,
            kdBad: null,
            labelId: null,
            lotNo: null,
            cdCause: null,
            kdRep: null,
            cdRoute: null,
            cdEmplo: null,
            remarks: null
        };

        // console.log("Payload for registerNgOrder:", payload);
        const result = await ngService.registerNgOrder(payload);

        if (result.isSuccess) {
            const updateList = (list: DefectItem[]) =>
                list.map(i => i.codeId === currentItem.codeId ? { ...i, badQty: currentItem.badQty + 1 } : i);

            setDefectSt(prev => updateList(prev));
            setDefectNd(prev => updateList(prev));
            setDefectRd(prev => updateList(prev));

            setModalConfig({ isOpen: false, item: null });

            // Notify the parent component that a defect has been registered,
            // so it can refetch the main order data to update the total NG count.
            onDefectRegistered();
        } else {
            alert(t('errorSaving') || "Error saving data");
        }

        setIsUpdating(false);
    };

    const maxRows = Math.max(defectSt.length, defectNd.length, defectRd.length, 8);

    return (
        <div className="h-full w-full overflow-x-auto bg-white border-t min-h-0 flex flex-col relative">
            <div className="flex flex-1 h-full min-w-[100px] min-h-0">
                {/* Column 1 */}
                <div className="flex-1 overflow-y-auto border-r min-w-[160px] h-full bg-slate-50">
                    {categoryItems1.map((item) => {
                        const isSelected = selectedItem1?.codeId === item.codeId;
                        return (
                            <button
                                key={item.codeId}
                                onClick={() => { setSelectedItem1(item); setSelectedItem2(null); }}
                                className={`w-full p-4 border-b text-center transition-all duration-200 font-medium ${isSelected
                                    ? "bg-blue-600 text-white shadow-md border-l-4 border-l-blue-900"
                                    : "bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700"
                                    }`}
                            >
                                <span className="text-sm">{getTranslatedName(item.codeName_ENG)}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Column 2 */}
                <div className="flex-1 overflow-y-auto border-r min-w-[160px] h-full bg-slate-50">
                    {categoryItems2.map((item) => {
                        const isSelected = selectedItem2?.codeId === item.codeId;
                        return (
                            <button
                                key={item.codeId}
                                onClick={() => { setSelectedItem2(item); setSelectedItem1(null); fetchDefectData(item.codeId); }}
                                className={`w-full p-4 border-b text-center transition-all duration-200 font-medium ${isSelected
                                    ? "bg-blue-600 text-white shadow-md border-l-4 border-l-blue-900" // แก้ไขจาก teal เป็น blue
                                    : "bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700" // แก้ไข hover ให้ตรงกัน
                                    }`}
                            >
                                <span className="text-sm">{getTranslatedName(item.codeName_ENG)}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex-[2] flex flex-col h-full overflow-hidden border-r min-w-[220px] min-h-0">
                    <div className="p-2 bg-red-800 text-white text-center font-bold text-base shadow-sm shrink-0">{t('ngSt')}</div>
                    <div className="flex-1 overflow-y-auto p-2 min-h-0">
                        <DefectGrid items={defectSt} totalRows={maxRows} onItemClick={(item) => setModalConfig({ isOpen: true, item })} getTranslatedName={getTranslatedName} />
                    </div>
                </div>

                <div className="flex-[2] flex flex-col h-full overflow-hidden border-r min-w-[220px] min-h-0">
                    <div className="p-2 bg-red-800 text-white text-center font-bold text-base shadow-sm shrink-0">{t('ngNd')}</div>
                    <div className="flex-1 overflow-y-auto p-2 min-h-0">
                        <DefectGrid items={defectNd} totalRows={maxRows} onItemClick={(item) => setModalConfig({ isOpen: true, item })} getTranslatedName={getTranslatedName} />
                    </div>
                </div>

                <div className="flex-[2] flex flex-col h-full overflow-hidden border-r min-w-[220px] min-h-0">
                    <div className="p-2 bg-red-800 text-white text-center font-bold text-base shadow-sm shrink-0">{t('ngRd')}</div>
                    <div className="flex-1 overflow-y-auto p-2 min-h-0">
                        <DefectGrid items={defectRd} totalRows={maxRows} onItemClick={(item) => setModalConfig({ isOpen: true, item })} getTranslatedName={getTranslatedName} />
                    </div>
                </div>
            </div>

            {modalConfig.isOpen && modalConfig.item && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="bg-red-800 text-white px-5 py-3.5"><h3 className="font-bold text-lg">{t('confirmSaveNG')}</h3></div>
                        <div className="p-6 text-center">
                            <p className="text-slate-600 mb-3">{t('confirmIncrease')}</p>
                            <p className="text-xl font-bold text-slate-800 mb-6 bg-slate-100 py-2.5 px-3 rounded border border-slate-200">
                                {getTranslatedName(modalConfig.item.codeName_ENG)}
                            </p>
                            <div className="flex items-center justify-center gap-4 text-lg font-semibold mb-2 bg-red-50 p-3 rounded-lg border border-red-100">
                                <span className="text-slate-500">{t('currentQty')} <strong className="text-slate-700 text-2xl">{modalConfig.item.badQty}</strong></span>
                                <span className="text-red-500 font-bold">➔</span>
                                <span className="text-red-600">{t('newQty')} <strong className="text-red-600 text-2xl underline">{modalConfig.item.badQty + 1}</strong></span>
                            </div>
                        </div>
                        <div className="flex border-t bg-slate-50 p-3 gap-2">
                            <button onClick={() => setModalConfig({ isOpen: false, item: null })} className="flex-1 px-4 py-2.5 rounded border border-slate-300 bg-white hover:bg-slate-100">
                                {t('cancel')}
                            </button>
                            <button disabled={isUpdating} onClick={handleConfirmUpdate} className="flex-1 px-4 py-2.5 rounded bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50">
                                {isUpdating ? t('saving') : t('confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}