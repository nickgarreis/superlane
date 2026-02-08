import svgPaths from "./svg-ud7jmcv39w";
import imgLogo from "figma:asset/c3a996a7bf06b0777eaf43cb323cfde0872e163e.png";
import img9D5C278F76A24319A3Ec5801F0E7B741 from "figma:asset/fea98b130b1d6a04ebf9c88afab5cd53fbd3e447.png";

function Logo() {
  return (
    <div className="max-w-[32px] relative shrink-0 size-[16px]" data-name="Logo">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgLogo} />
      </div>
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="bg-[#193cb8] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[32px]" data-name="Background+Shadow">
      <Logo />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-5px_6.6px_0px_rgba(0,0,0,0.25)]" />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[21px]">SpaceX</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(232,232,232,0.6)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[15.6px]">Created: 02.12.25</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container5 />
      <Container6 />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Container">
      <BackgroundShadow />
      <Container4 />
    </div>
  );
}

function Svg() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SVG">
          <path d={svgPaths.p1ff55e00} fill="var(--fill-0, #E8E8E8)" fillOpacity="0.6" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonMenu() {
  return (
    <div className="content-stretch flex flex-col items-start p-[4px] relative rounded-[10px] shrink-0" data-name="Button menu">
      <Svg />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container3 />
      <ButtonMenu />
    </div>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[16px] py-[18px] relative w-full">
        <Container2 />
      </div>
    </div>
  );
}

function Svg1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="SVG">
          <path d={svgPaths.p108b5f00} fill="var(--fill-0, #E8E8E8)" fillOpacity="0.8" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ItemLink() {
  return (
    <div className="h-[36px] relative rounded-[1000px] shrink-0 w-full" data-name="Item → Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[14px] relative size-full">
          <Svg1 />
          <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(232,232,232,0.8)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[21px]">Search</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Svg2() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="SVG">
          <path d={svgPaths.p52a0800} fill="var(--fill-0, #E8E8E8)" fillOpacity="0.8" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ItemLink1() {
  return (
    <div className="h-[36px] relative rounded-[1000px] shrink-0 w-full" data-name="Item → Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[14px] relative size-full">
          <Svg2 />
          <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(232,232,232,0.8)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[21px]">Inbox</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Svg3() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="SVG">
          <path d={svgPaths.p2bd7a900} fill="var(--fill-0, #E8E8E8)" fillOpacity="0.8" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ItemLink2() {
  return (
    <div className="h-[36px] relative rounded-[1000px] shrink-0 w-full" data-name="Item → Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[14px] relative size-full">
          <Svg3 />
          <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-[rgba(232,232,232,0.8)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[21px] text-[14px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Tasks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Svg4() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="SVG">
          <path d={svgPaths.p3248c400} fill="var(--fill-0, #E8E8E8)" fillOpacity="0.8" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ItemButton() {
  return (
    <div className="h-[36px] relative rounded-[1000px] shrink-0 w-full" data-name="Item → Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[14px] relative size-full">
          <Svg4 />
          <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(232,232,232,0.8)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[21px]">Brand Assets</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function List() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="List">
      <ItemLink />
      <ItemLink1 />
      <ItemLink2 />
      <ItemButton />
    </div>
  );
}

function Container8() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start p-[8px] relative w-full">
        <List />
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[13px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[18.2px]">Projects</p>
      </div>
    </div>
  );
}

function Svg5() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="SVG">
          <path d={svgPaths.p3ef5c500} fill="var(--fill-0, #E8E8E8)" fillOpacity="0.8" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0 size-[28px]" data-name="Button">
      <Svg5 />
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex items-start opacity-0 pr-[8px] relative shrink-0" data-name="Container">
      <Button />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex gap-[145.8px] items-center relative shrink-0 w-[227px]" data-name="Heading 6">
      <Link />
      <Container11 />
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[32px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] relative size-full">
          <Heading />
        </div>
      </div>
    </div>
  );
}

function Svg6() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SVG">
          <path d={svgPaths.p39ddd900} fill="var(--fill-0, #E8E8E8)" fillOpacity="0.6" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonCreateProject() {
  return (
    <div className="absolute content-stretch flex items-center justify-center py-[2px] right-[12px] rounded-[10px] top-[14px] w-[20px]" data-name="Button - Create project">
      <Svg6 />
    </div>
  );
}

function Svg7() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="SVG">
          <path d={svgPaths.p3cd9bf00} fill="var(--fill-0, #E8E8E8)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Svg7 />
    </div>
  );
}

function ItemButton1() {
  return (
    <div className="bg-[rgba(232,232,232,0.04)] h-[36px] relative rounded-[1000px] shrink-0 w-full" data-name="Item → Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[14px] relative size-full">
          <Container12 />
          <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[21px]">Website Redesign</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Svg8() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="SVG">
          <path d={svgPaths.p3cd9bf00} fill="var(--fill-0, #E8E8E8)" fillOpacity="0.8" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Svg8 />
    </div>
  );
}

function ItemButton2() {
  return (
    <div className="h-[36px] relative rounded-[1000px] shrink-0 w-full" data-name="Item → Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[14px] relative size-full">
          <Container13 />
          <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(232,232,232,0.8)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[21px]">N8N Workflow</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Svg9() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="SVG">
          <path d={svgPaths.p3cd9bf00} fill="var(--fill-0, #E8E8E8)" fillOpacity="0.8" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Svg9 />
    </div>
  );
}

function ItemButton3() {
  return (
    <div className="h-[36px] relative rounded-[1000px] shrink-0 w-full" data-name="Item → Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[14px] relative size-full">
          <Container14 />
          <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(232,232,232,0.8)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[21px]">Meta Ad</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function List1() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="List">
      <ItemButton1 />
      <ItemButton2 />
      <ItemButton3 />
    </div>
  );
}

function Container9() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start p-[8px] relative size-full">
        <Container10 />
        <ButtonCreateProject />
        <List1 />
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[13px] text-[rgba(232,232,232,0.8)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[18.2px]">Archive</p>
      </div>
    </div>
  );
}

function Svg10() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SVG">
          <path d={svgPaths.p203e9580} fill="var(--fill-0, #E8E8E8)" fillOpacity="0.6" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-[227px]" data-name="Heading 6">
      <Link1 />
      <Svg10 />
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[32px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] relative size-full">
          <Heading1 />
        </div>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start p-[8px] relative w-full">
        <Container16 />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-auto relative w-full" data-name="Container">
      <Container8 />
      <Container9 />
      <Container15 />
    </div>
  );
}

