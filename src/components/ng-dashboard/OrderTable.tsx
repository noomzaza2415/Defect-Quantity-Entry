/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from "react-i18next";

interface OrderTableProps {
  data: any[];
  selectedOrder: any | null;
  onRowClick: (row: any) => void;
}

export function OrderTable({ data, selectedOrder, onRowClick }: OrderTableProps) {
  const { t } = useTranslation();

  const headers = [
    t('lotNo'),
    t('modelSuffix'),
    t('tool'),
    t('productNo'),
    t('orderNo'),
    t('planQty'),
    t('actualQty'),
    t('badQty'),
  ];

  return (
    <div className="w-full h-[165px] border rounded-lg overflow-y-scroll overflow-x-auto bg-white relative">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-slate-100 z-10 shadow-sm">
          <tr>
            {headers.map(h => (
              <th key={h} className="px-4 py-3 text-center border-b font-semibold text-slate-700 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map((row, i) => (
            <tr 
              key={i} 
              onClick={() => onRowClick(row)} 
              // 3. ใส่เงื่อนไขสีพื้นหลัง: ถ้าแถวนี้ถูกเลือกให้เป็น bg-blue-100 (หรือสีที่คุณชอบ)
              className={`border-b cursor-pointer transition-colors ${
                selectedOrder?.noWkOrd === row.noWkOrd ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-slate-50"
              }`}
            >
              <td className="px-4 py-2 text-center whitespace-nowrap">{row.lgNo}</td>
              <td className="px-4 py-2 text-center whitespace-nowrap">{row.modelSuffix}</td>
              <td className="px-4 py-2 text-center whitespace-nowrap">{row.itemMat}</td>
              <td className="px-4 py-2 text-center whitespace-nowrap">{row.nmGItem}</td>
              <td className="px-4 py-2 text-center whitespace-nowrap">{row.noWkOrd}</td>
              <td className="px-4 py-2 text-center whitespace-nowrap">{row.orderQty}</td>
              <td className="px-4 py-2 text-center whitespace-nowrap">{row.prodQty}</td>
              <td className="px-4 py-2 text-center whitespace-nowrap text-red-600 font-bold">{row.badQty}</td>
            </tr>
          )) : (
            <tr>
              <td colSpan={8} className="p-8 text-center text-slate-400">{t('noData')}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}