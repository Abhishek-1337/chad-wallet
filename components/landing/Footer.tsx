export default function Footer() {
  return (
    <footer className="flex flex-col items-start gap-10 px-10 pb-12 pt-8 desktop:flex-row desktop:justify-between">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-text-primary">
            <img src="/logo/dark.png" alt="ChadWallet" className="h-8 w-auto" />
            <span className="text-lg font-bold">ChadWallet</span>
          </div>
          <div className="text-2xl leading-7 tracking-tighter text-text-secondary font-semibold text-[#9899a3]">
            where traders become legends.
          </div>
        </div>
        <div className="hidden text-text-tertiary desktop:block">
          &copy; {new Date().getFullYear()} ChadWallet Inc.
        </div>
      </div>

      <div className="flex flex-col items-start gap-8 desktop:flex-row desktop:gap-2">
        <div className="flex min-w-40 flex-col items-start gap-2">
          <div className="font-mono text-sm text-text-tertiary">ABOUT</div>
          <a href="#" className="text-sm transition-colors hover:text-text-secondary">
            Blog
          </a>
          <a href="#" className="text-sm transition-colors hover:text-text-secondary">
            FAQ
          </a>
          <a href="#" className="text-sm transition-colors hover:text-text-secondary">
            Affiliates
          </a>
        </div>
        <div className="flex min-w-40 flex-col items-start gap-2">
          <div className="font-mono text-sm text-text-tertiary">SOCIAL</div>
          <a
            href="https://discord.gg/chadwallet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm transition-colors hover:text-text-secondary"
          >
            Discord
          </a>
          <a
            href="https://x.com/chadwallet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm transition-colors hover:text-text-secondary"
          >
            X/Twitter
          </a>
          <a
            href="https://t.me/chadwallet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm transition-colors hover:text-text-secondary"
          >
            Telegram
          </a>
        </div>
        <div className="flex min-w-40 flex-col items-start gap-2">
          <div className="font-mono text-sm text-text-tertiary">LEGAL</div>
          <a href="#" className="text-sm transition-colors hover:text-text-secondary">
            Privacy Policy
          </a>
          <a href="#" className="text-sm transition-colors hover:text-text-secondary">
            Terms of Service
          </a>
        </div>
      </div>

      <div className="block text-text-tertiary desktop:hidden">
        &copy; {new Date().getFullYear()} ChadWallet Inc.
      </div>
    </footer>
  );
}
