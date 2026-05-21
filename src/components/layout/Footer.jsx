import { APP_NAME } from '@/utils/constants'

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500 sm:px-6">
        <p>
          &copy; {new Date().getFullYear()} {APP_NAME}. Realtime quiz platform.
        </p>
      </div>
    </footer>
  )
}
