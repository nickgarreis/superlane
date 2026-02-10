export function ProjectTaskTableHeader() {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 text-[10px] uppercase tracking-wider text-white/35">
      <div className="pl-8">Task</div>
      <div className="flex items-center gap-3 shrink-0 pl-4">
        <div className="w-[170px]">Project</div>
        <div className="w-[120px]">Due Date</div>
        <div className="w-6 text-center">Assignee</div>
        <div className="w-7" />
      </div>
    </div>
  );
}
