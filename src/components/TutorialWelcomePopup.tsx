"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { completeTutorial } from "@/app/actions/tutorial"

type Props = {
  onClose?: () => void
}

export default function TutorialWelcomePopup({ onClose }: Props = {}) {
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const [isSkipping, setIsSkipping] = useState(false)

  function close() {
    if (onClose) onClose()
    else setOpen(false)
  }

  if (!onClose && !open) return null

  async function handleSkip() {
    setIsSkipping(true)
    if (!onClose) await completeTutorial()
    close()
    setIsSkipping(false)
  }

  function handleStart() {
    if (!onClose) completeTutorial()
    close()
    router.push("/tutorial")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 bg-[#0c0907] border border-amber-900/30 rounded-2xl px-6 py-8 shadow-2xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <div>
            <div className="text-amber-700/70 text-sm tracking-[0.35em] uppercase mb-1">welcome</div>
            <h1 className="text-amber-300 text-3xl font-bold tracking-widest">
              あなたの<br />映画博物館へ
            </h1>
          </div>
          <p className="text-neutral-400 text-sm leading-relaxed">
            まずは各ページの説明と、<br />
            実際に映画を登録して最初のコレクションを<br />
            解放するところまでをお手伝いします！<br />
            各ページの説明は、<br />
            プロフィールページの設定内で<br />
            いつでも確認出来ます。
          </p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <Button
            onClick={handleStart}
            className="w-full h-12 bg-amber-700 hover:bg-amber-600 text-white font-bold text-base"
          >
            はじめる
          </Button>
          <button
            onClick={handleSkip}
            disabled={isSkipping}
            className="text-neutral-500 text-sm text-center hover:text-neutral-400 transition disabled:opacity-50"
          >
            {onClose ? "とじる" : "スキップする"}
          </button>
        </div>
      </div>
    </div>
  )
}
