import { useTranslation } from "react-i18next";
import { Button, ButtonGroup } from "@nextui-org/react"; // หรือ UI library อื่นๆ ที่ใช้ในโปรเจกต์

const lngs = {
    en: { nativeName: "EN" },
    th: { nativeName: "TH" },
    kr: { nativeName: "KR" },
    mm: { nativeName: "MM" },
};

export const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    return (
        <ButtonGroup size="sm">
            {Object.keys(lngs).map((lng) => (
                <Button
                    key={lng}
                    onClick={() => i18n.changeLanguage(lng)}
                    disabled={i18n.resolvedLanguage === lng}
                    variant={i18n.resolvedLanguage === lng ? "solid" : "ghost"}
                >
                    {lngs[lng as keyof typeof lngs].nativeName}
                </Button>
            ))}
        </ButtonGroup>
    );
};