import Navbar from "@/components/shared/Navbar";
import AuthRedirect from "@/components/shared/AuthRedirect";
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
      <AuthRedirect />
      <Navbar />
      <main className="flex w-full flex-1 flex-col items-center justify-center pt-13">
        <TokenBanner direction="right" />
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
