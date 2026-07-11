import dayjs from "dayjs";

// 📌 1. กำหนดค่าคงที่ของ API ไว้ที่จุดเดียว
export const API_CONFIG = {
  NG_BASE_URL: "http://192.168.2.5:9029/api/v1/Ng",
  WO_9029_BASE_URL: "http://192.168.2.5:9029/api/v1/WorkOrder",
  NEW_WO_BASE_URL: "http://192.168.2.5:9091/api/v1/Crud",
  IDLETIME_BASE_URL: "http://192.168.2.5:5053/api/v1/IdleTime",
  BEARER_TOKEN:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJmZTZhMzRmOS0xZDc1LTQyMmUtYmViNi1kOGU0YWVhZDJlODEiLCJ1bmlxdWVfbmFtZSI6InVzZXJAZG9uZ2ppbmUuY29tIiwicm9sZSI6InVzZXIiLCJuYmYiOjE3Nzk1MTk4NDIsImV4cCI6MTc4NzI5NTg0MiwiaWF0IjoxNzc5NTE5ODQyfQ.MLGjvSdfJFevbuK_J7ifJVhf6BlI48g5UyoVtb7LDqM",
};

// ฮีลเปอร์สำหรับใส่ Header อัตโนมัติ
const getHeaders = () => ({
  Authorization: `Bearer ${API_CONFIG.BEARER_TOKEN}`,
  "Content-Type": "application/json",
});

