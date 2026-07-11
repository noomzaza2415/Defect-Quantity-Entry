/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * หมายเหตุ: การเก็บ Token และ API URL ไว้ในโค้ดโดยตรงไม่ปลอดภัยและไม่ยืดหยุ่น
 * ในแอปพลิเคชันจริง ควรใช้ Environment Variables (.env) ในการจัดเก็บค่าเหล่านี้
 * และควรมีระบบจัดการ Authentication ที่เหมาะสม
 */

// ย้าย Type Definitions มาไว้ที่นี่เพื่อให้ใช้ร่วมกันได้
export interface CategoryItem {
    codeId: number;
    cMaType1: string;
    codeName_TR: string;
    codeName_ENG: string;
}

/**
 * หมายเหตุ: การเก็บ Token และ API URL ไว้ในโค้ดโดยตรงไม่ปลอดภัยและไม่ยืดหยุ่น
 * ในแอปพลิเคชันจริง ควรใช้ Environment Variables (.env) ในการจัดเก็บค่าเหล่านี้
 * และควรมีระบบจัดการ Authentication ที่เหมาะสม
 */
const API_BASE_URL = "http://192.168.2.5:9029/api/v1/Ng";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJmZTZhMzRmOS0xZDc1LTQyMmUtYmViNi1kOGU0YWVhZDJlODEiLCJ1bmlxdWVfbmFtZSI6InVzZXJAZG9uZ2ppbmUuY29tIiwicm9sZSI6InVzZXIiLCJuYmYiOjE3Nzk1MTk4NDIsImV4cCI6MTc4NzI5NTg0MiwiaWF0IjoxNzc5NTE5ODQyfQ.MLGjvSdfJFevbuK_J7ifJVhf6BlI48g5UyoVtb7LDqM";

const fetchApi = async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // API บางตัวคืนผลลัพธ์ใน property 'result', บางตัวคืนเป็น array ตรงๆ
    return (Array.isArray(data) ? data : data.result || []) as T;
};

export const getCategorySt = () => fetchApi<CategoryItem[]>(`GetCategoryStAsync?cMaType=QM01`);
export const getCategoryNd = () => fetchApi<CategoryItem[]>(`GetCategoryNdAsync?cMaType=QM01`);

export interface DefectItem {
    codeId: string;
    codeName_ENG: string;
    badQty: number;
}

export const getDefectData = async (noWkOrd: string) => {
    const cMaType = "QD01";
    const endpoints = [
        `GetDefectStAsync?cMaType=${cMaType}&noWkOrd=${noWkOrd}`, // คาดว่าคืน DefectItem[]
        `GetDefectNdAsync?cMaType=${cMaType}&noWkOrd=${noWkOrd}`, // คาดว่าคืน DefectItem[]
        `GetDefectRdAsync?cMaType=${cMaType}&noWkOrd=${noWkOrd}`  // คาดว่าคืน DefectItem[]
    ];

    // ใช้ Promise.allSettled เพื่อให้แม้บาง API ล้มเหลว แต่เรายังได้ข้อมูลจาก API ที่สำเร็จ
    const results = await Promise.allSettled(endpoints.map(ep => fetchApi(ep)));

    const [defectSt, defectNd, defectRd] = results.map(result => {
        if (result.status === 'fulfilled') {
            return result.value as DefectItem[]; // บอก TypeScript ว่าผลลัพธ์คือ DefectItem[]
        } else {
            // หาก API ล้มเหลว ให้คืนค่าเป็น array ว่าง และ log error
            console.error("Failed to fetch defect data:", result.reason);
            return [] as DefectItem[];
        }
    });

    return { defectSt, defectNd, defectRd };
};

export const getWorkOrders = async (from: string, to: string) => {
    // ย้าย API URL และ Token มาไว้ที่นี่เพื่อการจัดการที่ง่ายขึ้น
    const API_URL_ORDER = "http://192.168.2.5:9091/api/v1/Crud";
    const TOKEN_ORDER = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJmZTZhMzRmOS0xZDc1LTQyMmUtYmViNi1kOGU0YWVhZDJlODEiLCJ1bmlxdWVfbmFtZSI6InVzZXJAZG9uZ2ppbmUuY29tIiwicm9sZSI6InVzZXIiLCJuYmYiOjE3Nzk1MTk4NDIsImV4cCI6MTc4NzI5NTg0MiwiaWF0IjoxNzc5NTE5ODQyfQ.MLGjvSdfJFevbuK_J7ifJVhf6BlI48g5UyoVtb7LDqM";

    const url = `${API_URL_ORDER}/GetOnWorkOrderAssyQueryAsync?eqNo=D01&changed=2&frmDate=${from}&toDate=${to}`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${TOKEN_ORDER}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`API call for orders failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // กำหนดประเภทข้อมูลที่คาดหวังให้ชัดเจน
    // ในที่นี้เราคาดว่า API จะคืนค่าเป็น Array ของ object ใดๆ
    // หากมี interface สำหรับ WorkOrder ควรนำมาใช้แทน any
    const workOrders: any[] = data.result || [];
    return workOrders;
};