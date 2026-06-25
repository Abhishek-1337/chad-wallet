import Navbar from "@/components/shared/Navbar";
import TokenBanner from "@/components/landing/TokenBanner";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import TrendingGrid from "@/components/landing/TrendingGrid";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <TokenBanner direction="left" />
        <Hero />
        <TokenBanner direction="right" />
        <Features />
        <HowItWorks />
        <TrendingGrid />
      </main>
      <Footer />
    </>
  );
}