// 📌 3. สร้าง Helper Function สำหรับเรียก Work Order เพื่อลดการเขียนโค้ดซ้ำซ้อน
const fetchWorkOrders = async (
  eqNo: string,
  frmDate: string,
  toDate: string,
  caller: string,
) => {
  try {
    const queryParams = new URLSearchParams({
      eqNo: eqNo,
      changed: "2",
      frmDate: frmDate,
      toDate: toDate,
    });

    const url = `${API_CONFIG.NEW_WO_BASE_URL}/GetOnWorkOrderAssyQueryAsync?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.error(
        `[API 9091 Error] ${caller} returned status ${response.status}`,
      );
      return { result: [] }; // คืนค่า Default ที่มีโครงสร้างเดียวกับ API จริง
    }
    return await response.json();
  } catch (error) {
    console.error(`[Fetch Error 9091] ${caller}: `, error);
    return { result: [] }; // คืนค่า Default เมื่อเกิดข้อผิดพลาด
  }
};
// 📌 2. รวมฟังก์ชันการยิง API ทั้งหมดของระบบ NG และ Production Status
export const ngService = {
  /**
   * ดึงข้อมูล Work Order NG ตามเครื่องจักรและช่วงวันที่ (พอร์ต 9029) - ทำงานปกติเสถียร 100%
   */
  getWorkOrdersNg: async (
    cdEquip: string,
    frmDateStr: string,
    toDateStr: string,
  ) => {
    const queryParams = new URLSearchParams({
      cdEquip: cdEquip,
      from_date: frmDateStr,
      to_date: toDateStr,
    });

    const response = await fetch(
      `${API_CONFIG.WO_9029_BASE_URL}/GetWorkOrderNgAsync?${queryParams.toString()}`,
      {
        method: "GET",
        headers: getHeaders(),
      },
    );

    if (!response.ok)
      throw new Error("ไม่สามารถดึงข้อมูล Work Order NG ได้ (พอร์ต 9029)");
    return response.json();
  },

  /**
   * อัปเดตจำนวน NG (พอร์ต 9029)
   */
  updateNgQty: async (badId: number | string, badQty: number) => {
    try {
      const response = await fetch(
        `${API_CONFIG.WO_9029_BASE_URL}/UpdateWorkOrderNgStatusAsync`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({
            badId: badId,
            badQty: badQty,
          }),
        },
      );

      return { isSuccess: response.ok, status: response.status };
    } catch (error) {
      console.error("[API Error] updateNgQty:", error);
      return { isSuccess: false, error };
    }
  },

  /**
   * ลบรายการ NG (พอร์ต 9029)
   */
  deleteNgRecord: async (badId: number | string) => {
    try {
      const queryParams = new URLSearchParams({ badId: String(badId) });
      const response = await fetch(
        `${API_CONFIG.WO_9029_BASE_URL}/DeleteWorkOrderNgAsync?${queryParams.toString()}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        },
      );

      return { isSuccess: response.ok, status: response.status };
    } catch (error) {
      console.error("[API Error] deleteNgRecord:", error);
      return { isSuccess: false, error };
    }
  },

  /**
   * 🛡️ [Safe-Guard] ดึงข้อมูลแผนผลิตตามไลน์และวันที่ (พอร์ต 9091)
   */
  getWorkOrders: async (targetLine: string, fromDateTime: dayjs.Dayjs, toDateTime: dayjs.Dayjs) => {
    const frmDate = fromDateTime.startOf('day').format("YYYY-MM-DD HH:mm:ss");
    const toDate = toDateTime.endOf('day').format("YYYY-MM-DD HH:mm:ss");
    console.log("========== API Request: getWorkOrders ==========");
    console.log("Line     :", targetLine);
    console.log("frmDate  :", frmDate);
    console.log("toDate   :", toDate);
    return fetchWorkOrders(targetLine, frmDate, toDate, "getWorkOrders");
  },

  /**
   * ดึงโครงสร้างหมวดหมู่ชิ้นงาน (Category St, Nd, Rd)
   */
  getCategories: async (cMaType = "QM01") => {
    const [resSt, resNd, resRd] = await Promise.all([
      fetch(`${API_CONFIG.NG_BASE_URL}/GetCategoryStAsync?cMaType=${cMaType}`, {
        headers: getHeaders(),
      }),
      fetch(`${API_CONFIG.NG_BASE_URL}/GetCategoryNdAsync?cMaType=${cMaType}`, {
        headers: getHeaders(),
      }),
      fetch(`${API_CONFIG.NG_BASE_URL}/GetCategoryRdAsync?cMaType=${cMaType}`, {
        headers: getHeaders(),
      }),
    ]);

    return {
      st: resSt.ok ? await resSt.json() : null,
      nd: resNd.ok ? await resNd.json() : null,
      rd: resRd.ok ? await resRd.json() : null,
    };
  },

  /**
   * ดึงรายการอาการเสียย่อย (Defect St, Nd, Rd) ตามรหัสกลุ่มและ Work Order
   */
  getDefects: async (targetCode: string, workOrderNo: string) => {
    const [resSt, resNd, resRd] = await Promise.all([
      fetch(
        `${API_CONFIG.NG_BASE_URL}/GetDefectStAsync?cMaType=${targetCode}&noWkOrd=${workOrderNo}`,
        { headers: getHeaders() }
      ),
      fetch(
        `${API_CONFIG.NG_BASE_URL}/GetDefectNdAsync?cMaType=${targetCode}&noWkOrd=${workOrderNo}`,
        { headers: getHeaders() }
      ),
      fetch(
        `${API_CONFIG.NG_BASE_URL}/GetDefectRdAsync?cMaType=${targetCode}&noWkOrd=${workOrderNo}`,
        { headers: getHeaders() }
      ),
    ]);

    return {
      st: resSt.ok ? await resSt.json() : null,
      nd: resNd.ok ? await resNd.json() : null,
      rd: resRd.ok ? await resRd.json() : null,
    };
  },

  /**
   * 🛡️ [Safe-Guard] ดึงข้อมูลสถานะการผลิตประจำวันของไลน์ที่ระบุ (พอร์ต 9091)
   * สำหรับหน้า Production Status Monitor
   */
  getProductionStatus: async (eqNo: string, targetDate: string) => {
    const frmDate = `${targetDate} 00:00:00`;
    const toDate = `${targetDate} 23:59:59`;
    return fetchWorkOrders(eqNo, frmDate, toDate, "getProductionStatus");
  },

  /**
   * 🛡️ [Safe-Guard] ดึงข้อมูลประวัติการผลิตย้อนหลังแยกตามช่วงวันที่และไลน์ผลิต (พอร์ต 9091)
   */
  getProductionHistory: async (
    eqNo: string,
    frmDateStr: string,
    toDateStr: string,
  ) => {
    const frmDate = dayjs(frmDateStr).startOf('day').format("YYYY-MM-DD HH:mm:ss");
    const toDate = dayjs(toDateStr).endOf('day').format("YYYY-MM-DD HH:mm:ss");
    return fetchWorkOrders(eqNo, frmDate, toDate, "getProductionHistory");
  },

  /**
   * 🛡️ [Safe-Guard] ดึงข้อมูลสำหรับระบบจัดการเปลี่ยนชิ้นงานและงานรีเวิร์คยึดเวลาเต็มวัน (พอร์ต 9091)
   */
  getDowntimeWorkOrders: async (
    eqNo: string,
    frmDateStr: string,
    toDateStr: string,
  ) => {
    const frmDate = dayjs(frmDateStr).startOf('day').format("YYYY-MM-DD HH:mm:ss");
    const toDate = dayjs(toDateStr).endOf('day').format("YYYY-MM-DD HH:mm:ss");
    return fetchWorkOrders(eqNo, frmDate, toDate, "getDowntimeWorkOrders");
  },
  /**
   * ดึงข้อมูล Machine Downtime
   */
  getLineIdleTime: async (
    dateFrom: string,
    dateTo: string,
    cdEquip: string = "ALL",
  ) => {
    try {
      const queryParams = new URLSearchParams({
        dateFrom,
        dateTo,
        cdEquip,
      });

      const response = await fetch(
        `${API_CONFIG.IDLETIME_BASE_URL}/GetLineIdleTimeDtoAsync?${queryParams.toString()}`,
        {
          method: "GET",
          headers: getHeaders(),
        },
      );

      if (!response.ok) {
        console.error(
          `[API 5053 Error] getLineIdleTime returned status ${response.status}`,
        );
        return [];
      }

      const data = await response.json();

      return data.result || [];
    } catch (error) {
      console.error("[Fetch Error 5053] getLineIdleTime:", error);

      return [];
    }
  },

  /**
   * บันทึกรายการ NG ใหม่ (พอร์ต 9029)
   */
  saveDefect: async (payload: {
    noWkOrd: string;
    codeId: string;
    badQty: number;
  }) => {
    try {
      const response = await fetch(`${API_CONFIG.NG_BASE_URL}/SaveDefectAsync`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return { isSuccess: response.ok, status: response.status };
    } catch (error) {
      console.error("[API Error] saveDefect:", error);
      return { isSuccess: false, error };
    }
  },

  /**
   * ลงทะเบียนรายการ NG ใหม่สำหรับ Rework/Change (พอร์ต 9029)
   * @param payload ข้อมูล NG ที่จะลงทะเบียน
   */
  registerNgOrder: async (payload: {
    cdEquip: string;
    noWkOrd: string;
    cdGItem: string;
    cdBadss: string;
    cdProce: string;
    idWkOrd: string;
    logUser: string;
    badQty?: number | null;
    kdBad?: string | null;
    labelId?: string | null;
    lotNo?: string | null;
    cdCause?: string | null;
    kdRep?: string | null;
    cdRoute?: string | null;
    cdEmplo?: string | null;
    remarks?: string | null;
  }) => {
    try {
      const response = await fetch(`${API_CONFIG.NG_BASE_URL}/RegisterNgOrderAsync`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const responseData = await response.json();
      return { isSuccess: response.ok, status: response.status, data: responseData };
    } catch (error) {
      console.error("[API Error] registerNgOrder:", error);
      return { isSuccess: false, error };
    }
  },
};