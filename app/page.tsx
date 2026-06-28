import Navbar from "@/components/shared/Navbar";
import TokenBanner from "@/components/landing/TokenBanner";
import Hero from "@/components/landing/Hero";
import AvailableOnWeb from "@/components/landing/AvailableOnWeb";
import Features from "@/components/landing/Features";
import TrendingGrid from "@/components/landing/TrendingGrid";
import CtaBottom from "@/components/landing/CtaBottom";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="relative isolate flex min-h-svh flex-col overflow-x-hidden">
      <Navbar />
      <main className="relative flex w-full flex-1 flex-col items-center justify-center pt-0">
        <div className="absolute left-0 top-10 z-10 h-full w-full " >
          <TokenBanner direction="right" />
        </div>
        <Hero />
        <AvailableOnWeb />
        <Features />
        <TrendingGrid />
        <CtaBottom />
        <TokenBanner direction="right" />
      </main>
      <Footer />
    </div>
  );
}
