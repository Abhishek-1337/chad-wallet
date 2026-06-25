export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 bg-[#0A0A0B]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8B5CF6] text-sm font-bold text-white">
              C
            </div>
            <span className="text-lg font-bold text-white">ChadWallet</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://x.com/chadwallet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Twitter / X
            </a>
            <a
              href="https://t.me/chadwallet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Telegram
            </a>
            <a
              href="https://discord.gg/chadwallet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Discord
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://apps.apple.com/us/app/chadwallet/id6757367474"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-zinc-800 px-4 py-2 text-xs text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white"
            >
              App Store
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=xyz.chadwallet.www"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-zinc-800 px-4 py-2 text-xs text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white"
            >
              Google Play
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-800/50 pt-8 text-center text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} ChadWallet. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