function Svg11() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SVG">
          <path d={svgPaths.p34f44af0} fill="var(--fill-0, #E8E8E8)" fillOpacity="0.6" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(232,232,232,0.6)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[21px]">Settings</p>
      </div>
    </div>
  );
}

function ItemButton4() {
  return (
    <div className="h-[36px] relative rounded-[12px] shrink-0 w-full" data-name="Item → Button">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[12px] py-[8px] relative size-full">
          <Svg11 />
          <Container17 />
        </div>
      </div>
    </div>
  );
}

function Svg12() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SVG">
          <path d={svgPaths.p2a1b4800} fill="var(--fill-0, #E8E8E8)" fillOpacity="0.6" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(232,232,232,0.6)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[21px]">Help</p>
      </div>
    </div>
  );
}

function ItemButton5() {
  return (
    <div className="h-[36px] relative rounded-[12px] shrink-0 w-full" data-name="Item → Button">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[12px] py-[8px] relative size-full">
          <Svg12 />
          <Container18 />
        </div>
      </div>
    </div>
  );
}

function List2() {
  return (
    <div className="relative shrink-0 w-full" data-name="List">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative w-full">
        <ItemButton4 />
        <ItemButton5 />
      </div>
    </div>
  );
}

function Component9D5C278F76A24319A3Ec5801F0E7B() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="9d5c278f-76a2-4319-a3ec-5801f0e7b741">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={img9D5C278F76A24319A3Ec5801F0E7B741} />
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex items-start justify-center overflow-clip relative rounded-[16777200px] shrink-0 size-[32px]" data-name="Container">
      <Component9D5C278F76A24319A3Ec5801F0E7B />
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[14px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[21px] whitespace-pre-wrap">Nick Garreis</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(232,232,232,0.6)] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[15.6px] whitespace-pre-wrap">No email</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Container">
      <Container21 />
      <Container22 />
    </div>
  );
}

function Svg13() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SVG">
          <path d={svgPaths.p16897c00} fill="var(--fill-0, #E8E8E8)" fillOpacity="0.6" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonMenu1() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Button menu">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[8px] relative w-full">
          <Container19 />
          <Container20 />
          <Svg13 />
        </div>
      </div>
    </div>
  );
}

function ButtonMenuMargin() {
  return (
    <div className="relative shrink-0 w-full" data-name="Button menu:margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <ButtonMenu1 />
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(38,38,38,0.4)] border-solid border-t inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[8px] items-start pb-[8px] pt-[9px] px-[8px] relative w-full">
        <List2 />
        <ButtonMenuMargin />
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-start min-h-px min-w-px relative" data-name="Background">
      <Container1 />
      <Container7 />
      <HorizontalBorder />
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex items-start justify-center relative size-full" data-name="Container">
      <Background />
    </div>
  );
}