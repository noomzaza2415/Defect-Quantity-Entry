"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ReasonSelectorProps {
  value?: string
  onChange?: (value: string) => void
}

const reasons = [
  { value: "A00", label: "เวลาพัก" },
  { value: "A01", label: "ฝึกอบรม" },
  { value: "A02", label: "คุณภาพภายในบริษัท" },
  { value: "A03", label: "สินค้าภายในบริษัทหมด" },
  { value: "A04", label: "คุณภาพของบริษัทคู่ค้า" },
  { value: "A05", label: "สินค้าของบริษัทคู่ค้าหมด" },
  { value: "A06", label: "การทำงานล่าช้า" },
  { value: "A07", label: "อุปกรณ์และ Tool" },
  { value: "A08", label: "การเปลี่ยนโมเดล" },
  { value: "A09", label: "อื่นๆ" },
  { value: "A10", label: "เช็คสต๊อกชิ้นส่วนเกิน" },
  { value: "A11", label: "การเปลี่ยนของได้สินเปลือง" },
  { value: "A12", label: "การระงับแผนการ" },
  { value: "A13", label: "รถเข็นขาดแคลน" },
  { value: "A99", label: "หยุดชั่วคราว" },
]

export function ReasonSelector({
  value = "",
  onChange,
}: ReasonSelectorProps) {
  const [open, setOpen] = React.useState(false)

  const selectedReason = reasons.find(
    (item) => item.value === value
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* 🔴 แก้ไขตรงนี้: ใช้ render prop แทนการวาง <Button> ไว้ข้างในตรงๆ */}
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between"
          >
            {selectedReason
              ? `${selectedReason.value} - ${selectedReason.label}`
              : "เลือกเหตุผลหยุดเครื่อง"}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        }
      />

      <PopoverContent className="w-[500px] p-0" align="start">
        <Command>
          <CommandInput placeholder="ค้นหารหัส หรือ เหตุผล..." />

          <CommandEmpty>ไม่พบข้อมูล</CommandEmpty>

          <CommandGroup className="max-h-[350px] overflow-auto">
            {reasons.map((reason) => (
              <CommandItem
                key={reason.value}
                value={`${reason.value} ${reason.label}`}
                onSelect={() => {
                  onChange?.(reason.value)
                  setOpen(false) // ปิด Popover หลังจากเลือก
                }}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    value === reason.value ? "opacity-100" : "opacity-0"
                  }`}
                />
                <span className="w-16 font-semibold">{reason.value}</span>
                <span>{reason.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}