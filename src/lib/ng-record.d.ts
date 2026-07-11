// d:\Dongjin\mesv2\src\types\ng-record.d.ts

export interface WorkOrder {
    key: string; // ใช้ lotLg เป็น key
    lotLg: string;
    modelSuffix: string;
    tool: string;
    prodItemNo: string;
    prodItemName: string; // noWkOrd
    planQty: number;
    actualQty: number;
    badQty: number;
}

export interface Category {
    codeId: string;
    codeName_ENG: string;
    codeName_TR: string;
}

export interface Defect {
    codeId: string;
    codeName_ENG: string;
    codeName_TR: string;
    badQty: number;
}