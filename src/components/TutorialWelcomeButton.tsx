"use client"

import { useState } from "react"
import TutorialWelcomePopup from "@/components/TutorialWelcomePopup"

export default function TutorialWelcomeButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 transition-colors text-amber-300 text-sm font-semibold px-4 py-2 rounded-lg border border-zinc-700/60"
      >
        ウェルカム画面を見る
      </button>
      {open && <TutorialWelcomePopup onClose={() => setOpen(false)} />}
    </>
  )
}
