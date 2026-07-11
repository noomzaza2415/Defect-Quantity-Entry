// src/services/ngStatusService.ts

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJmZTZhMzRmOS0xZDc1LTQyMmUtYmViNi1kOGU0YWVhZDJlODEiLCJ1bmlxdWVfbmFtZSI6InVzZXJAZG9uZ2ppbmUuY29tIiwicm9sZSI6InVzZXIiLCJuYmYiOjE3Nzk1MTk4NDIsImV4cCI6MTc4NzI5NTg0MiwiaWF0IjoxNzc5NTE5ODQyfQ.MLGjvSdfJFevbuK_J7ifJVhf6BlI48g5UyoVtb7LDqM";
const BASE_URL = "http://192.168.2.5:9091/api/v1/Crud";

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${TOKEN}`
};

export const HistoryService = {
  /**
   * ดึงข้อมูลสถานะ NG
   * @param fromDate วันที่เริ่มต้น (YYYY-MM-DD)
   * @param toDate วันที่สิ้นสุด (YYYY-MM-DD)
   * @param eqNo เครื่องจักร (ค่าเริ่มต้น 'D01')
   */
  async getNGStatus(fromDate: string, toDate: string, eqNo: string = "D01") {
    const url = `${BASE_URL}/GetOnWorkOrderAssyQueryAsync?eqNo=${eqNo}&changed=2&frmDate=${fromDate}&toDate=${toDate}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Error fetching NG status: ${response.statusText}`);
    }

    return response.json();
  }
};