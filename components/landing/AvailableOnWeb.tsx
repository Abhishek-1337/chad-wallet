export default function AvailableOnWeb() {
  return (
    <>
      {/* Desktop */}
      <div className="hidden flex-col items-center gap-3 px-8 py-10 desktop:flex">
        <div className="font-mono text-sm font-bold text-accent-primary">
          NOW AVAILABLE ON WEB
        </div>
        <h2 className="text-center text-[55px] leading-14 -tracking-normal font-medium">
          trade from anywhere.
          <br />
          never lose a beat.
        </h2>
        <p className="text-[22px] tracking-tight text-text-secondary">
          Open a trade on your phone, close it on your desktop — all in one app.
        </p>
        <div className="relative -mt-15">
          <img
            src="/fomo-assets/fomo-desktop.webp"
            alt=""
            loading="lazy"
            className="w-[64vw]"
          />
          <img
            src="/fomo-assets/fomo-desktop-phone.webp"
            alt=""
            loading="lazy"
            className="absolute -right-22 bottom-30 w-[28vw] animate-float"
          />
        </div>
      </div>

      {/* Mobile */}
      <div className="relative flex text-center desktop:hidden">
        <img src="/fomo-assets/fomo-mobile-app.webp" alt="" loading="lazy" />
        <div className="absolute bottom-0 flex flex-col gap-3 px-8">
          <h2 className="text-[36px] leading-9 tracking-tighter">
            trade from anywhere. <br />
            never lose a beat.
          </h2>
          <p className="leading-5 tracking-tight text-text-secondary">
            Pick up a trade on your phone, close it on your desktop — all in one
            app.
          </p>
        </div>
      </div>
    </>
  );
}
