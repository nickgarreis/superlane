import React, { useState, useRef } from "react";
import { Download, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import svgPaths from "../../imports/svg-0erue6fqwq";
import HorizontalBorder from "../../imports/HorizontalBorder";

// File thumbnails
import imgFile1 from "figma:asset/86b9c3843ae4733f84c25f8c5003a47372346c7b.png";
import imgFile2 from "figma:asset/ed2300ecc7d7f37175475469dd895c1a9c7a47a7.png";
import imgFile3 from "figma:asset/a6d8d90aa9a345c6a0a0841855776fa6f038f822.png";
import imgFile4 from "figma:asset/6ec5d42097faff5a5e15a92d842d637a67eb0f04.png";
import imgFile5 from "figma:asset/13b4fb46cd2c4b965c5823ea01fe2f6c7842b7bd.png";

const BRAND_FILES = [
  { id: 1, name: "Logo - Primary", type: "SVG", date: "3. Okt. 2025, 10:25", img: imgFile1 },
  { id: 2, name: "Logo - White", type: "SVG", date: "3. Okt. 2025, 10:25", img: imgFile2 },
  { id: 3, name: "Font - Roboto Bold", type: "TTF", date: "3. Okt. 2025, 10:25", img: imgFile3 },
  { id: 4, name: "Brand Guidelines", type: "PDF", date: "3. Okt. 2025, 10:25", img: imgFile4 },
  { id: 5, name: "Social Media Kit", type: "ZIP", date: "3. Okt. 2025, 10:25", img: imgFile5 },
];

export function BrandAssets({ onToggleSidebar, isSidebarOpen }: { onToggleSidebar: () => void, isSidebarOpen: boolean }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "name">("relevance");
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  const [files, setFiles] = useState<any[]>([...BRAND_FILES]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const newFile = {
          id: Date.now(),
          name: file.name,
          type: file.name.split('.').pop()?.toUpperCase() || "FILE",
          date: new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' }) + ", " + new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
          img: imgFile4 // Generic icon
      };

      setFiles(prev => [newFile, ...prev]);
      toast.success(`Successfully uploaded ${file.name}`);
      
      if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleRemoveFile = (id: number, e: React.MouseEvent) => {
      e.stopPropagation();
      setFiles(prev => prev.filter(f => f.id !== id));
      toast.success("File removed");
  };

  const filteredFiles = files
    .filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return 0;
    });

  return (
    <div className="flex-1 h-full bg-[#141515] text-[#E8E8E8] overflow-hidden font-['Roboto',sans-serif] flex flex-col relative">
      <div className="relative bg-[#191A1A] m-[8px] border border-white/5 rounded-[32px] flex-1 overflow-hidden flex flex-col transition-all duration-500 ease-in-out">
        
        {/* Top Border / Header */}
        <div className="w-full h-[57px] shrink-0">
             <HorizontalBorder onToggleSidebar={onToggleSidebar} />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-[80px] py-[40px]">
            {/* Header Section */}
            <div className="flex gap-6 mb-10 items-center">
                <div className="flex-1">
                    <h1 className="text-[20px] font-medium text-[#E8E8E8] tracking-tight">Brand Assets</h1>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 z-10 relative">
                <div className="relative w-[384px] h-[36px]">
                    <div className="absolute inset-0 rounded-[18px] border border-[rgba(232,232,232,0.15)] pointer-events-none" />
                    <div className="flex items-center h-full px-3">
                        <div className="w-4 h-4 shrink-0 mr-2 opacity-40">
                            <svg className="w-full h-full" viewBox="0 0 16 16" fill="none">
                                <path d={svgPaths.p3f80a980} fill="#E8E8E8" />
                            </svg>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search assets" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none text-[13.9px] text-[#E8E8E8] placeholder:text-[rgba(232,232,232,0.4)] focus:outline-none"
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleUploadClick}
                        className="flex items-center gap-1 pl-[9px] pr-[13px] py-[7.75px] bg-[#E8E8E8] rounded-full hover:bg-white transition-colors cursor-pointer"
                    >
                        <div className="w-4 h-4 shrink-0">
                            <svg className="w-full h-full" viewBox="0 0 16 16" fill="none">
                                <path d={svgPaths.p34261000} fill="black" fillOpacity="0.667" />
                            </svg>
                        </div>
                        <span className="text-[13px] font-medium text-[#141415] leading-[19.5px]">
                            Upload asset
                        </span>
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                    />

                    <div className="relative">
                        <button 
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="flex items-center gap-2 text-[14px] font-medium text-[rgba(232,232,232,0.6)] hover:text-[#E8E8E8] transition-colors cursor-pointer"
                        >
                            {sortBy === "relevance" ? "Relevance" : "Name (A-Z)"}
                            <div className="w-4 h-4 shrink-0">
                                <svg className="w-full h-full" viewBox="0 0 16 16" fill="none">
                                    <path d={svgPaths.p7659d00} fill="#E8E8E8" fillOpacity="0.8" />
                                </svg>
                            </div>
                        </button>
                        
                        {isSortOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 w-40 bg-[#1A1A1C] border border-[#262626] rounded-xl shadow-xl overflow-hidden py-1 z-20">
                                    <button
                                        onClick={() => {
                                            setSortBy("relevance");
                                            setIsSortOpen(false);
                                        }}
                                        className={cn(
                                            "w-full px-4 py-2 text-left text-[13px] hover:bg-white/5 transition-colors cursor-pointer",
                                            sortBy === "relevance" ? "text-white font-medium" : "text-white/60"
                                        )}
                                    >
                                        Relevance
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSortBy("name");
                                            setIsSortOpen(false);
                                        }}
                                        className={cn(
                                            "w-full px-4 py-2 text-left text-[13px] hover:bg-white/5 transition-colors cursor-pointer",
                                            sortBy === "name" ? "text-white font-medium" : "text-white/60"
                                        )}
                                    >
                                        Name (A-Z)
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* File List */}
            <div className="flex flex-col gap-2">
                <AnimatePresence initial={false}>
                {filteredFiles.map((file) => (
                    <motion.div
                        key={file.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5 relative"
                    >
                        <div className="w-10 h-12 shrink-0 bg-white rounded flex items-center justify-center overflow-hidden shadow-sm relative">
                            <img src={file.img} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-white group-hover:text-white transition-colors mb-0.5">{file.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-white/40">
                                <span className="uppercase">{file.type}</span>
                                <span>•</span>
                                <span>{file.date}</span>
                            </div>
                        </div>
                        
                        {/* Action icons */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
                            <button
                                title="Download"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[#58AFFF] hover:text-[#7fc0ff] transition-colors cursor-pointer"
                            >
                                <Download size={14} />
                            </button>
                            <button
                                title="Remove"
                                onClick={(e) => handleRemoveFile(file.id, e)}
                                className="p-1.5 hover:bg-red-500/10 hover:text-red-500 text-white/20 rounded-lg transition-colors cursor-pointer"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>
                {filteredFiles.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-white/40">
                        <p className="text-sm">No files found matching "{searchQuery}"</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}