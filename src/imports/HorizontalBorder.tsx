import svgPaths from "./svg-hptnx4dv0e";
import { MessageCircle } from "lucide-react";

function Svg() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SVG">
          <path d={svgPaths.p19d57600} id="Vector" stroke="var(--stroke-0, #E8E8E8)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" strokeWidth="1.33333" />
          <path d="M6 2V14" id="Vector_2" stroke="var(--stroke-0, #E8E8E8)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button({ onClick }: { onClick?: () => void }) {
  return (
    <div className="relative rounded-[12px] shrink-0 size-[32px]" data-name="Button">
      <div 
        className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full cursor-pointer hover:bg-white/10 rounded-lg transition-colors"
        onClick={onClick}
      >
        <Svg />
      </div>
    </div>
  );
}

function ChatButton({ onClick }: { onClick?: () => void }) {
  if (!onClick) return null;
  return (
    <div 
      className="relative shrink-0 size-[32px] flex items-center justify-center cursor-pointer hover:bg-white/10 rounded-lg transition-colors" 
      onClick={onClick}
      data-name="ChatButton"
    >
      <MessageCircle className="w-4 h-4 text-[#E8E8E8]/60" />
    </div>
  );
}

export default function HorizontalBorder({ onToggleSidebar, onToggleChat }: { onToggleSidebar?: () => void, onToggleChat?: () => void }) {
  return (
    <div className="content-stretch flex items-center justify-between pb-[13px] pt-[12px] px-[22px] relative w-full h-[57px]" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(38,38,38,0.5)] border-b border-solid inset-0 pointer-events-none" />
      <Button onClick={onToggleSidebar} />
      <ChatButton onClick={onToggleChat} />
    </div>
  );
}