import svgPaths from "./svg-7lu5669hrh";

function Heading() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-[80px] top-[-0.75px]" data-name="Heading 2">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[17.7px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[25.2px]">Lets explore some possibilities</p>
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="h-[45.2px] relative shrink-0 w-full" data-name="Margin">
      <Heading />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Container">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(232,232,232,0.6)] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.6px] whitespace-pre-wrap">Project descripton</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <Container3 />
    </div>
  );
}

function Margin2() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[8px] relative shrink-0 w-full" data-name="Margin">
      <Container2 />
    </div>
  );
}

function Container4() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col items-start left-[calc(50%-0.24px)] pr-[281.52px] top-[calc(50%-29.19px)]" data-name="Container">
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(232,232,232,0.4)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.6px]">Enter workflow description</p>
      </div>
    </div>
  );
}

function Textarea() {
  return (
    <div className="bg-[rgba(232,232,232,0.04)] h-[104.38px] relative rounded-[18px] shrink-0 w-full" data-name="Textarea">
      <div className="overflow-auto relative size-full">
        <Container4 />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[19.59px] left-1/2 top-[calc(50%-29.39px)] w-[448px]" data-name="Rectangle" />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(232,232,232,0.04)] border-solid inset-0 pointer-events-none rounded-[18px]" />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Margin2 />
      <Textarea />
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[16px] relative shrink-0 w-full" data-name="Margin">
      <Container1 />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-[1_0_0] flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] min-h-px min-w-px relative text-[#e8e8e8] text-[14px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.6px] whitespace-pre-wrap">Allow AI usage</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[13.8px] text-[rgba(232,232,232,0.6)] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.6px] whitespace-pre-wrap">Superlane will leverage AI tools when and if it’s useful; for ideation, efficiency, volume and quality.</p>
      </div>
    </div>
  );
}

function Margin4() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[8px] pt-[4px] relative shrink-0 w-full" data-name="Margin">
      <Container7 />
    </div>
  );
}

function Switch() {
  return (
    <div className="bg-[rgba(232,232,232,0.08)] content-stretch flex h-[16px] items-center pl-[2px] pr-[12px] relative rounded-[16px] shrink-0 w-[26px]" data-name="Switch">
      <div className="bg-white rounded-[6px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.15)] shrink-0 size-[12px]" data-name="Background+Shadow" />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container6 />
      <Margin4 />
      <Switch />
      <div className="absolute bg-white left-[-26px] opacity-0 rounded-[2.5px] size-[16px] top-0" data-name="Input">
        <div aria-hidden="true" className="absolute border border-[#767676] border-solid inset-0 pointer-events-none rounded-[2.5px]" />
      </div>
    </div>
  );
}

function Margin3() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[32px] relative shrink-0 w-full" data-name="Margin">
      <Container5 />
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-[1_0_0] flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] min-h-px min-w-px relative text-[#e8e8e8] text-[14px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.6px] whitespace-pre-wrap">Final deadline</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[13.7px] text-[rgba(232,232,232,0.6)] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.6px] whitespace-pre-wrap">When do you expect to receive all assets ready to use?</p>
      </div>
    </div>
  );
}

function Margin6() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[8px] pt-[4px] relative shrink-0 w-full" data-name="Margin">
      <Container10 />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Container">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[14px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[21px] whitespace-pre-wrap">12.03.2026</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <Container12 />
    </div>
  );
}

function Margin7() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Margin">
      <div className="content-stretch flex flex-col items-start pr-[8px] relative w-full">
        <Container11 />
      </div>
    </div>
  );
}

function Svg() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SVG">
          <path d={svgPaths.p7659d00} fill="var(--fill-0, #E8E8E8)" fillOpacity="0.8" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 size-[16px]" data-name="Container">
      <Svg />
    </div>
  );
}

function ComboboxSelectOption() {
  return (
    <div className="h-[36px] relative rounded-[100px] shrink-0 w-full" data-name="Combobox - Select option">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[20px] relative size-full">
          <Margin7 />
          <Container13 />
        </div>
      </div>
    </div>
  );
}

function OverlayShadow() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[36px] items-start overflow-clip relative rounded-[100px] shadow-[0px_0px_0px_1px_rgba(232,232,232,0.15)] shrink-0 w-full" data-name="Overlay+Shadow">
      <ComboboxSelectOption />
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container9 />
      <Margin6 />
      <OverlayShadow />
    </div>
  );
}

function Margin5() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[32px] relative shrink-0 w-full" data-name="Margin">
      <Container8 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative w-full">
      <Margin1 />
      <Margin3 />
      <Margin5 />
    </div>
  );
}

function Button() {
  return (
    <div className="backdrop-blur-[6px] content-stretch flex h-[36px] items-center justify-center px-[17px] py-[7px] relative rounded-[16777200px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(232,232,232,0.1)] border-solid inset-0 pointer-events-none rounded-[16777200px]" />
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[14px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">Cancel</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#e8e8e8] content-stretch flex h-[36px] items-center justify-center px-[17px] py-[7px] relative rounded-[16777200px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[16777200px]" />
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#131314] text-[14px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">Next</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex gap-[16px] items-start justify-end relative shrink-0 w-full" data-name="Container">
      <Button />
      <Button1 />
    </div>
  );
}

function Margin8() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[24px] relative shrink-0 w-full" data-name="Margin">
      <Container14 />
    </div>
  );
}

function Container() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative size-full">
        <Margin />
        <Frame1 />
        <Margin8 />
      </div>
    </div>
  );
}

function Svg1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="SVG">
          <path d={svgPaths.p369d2cf0} fill="var(--fill-0, #E8E8E8)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonClose() {
  return (
    <div className="backdrop-blur-[6px] bg-[rgba(232,232,232,0.06)] content-stretch flex items-center justify-center p-px relative rounded-[16777200px] shrink-0 size-[36px]" data-name="Button - Close">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[16777200px]" />
      <Svg1 />
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute right-[25px] top-[25px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative">
        <ButtonClose />
      </div>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="bg-[#1e1f20] relative rounded-[40px] size-full" data-name="Frame">
      <div className="content-stretch flex flex-col items-start max-h-[inherit] max-w-[inherit] overflow-clip pb-[33px] pt-[29px] px-[33px] relative rounded-[inherit] size-full">
        <Container />
        <Container15 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#131314] border-solid inset-0 pointer-events-none rounded-[40px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.04),0px_12px_32px_0px_rgba(0,0,0,0.08)]" />
    </div>
  );
}