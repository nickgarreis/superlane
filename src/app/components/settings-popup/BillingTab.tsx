import { Plus } from "lucide-react";

export function BillingTab() {
  return (
    <div className="flex flex-col gap-8 opacity-90">
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <p className="text-[14px] text-[#E8E8E8] mb-2">Billing is coming soon</p>
        <p className="text-[13px] text-[#E8E8E8]/50">
          Plan, payment methods, and invoices are intentionally read-only in this phase.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h4 className="text-[14px] font-medium text-[#E8E8E8]">Payment Method</h4>
          <button
            disabled
            className="text-[13px] text-[#E8E8E8]/35 flex items-center gap-1 transition-colors cursor-not-allowed"
          >
            <Plus size={14} /> Add new (Coming soon)
          </button>
        </div>

        <div className="flex items-center gap-4 py-4 border-b border-white/5">
          <div className="w-12 h-8 bg-[#2A2A2C] rounded border border-white/10 flex items-center justify-center shrink-0" />
          <div className="flex flex-col flex-1">
            <span className="text-[14px] font-medium text-[#E8E8E8]">No active payment method</span>
            <span className="text-[12px] text-[#E8E8E8]/50">Billing backend is not enabled yet.</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h4 className="text-[14px] font-medium text-[#E8E8E8]">Billing History</h4>
          <button disabled className="text-[13px] text-[#E8E8E8]/35 cursor-not-allowed">
            Download all (Coming soon)
          </button>
        </div>
        <div className="text-[13px] text-[#E8E8E8]/45">No invoices available.</div>
      </div>
    </div>
  );
}
