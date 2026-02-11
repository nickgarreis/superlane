import React, { useState } from "react";
import { BookOpen, MessageSquare, Bug, X, Send } from "lucide-react";
import { toast } from "sonner";

export function SidebarHelpActions() {
  const [activePopup, setActivePopup] = useState<"feedback" | "bug" | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(activePopup === "feedback" ? "Feedback sent!" : "Bug report submitted!");
    setActivePopup(null);
  };

  return (
    <>
      <div className="flex items-center justify-between py-2 px-1">
        <button 
          onClick={() => window.open('https://help.example.com', '_blank')}
          className="flex-1 flex justify-center text-white/40 hover:text-white transition-colors group py-1"
          title="Help Center"
        >
          <BookOpen size={16} strokeWidth={1.5} />
        </button>
        <div className="w-px h-3 bg-white/10" />
        <button 
          onClick={() => setActivePopup("feedback")}
          className="flex-1 flex justify-center text-white/40 hover:text-white transition-colors group py-1"
          title="Send Feedback"
        >
          <MessageSquare size={16} strokeWidth={1.5} />
        </button>
        <div className="w-px h-3 bg-white/10" />
        <button 
          onClick={() => setActivePopup("bug")}
          className="flex-1 flex justify-center text-white/40 hover:text-white transition-colors group py-1"
          title="Report Bug"
        >
          <Bug size={16} strokeWidth={1.5} />
        </button>
      </div>

      {activePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="fixed inset-0" onClick={() => setActivePopup(null)} />
            <div className="w-full max-w-[400px] bg-[#181818] border border-[#262626] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative z-10">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <h3 className="text-[14px] font-medium text-white">
                        {activePopup === "feedback" ? "Send Feedback" : "Report a Bug"}
                    </h3>
                    <button onClick={() => setActivePopup(null)} className="text-white/40 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
                    <textarea 
                        className="w-full h-[120px] bg-[#121212] border border-white/10 rounded-lg p-3 text-[13px] text-white focus:outline-none focus:border-white/20 placeholder:text-white/20 resize-none font-['Roboto']"
                        placeholder={activePopup === "feedback" ? "Tell us what you think..." : "Describe the bug you encountered..."}
                        autoFocus
                    />
                    <div className="flex justify-end">
                        <button type="submit" className="px-3 py-1.5 bg-white text-black text-[13px] font-medium rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2">
                            <span>Submit</span>
                            <Send size={12} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </>
  );
}