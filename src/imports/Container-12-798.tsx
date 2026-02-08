import svgPaths from "./svg-fyhwpedtdy";

function Svg() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SVG">
          <path d="M8 4.66667V14" id="Vector" stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p8c8fb00} id="Vector_2" stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex items-center justify-center pr-px relative shrink-0 w-[65.23px]" data-name="Link">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.2)] border-r border-solid inset-0 pointer-events-none" />
      <Svg />
    </div>
  );
}

function Svg1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SVG">
          <path d={svgPaths.p29eb9500} id="Vector" stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p8638940} id="Vector_2" stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex items-center justify-center pr-px relative shrink-0 w-[65.22px]" data-name="Link">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.2)] border-r border-solid inset-0 pointer-events-none" />
      <Svg1 />
    </div>
  );
}

function Svg2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SVG">
          <path d={svgPaths.p165be100} id="Vector" stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Link2() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[64.55px]" data-name="Link">
      <Svg2 />
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex items-center justify-between py-[8px] relative size-full" data-name="Container">
      <Link />
      <Link1 />
      <Link2 />
    </div>
  );
}