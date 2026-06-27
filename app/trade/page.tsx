import { Suspense } from "react";
import Navbar from "@/components/shared/Navbar";
import TradeContent from "./TradeContent";

export default function TradePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-8xl pt-10">
        <Suspense fallback={
          <div className="flex items-center justify-center py-32">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent" />
          </div>
        }>
          <TradeContent />
        </Suspense>
      </main>
    </>
  );
}
