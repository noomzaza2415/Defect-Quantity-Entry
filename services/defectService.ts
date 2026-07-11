// services/defectService.ts
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJmZTZhMzRmOS0xZDc1LTQyMmUtYmViNi1kOGU0YWVhZDJlODEiLCJ1bmlxdWVfbmFtZSI6InVzZXJAZG9uZ2ppbmUuY29tIiwicm9sZSI6InVzZXIiLCJuYmYiOjE3Nzk1MTk4NDIsImV4cCI6MTc4NzI5NTg0MiwiaWF0IjoxNzc5NTE5ODQyfQ.MLGjvSdfJFevbuK_J7ifJVhf6BlI48g5UyoVtb7LDqM";

const BASE_URL = "http://192.168.2.5:9029/api/v1/Ng";
const CRUD_URL = "http://192.168.2.5:9091/api/v1/Crud";
const WO_URL = "http://192.168.2.5:9029/api/ng-rework";

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

export const DefectService = {
  async getCategorySt(cMaType: string) {
    const res = await fetch(`${BASE_URL}/GetCategoryStAsync?cMaType=${cMaType}`, { headers });
    return res.json();
  },

  async getCategoryNd(cMaType: string) {
    const res = await fetch(`${BASE_URL}/GetCategoryNdAsync?cMaType=${cMaType}`, { headers });
    return res.json();
  },

  async getDefectList(endpoint: string, cMaType: string, noWkOrd: string) {
    const url = `${BASE_URL}/${endpoint}?cMaType=${cMaType}&noWkOrd=${noWkOrd}`;
    const res = await fetch(url, { headers });
    return res.json();
  },

  async saveDefect(payload: { noWkOrd: string; codeId: string; badQty: number }) {
    const res = await fetch(`${BASE_URL}/SaveDefectAsync`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    return res.ok;
  },

  async getOnWorkOrder(eqNo: string, frmDate: string, toDate: string) {
    const url = `${CRUD_URL}/GetOnWorkOrderAssyQueryAsync?eqNo=${eqNo}&changed=2&frmDate=${frmDate}&toDate=${toDate}`;
    const res = await fetch(url, { headers });
    return res.json();
  },

  async getOnWorkOrder2(eqNo: string, frmDate: string, toDate: string) {
    const url = `${WO_URL}/orders?cdEquip=${eqNo}&fromDate=${frmDate}&toDate=${toDate}`;
    const res = await fetch(url, { headers });
    return res.json();
  }
  
};