
'use client'

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SlActionUndo } from "react-icons/sl"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isValid, parseISO } from "date-fns"
import { FaRegCalendarAlt } from "react-icons/fa"
import { registerMovie } from "@/app/actions/registration"

export default function RegisterForm({ genres }: { genres: any[] }) {
  const currentYear = new Date().getFullYear()
  const maxYear = currentYear + 10

  const toDateValue = (d: Date) => format(d, "yyyy-MM-dd")
  const parseDateValue = (value: string) => {
    const dt = parseISO(value)
    return isValid(dt) ? dt : undefined
  }

  function DateTextAndCalendarField({
    label,
    name,
    defaultValue,
  }: {
    label: string
    name: string
    defaultValue?: string
  }) {
    const [inputValue, setInputValue] = React.useState(defaultValue ?? "")
    const [selected, setSelected] = React.useState<Date | undefined>(() =>
      defaultValue ? parseDateValue(defaultValue) : undefined
    )

    const handleSelect = (d: Date | undefined) => {
      setSelected(d)
      if (d) setInputValue(toDateValue(d))
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInputValue(value)
      const parsed = parseDateValue(value)
      if (parsed) setSelected(parsed)
    }

    const handleBlur = () => {
      const parsed = parseDateValue(inputValue)
      if (parsed) setInputValue(toDateValue(parsed))
    }

    return (
      <div>
        <label className="block text-sm font-medium">{label}</label>
        <div className="mt-1 flex w-full items-center justify-between gap-2 rounded border px-2 py-1">
          <input
            name={name}
            type="text"
            inputMode="numeric"
            placeholder="YYYY-MM-DD"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="w-[160px] px-2 py-1"
            pattern="\d{4}-\d{2}-\d{2}"
          />

          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" type="button">
                <FaRegCalendarAlt />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selected}
                onSelect={handleSelect}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    )
  }

  const today = toDateValue(new Date())

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 p-4">
      <div className="flex w-full justify-between">
        <h1 className="text-2xl font-bold">映画を登録</h1>
        <div>
          <Link className="flex justify-center" href="/main">
            <Button
              variant="outline"
              size="icon"
              className="bg-red-900 text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
            >
              <SlActionUndo />
            </Button>
          </Link>
        </div>
      </div>

      <form action={registerMovie} className="space-y-4 rounded-md border p-4">
        <div>
          <label className="block text-sm font-medium">タイトル</label>
          <input
            name="title"
            className="mt-1 w-full rounded border px-2 py-1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">映画公開年度</label>
          <input
            name="year"
            type="number"
            min="1888"
            max={maxYear}
            className="mt-1 w-full rounded border px-2 py-1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">ジャンル</label>
          <select
            name="genres"
            className="mt-1 w-full rounded border px-2 py-1"
            required
          >
            <option value="">
              ジャンルを選択してください！ （ メインだと思うジャンルを選択 ）
            </option>
            {genres?.map((g: any) => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">ステータス</label>
          <select name="status" className="mt-1 w-full rounded border px-2 py-1">
            <option value="watched">視聴済</option>
            <option value="wishlist">視たい</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">評価（1〜5）</label>
          <select name="rating" className="mt-1 w-full rounded border px-2 py-1">
            <option value=""></option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">メモ</label>
          <textarea
            name="memo"
            className="mt-1 w-full rounded border px-2 py-1"
            rows={3}
          />
        </div>

        <DateTextAndCalendarField
          label="視聴日"
          name="watched_at"
          defaultValue={today}
        />
        <DateTextAndCalendarField
          label="ページ作製日"
          name="created_at"
          defaultValue={today}
        />

        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          登録
        </button>
      </form>
    </div>
  )
}