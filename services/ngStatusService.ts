// src/services/ngStatusService.ts

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJmZTZhMzRmOS0xZDc1LTQyMmUtYmViNi1kOGU0YWVhZDJlODEiLCJ1bmlxdWVfbmFtZSI6InVzZXJAZG9uZ2ppbmUuY29tIiwicm9sZSI6InVzZXIiLCJuYmYiOjE3Nzk1MTk4NDIsImV4cCI6MTc4NzI5NTg0MiwiaWF0IjoxNzc5NTE5ODQyfQ.MLGjvSdfJFevbuK_J7ifJVhf6BlI48g5UyoVtb7LDqM";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${TOKEN}`,
};

export const NGStatusService = {
  async getNGStatus(
    fromDate: string,
    toDate: string,
    eqNo = "D01"
  ) {
    const url =
      `http://192.168.2.5:9029/api/ng-rework/list` +
      `?cdEquip=${eqNo}` +
      `&fromDate=${fromDate}` +
      `&toDate=${toDate}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const result = await response.json();

    return result?.data?.items ?? [];
  },

  async updateWorkOrderNgStatus(badId: string | number, badQty: number) {
    const response = await fetch(
      "http://192.168.2.5:9029/api/v1/WorkOrder/UpdateWorkOrderNgStatusAsync",
      {
        method: "PUT",
        headers,
        body: JSON.stringify({ badId, badQty }),
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  },

  async deleteNgRecord(badId: string | number) {
    const response = await fetch(
      "http://192.168.2.5:9029/api/v1/Ng/DeleteNgAsync",
      {
        method: "DELETE",
        headers,
        body: JSON.stringify({ badId }),
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  },

  async Resetrework(badId: string | number) {
    const response = await fetch(
      "http://192.168.2.5:9029/api/v1/Ng/ResetReworkAsync",
      {
        method: "POST",
        headers,
        body: JSON.stringify({ badId }),
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  },
};