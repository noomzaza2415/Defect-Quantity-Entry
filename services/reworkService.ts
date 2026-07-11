// แนะนำให้ย้าย TOKEN ไปไว้ในไฟล์ .env ในอนาคตครับ
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJmZTZhMzRmOS0xZDc1LTQyMmUtYmViNi1kOGU0YWVhZDJlODEiLCJ1bmlxdWVfbmFtZSI6InVzZXJAZG9uZ2ppbmUuY29tIiwicm9sZSI6InVzZXIiLCJuYmYiOjE3Nzk1MTk4NDIsImV4cCI6MTc4NzI5NTg0MiwiaWF0IjoxNzc5NTE5ODQyfQ.MLGjvSdfJFevbuK_J7ifJVhf6BlI48g5UyoVtb7LDqM";

// อัปเดต BASE_URL เป็น Port 9029 และชี้ไปที่ Controller WorkOrder
const BASE_URL = "http://192.168.2.5:9029/api/ng-rework";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${TOKEN}`,
};

export interface RegisterReworkPayload {
  badId: string | number;
  cdEquip: string;
  cdGItem: string;
  kdBad: "I" | "O" | "X";
  cdCause: string;
  badQty: number;
  remarks: string;
  logUser: string;
}

export const ReworkService = {
  /**
   * ดึงข้อมูล Work Order NG
   * @param fromDate วันที่เริ่มต้น (YYYY-MM-DD)
   * @param toDate วันที่สิ้นสุด (YYYY-MM-DD)
   * @param eqNo หมายเลขเครื่องจักร (ค่าเริ่มต้น 'D01')
   */
  async getWorkOrders(fromDate: string, toDate: string, eqNo: string = "D01") {
    // เปลี่ยนพารามิเตอร์เป็น cdEquip, from_date และ to_date ตาม API เส้นใหม่
    const url = `${BASE_URL}/pending/d?cdEquip=${eqNo}&from_date=${fromDate}&to_date=${toDate}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Error fetching work orders: ${response.statusText}`);
    }

    return response.json();
  },

  async registerRework(payload: RegisterReworkPayload) {
    const response = await fetch(
      "http://192.168.2.5:9029/api/ng-rework/register-rework",
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  },
};
