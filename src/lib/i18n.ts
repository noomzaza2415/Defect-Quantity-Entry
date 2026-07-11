import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { t as ngDashboardTranslations } from "@/components/ng-dashboard/translations";
import { t_downtime as downtimeTranslations } from "@/components/MachineDowntime/translations";
import { t_production as productionTranslations } from "@/components/ProductionStatus/translations";

// โครงสร้างจากไฟล์ translations.ts ของคุณเกือบจะพร้อมสำหรับ i18next แล้ว
// เราเพียงแค่ต้องห่อ object ของแต่ละภาษาไว้ใน key ที่ชื่อ "translation"
// By merging all translation files, i18next can manage all texts in the application.
const resources = {
  en: {
    translation: {
      ...ngDashboardTranslations.en,
      ...downtimeTranslations.en,
      ...productionTranslations.en,
    }
  },
  th: {
    translation: {
      ...ngDashboardTranslations.th,
      ...downtimeTranslations.th,
      ...productionTranslations.th,
    }
  },
  kr: {
    translation: {
      ...ngDashboardTranslations.kr,
      ...downtimeTranslations.kr,
      ...productionTranslations.kr,
    }
  },
  mm: {
    translation: {
      ...ngDashboardTranslations.mm,
      ...downtimeTranslations.mm,
      ...productionTranslations.mm,
    }
  }
};

i18n
  // ตรวจจับภาษาของผู้ใช้
  // อ่านเพิ่มเติม: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // ส่ง i18n instance ไปให้ react-i18next
  .use(initReactI18next)
  // ตั้งค่า i18next
  // อ่านเพิ่มเติม: https://www.i18next.com/overview/configuration-options
  .init({
    debug: process.env.NODE_ENV === 'development',
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // ไม่จำเป็นสำหรับ React เพราะมันป้องกัน XSS อยู่แล้ว
    },
    resources: resources,
  });

export default i18n;