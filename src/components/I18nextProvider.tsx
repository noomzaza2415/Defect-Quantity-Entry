"use client";

import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n"; // import ไฟล์ที่เราเพิ่งสร้าง

export default function I18nextAppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}