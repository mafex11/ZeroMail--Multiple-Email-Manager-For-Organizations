'use client'

import { GalleryVerticalEnd } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  // Redirect to home if already logged in
  useEffect(() => {
    if (session) {
      router.push('/')
    }
  }, [session, router])

  // Don't render the form if we're redirecting
  if (status === "loading") {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-zinc-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (session) {
    return null // Will redirect
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-zinc-900">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium text-white">
          <div className="bg-black text-primary-foreground flex size-8 items-center justify-center rounded-md ">
            {/* <GalleryVerticalEnd className="size-4 text-black" /> */}
            <img src="/email-envelope-close--Streamline-Pixel.svg" alt="Fusion Mail" className="size-6" />
          </div>
          Fusion Mail
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
