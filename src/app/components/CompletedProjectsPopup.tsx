import React, { useState } from "react";
import { X, Search, Undo2, CheckCircle2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { ProjectData } from "../types";
import { ProjectLogo } from "./ProjectLogo";
import { motion, AnimatePresence } from "motion/react";

type SortField = "name" | "category" | "completedAt";
type SortDir = "asc" | "desc";

export function CompletedProjectsPopup({
    isOpen,
    onClose,
    projects,
    onNavigateToProject,
    onUncompleteProject,
}: {
    isOpen: boolean;
    onClose: () => void;
    projects: Record<string, ProjectData>;
    onNavigateToProject: (id: string) => void;
    onUncompleteProject: (id: string) => void;
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<SortField>("completedAt");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    if (!isOpen) return null;

    const completedProjects = Object.values(projects)
        .filter(p => !p.archived && p.status.label === "Completed");

    const filteredProjects = completedProjects
        .filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            let cmp = 0;
            if (sortField === "name") {
                cmp = a.name.localeCompare(b.name);
            } else if (sortField === "category") {
                cmp = a.category.localeCompare(b.category);
            } else {
                const dateA = typeof a.completedAt === "number" ? a.completedAt : 0;
                const dateB = typeof b.completedAt === "number" ? b.completedAt : 0;
                cmp = dateA - dateB;
            }
            return sortDir === "asc" ? cmp : -cmp;
        });

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir(field === "name" || field === "category" ? "asc" : "desc");
        }
    };

    const formatDate = (dateEpochMs?: number | null) => {
        if (typeof dateEpochMs !== "number" || !Number.isFinite(dateEpochMs)) return "\u2014";
        const d = new Date(dateEpochMs);
        if (isNaN(d.getTime())) return "\u2014";
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown size={12} className="text-white/20" />;
        return sortDir === "asc"
            ? <ArrowUp size={12} className="text-white/50" />
            : <ArrowDown size={12} className="text-white/50" />;
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-[720px] max-h-[80vh] bg-[#191A1A] border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col overflow-hidden font-['Roboto',sans-serif]">
                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-7 pb-1">
                    <div>
                        <h2 className="text-[18px] font-medium text-[#E8E8E8] tracking-tight">Completed Projects</h2>
                        <p className="text-[13px] text-white/40 mt-1">
                            {completedProjects.length} project{completedProjects.length !== 1 ? "s" : ""} completed
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <X size={16} className="text-white/60" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="px-8 pt-5 pb-4">
                    <div className="relative w-full h-[36px]">
                        <div className="absolute inset-0 rounded-[18px] border border-[rgba(232,232,232,0.15)] pointer-events-none" />
                        <div className="flex items-center h-full px-3">
                            <Search size={16} className="shrink-0 mr-2 opacity-40 text-[#E8E8E8]" />
                            <input
                                type="text"
                                placeholder="Search completed projects"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent border-none text-[13.9px] text-[#E8E8E8] placeholder:text-[rgba(232,232,232,0.4)] focus:outline-none"
                                autoFocus
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto px-8 pb-6 min-h-0">
                    {filteredProjects.length > 0 ? (
                        <div className="flex flex-col">
                            {/* Table Header */}
                            <div className="flex items-center px-4 py-2 text-[11px] uppercase tracking-wider text-white/30 border-b border-white/5">
                                <div
                                    className="flex-1 min-w-0 flex items-center gap-1.5 cursor-pointer hover:text-white/50 transition-colors select-none"
                                    onClick={() => handleSort("name")}
                                >
                                    Project <SortIcon field="name" />
                                </div>
                                <div
                                    className="w-[130px] shrink-0 flex items-center gap-1.5 cursor-pointer hover:text-white/50 transition-colors select-none"
                                    onClick={() => handleSort("category")}
                                >
                                    Category <SortIcon field="category" />
                                </div>
                                <div
                                    className="w-[150px] shrink-0 flex items-center gap-1.5 cursor-pointer hover:text-white/50 transition-colors select-none"
                                    onClick={() => handleSort("completedAt")}
                                >
                                    Completed on <SortIcon field="completedAt" />
                                </div>
                                <div className="w-[90px] shrink-0 text-right">Actions</div>
                            </div>

                            {/* Table Rows */}
                            <AnimatePresence initial={false}>
                                {filteredProjects.map((project) => (
                                    <motion.div
                                        key={project.id}
                                        layout
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                        onClick={() => {
                                            onNavigateToProject(project.id);
                                            onClose();
                                        }}
                                    >
                                        <div className="flex-1 min-w-0 flex items-center gap-3">
                                            <ProjectLogo size={28} category={project.category} />
                                            <span className="text-[14px] text-[#E8E8E8] truncate">{project.name}</span>
                                        </div>
                                        <div className="w-[130px] shrink-0 text-[13px] text-white/50">
                                            {project.category}
                                        </div>
                                        <div className="w-[150px] shrink-0 text-[13px] text-white/40 flex items-center gap-1.5">
                                            <CheckCircle2 size={13} className="text-[#22c55e]/60 shrink-0" />
                                            {formatDate(project.completedAt)}
                                        </div>
                                        <div className="w-[90px] shrink-0 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                                                title="Revert to Active"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onUncompleteProject(project.id);
                                                }}
                                            >
                                                <Undo2 size={15} className="text-white/50 hover:text-white" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-white/20">
                            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <CheckCircle2 size={24} className="opacity-40" />
                            </div>
                            <p className="text-[14px] font-medium">
                                {searchQuery ? "No matching completed projects" : "No completed projects"}
                            </p>
                            <p className="text-[12px] text-white/15 mt-1">
                                {searchQuery ? "Try a different search term" : "Projects you complete will appear here"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
