import svgPaths from "./svg-95p4xxlon7";

function Svg() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="c9d737">
          <path d={svgPaths.p2d5480} fill="var(--fill-0, #99CEFF)" id="Vector" />
          <path d={svgPaths.pc8d3c00} fill="var(--fill-0, #99CEFF)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[20px]" data-name="Container">
      <Svg />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-center max-w-[160px] overflow-clip relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['SF_Pro_Text:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#99ceff] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Draft</p>
      </div>
    </div>
  );
}

function ButtonMenu() {
  return (
    <div className="content-stretch flex gap-[6px] h-[36px] items-center pl-[8px] pr-[12px] relative rounded-[16777200px] shrink-0" data-name="Button menu">
      <Container2 />
      <Container3 />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Container">
      <ButtonMenu />
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="Container">
      <Container1 />
    </div>
  );
}