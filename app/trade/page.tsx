import { Suspense } from "react";
import TradeContent from "./TradeContent";

export default function TradePage() {
  return (
    <main className="mx-auto min-h-svh max-h-svh pt-2 pl-4">
      <Suspense fallback={
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent" />
        </div>
      }>
        <TradeContent />
      </Suspense>
    </main>
  );
}
