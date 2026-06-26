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
      <main className="flex w-full flex-1 flex-col items-center justify-center">
        {/* <TokenBanner direction="left" /> */}
        <Hero />
        <TokenBanner direction="right" />
        <AvailableOnWeb />
        <Features />
        {/* <TrendingGrid /> */}
        <CtaBottom />
      </main>
      <Footer />
    </div>
  );
}
