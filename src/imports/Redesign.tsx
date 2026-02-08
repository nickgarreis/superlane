import svgPaths from "./svg-pclbthwul8";
import imgLogo from "figma:asset/c3a996a7bf06b0777eaf43cb323cfde0872e163e.png";
import img9D5C278F76A24319A3Ec5801F0E7B741 from "figma:asset/fea98b130b1d6a04ebf9c88afab5cd53fbd3e447.png";
import imgCalendar from "figma:asset/b24d4dcfb8874cd86a47db18a5e7dfe0a74d9496.png";
import imgDemoTeamspaceAssistantFile1Png from "figma:asset/86b9c3843ae4733f84c25f8c5003a47372346c7b.png";
import imgDemoTeamspaceAssistantFile2Png from "figma:asset/ed2300ecc7d7f37175475469dd895c1a9c7a47a7.png";
import imgDemoTeamspaceAssistantFile3Png from "figma:asset/a6d8d90aa9a345c6a0a0841855776fa6f038f822.png";
import imgDemoTeamspaceAssistantFile4Png from "figma:asset/6ec5d42097faff5a5e15a92d842d637a67eb0f04.png";
import imgDemoTeamspaceAssistantFile5Png from "figma:asset/13b4fb46cd2c4b965c5823ea01fe2f6c7842b7bd.png";
import { imgGroup } from "./svg-iv7mi";

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

function Heading1() {
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
          <Heading1 />
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

function Heading2() {
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
          <Heading2 />
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

function Container() {
  return (
    <div className="absolute content-stretch flex h-[900px] items-start justify-center left-0 top-0 w-[256px]" data-name="Container">
      <Background />
    </div>
  );
}

function Container24() {
  return <div className="h-full shrink-0 w-[256px]" data-name="Container" />;
}

function Svg14() {
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

function Button1() {
  return (
    <div className="relative rounded-[12px] shrink-0 size-[32px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Svg14 />
      </div>
    </div>
  );
}

function Svg15() {
  return (
    <div className="relative shrink-0 size-[19.2px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.2 19.2">
        <g id="SVG">
          <path d={svgPaths.p3511e500} fill="var(--fill-0, #E8E8E8)" fillOpacity="0.6" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function HorizontalBorder1() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(38,38,38,0.5)] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[13px] pt-[12px] px-[22px] relative w-full">
          <Button1 />
          <Svg15 />
        </div>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[6.97%_3.81%_10.13%_8.75%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0.035px] mask-size-[122.5px_115.938px]" data-name="Group" style={{ maskImage: `url('${imgGroup}')` }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 122.414 116.06">
        <g id="Group">
          <path d={svgPaths.p4533640} fill="url(#paint0_linear_1_566)" id="Vector" />
          <path d={svgPaths.p3fb64680} fill="url(#paint1_linear_1_566)" id="Vector_2" />
          <path d={svgPaths.p3fb64680} fill="url(#paint2_linear_1_566)" id="Vector_3" />
          <path d={svgPaths.p33e02200} fill="url(#paint3_linear_1_566)" id="Vector_4" />
          <path d={svgPaths.p33e02200} fill="url(#paint4_linear_1_566)" id="Vector_5" />
          <path d={svgPaths.p3b04b480} fill="url(#paint5_radial_1_566)" id="Vector_6" />
          <path d={svgPaths.p248f9400} fill="url(#paint6_linear_1_566)" id="Vector_7" />
          <path d={svgPaths.p248f9400} fill="url(#paint7_radial_1_566)" id="Vector_8" />
          <path d={svgPaths.p248f9400} fill="url(#paint8_radial_1_566)" id="Vector_9" />
          <path d={svgPaths.p2825c500} fill="url(#paint9_radial_1_566)" id="Vector_10" />
          <path d={svgPaths.p2825c500} fill="url(#paint10_linear_1_566)" id="Vector_11" />
          <path d={svgPaths.p219ad800} fill="url(#paint11_radial_1_566)" id="Vector_12" />
          <path d={svgPaths.p219ad800} fill="url(#paint12_radial_1_566)" id="Vector_13" />
          <path d={svgPaths.p21101900} fill="var(--fill-0, white)" id="Vector_14" />
          <path d={svgPaths.p31ff5280} fill="var(--fill-0, white)" id="Vector_15" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_566" x1="19.2473" x2="86.7973" y1="52.7103" y2="10.8853">
            <stop stopColor="#20A7FA" />
            <stop offset="0.4" stopColor="#3BD5FF" />
            <stop offset="1" stopColor="#C4B0FF" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_566" x1="42.5264" x2="80.0639" y1="66.9726" y2="6.86012">
            <stop stopColor="#165AD9" />
            <stop offset="0.5" stopColor="#0091FF" />
            <stop offset="1" stopColor="#8587FF" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_566" x1="69.9139" x2="28.1764" y1="67.8476" y2="33.8101">
            <stop offset="0.24" stopColor="#448AFF" stopOpacity="0" />
            <stop offset="0.79" stopColor="#0032B1" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_1_566" x1="64.5764" x2="130.551" y1="80.8854" y2="38.7104">
            <stop stopColor="#1A43A6" />
            <stop offset="0.49" stopColor="#2052CB" />
            <stop offset="1" stopColor="#5F20CB" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint4_linear_1_566" x1="83.2139" x2="43.1389" y1="78.4354" y2="43.6979">
            <stop stopColor="#0045B9" stopOpacity="0" />
            <stop offset="0.67" stopColor="#0D1F69" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(64.3973 2.57269) rotate(-90) scale(87.0451 94.213)" gradientUnits="userSpaceOnUse" id="paint5_radial_1_566" r="1">
            <stop offset="0.57" stopColor="#275FF0" stopOpacity="0" />
            <stop offset="0.99" stopColor="#002177" />
          </radialGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint6_linear_1_566" x1="122.41" x2="63.9598" y1="77.1226" y2="77.1226">
            <stop stopColor="#4DC4FF" />
            <stop offset="0.2" stopColor="#0FAFFF" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(77.5963 102.85) rotate(-45) scale(37.3032)" gradientUnits="userSpaceOnUse" id="paint7_radial_1_566" r="1">
            <stop offset="0.26" stopColor="#0060D1" stopOpacity="0.4" />
            <stop offset="0.91" stopColor="#0383F1" stopOpacity="0" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(21.3298 130.37) rotate(-52.66) scale(126.627 114.503)" gradientUnits="userSpaceOnUse" id="paint8_radial_1_566" r="1">
            <stop offset="0.73" stopColor="#F4A7F7" stopOpacity="0" />
            <stop offset="1" stopColor="#F4A7F7" stopOpacity="0.5" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(46.8973 69.4226) rotate(123.339) scale(66.8111 173.383)" gradientUnits="userSpaceOnUse" id="paint9_radial_1_566" r="1">
            <stop stopColor="#49DEFF" />
            <stop offset="0.72" stopColor="#29C3FF" />
          </radialGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint10_linear_1_566" x1="-1.84023" x2="54.5098" y1="102.673" y2="102.673">
            <stop offset="0.21" stopColor="#6CE0FF" />
            <stop offset="0.54" stopColor="#50D5FF" stopOpacity="0" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(-0.249215 56.7328) rotate(46.92) scale(67.8942 67.8942)" gradientUnits="userSpaceOnUse" id="paint11_radial_1_566" r="1">
            <stop offset="0.04" stopColor="#0091FF" />
            <stop offset="0.92" stopColor="#183DAD" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(25.725 86.223) rotate(90) scale(36.104 41.6447)" gradientUnits="userSpaceOnUse" id="paint12_radial_1_566" r="1">
            <stop offset="0.56" stopColor="#0FA5F7" stopOpacity="0" />
            <stop offset="1" stopColor="#74C6FF" stopOpacity="0.5" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

function ClipPathGroup() {
  return (
    <div className="absolute contents inset-[7%_3.75%_10.19%_8.75%]" data-name="Clip path group">
      <Group />
    </div>
  );
}

function MicrosoftOutlookSvg() {
  return (
    <div className="overflow-clip relative shrink-0 size-[140px]" data-name="microsoft-outlook.svg">
      <ClipPathGroup />
    </div>
  );
}

function MicrosoftOutlookSvgFill() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[140px]" data-name="microsoft-outlook.svg fill">
      <MicrosoftOutlookSvg />
    </div>
  );
}

function OutlookEmail() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 size-[140px]" data-name="outlook-email">
      <MicrosoftOutlookSvgFill />
    </div>
  );
}

function Svg16() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SVG">
          <path d={svgPaths.p1100df00} fill="var(--fill-0, #E8E8E8)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonMenu2() {
  return (
    <div className="backdrop-blur-[6px] bg-[rgba(232,232,232,0.06)] content-stretch flex items-center justify-center p-px relative rounded-[16777200px] shrink-0 size-[36px]" data-name="Button menu">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[16777200px]" />
      <Svg16 />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex gap-[21px] items-center relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[22.7px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[33.6px]">Website Redesign</p>
      </div>
      <ButtonMenu2 />
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[672px] relative shrink-0 w-[672px]" data-name="Container">
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[24px] relative shrink-0 text-[15.4px] text-[rgba(232,232,232,0.6)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="mb-0">Automatically looks at incoming emails and determines if they should be replied to. If so, it will</p>
        <p>write a draft response. Draft responses will be found directly in your email account and in Sana.</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Container">
      <Heading />
      <Container29 />
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-center min-h-px min-w-px relative" data-name="Container">
      <Container28 />
    </div>
  );
}

function Header() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-full" data-name="Header">
      <OutlookEmail />
      <Container27 />
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(232,232,232,0.6)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.6px]">Created by</p>
      </div>
    </div>
  );
}

function Img() {
  return (
    <div className="relative rounded-[9999px] shrink-0 size-[24px]" data-name="img">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[9999px] size-full" src={img9D5C278F76A24319A3Ec5801F0E7B741} />
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[18px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[28.8px]">Nick</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Container">
      <Img />
      <Container33 />
    </div>
  );
}

function Container30() {
  return (
    <div className="h-[56.39px] relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] h-full items-start relative">
        <Container31 />
        <Container32 />
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(232,232,232,0.6)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.6px]">Status</p>
      </div>
    </div>
  );
}

function OverlayBorder() {
  return (
    <div className="bg-[rgba(0,122,187,0.1)] content-stretch flex gap-[6px] items-center px-[9px] py-[3px] relative rounded-[16777200px] shrink-0" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(0,122,187,0.4)] border-solid inset-0 pointer-events-none rounded-[16777200px]" />
      <div className="bg-[#0087d5] rounded-[16777200px] shrink-0 size-[6px]" data-name="Background" />
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#cbdafb] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[21px]">Draft</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex flex-col h-[29px] items-start justify-center relative shrink-0 w-full" data-name="Container">
      <OverlayBorder />
    </div>
  );
}

function Container34() {
  return (
    <div className="h-[56.39px] relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] h-full items-start relative">
        <Container35 />
        <Container36 />
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(232,232,232,0.6)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.6px]">Category</p>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[18px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[28.8px]">Webdesign</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="h-[56.39px] relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] h-full items-start relative">
        <Container38 />
        <Container39 />
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(232,232,232,0.6)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.6px]">Deadline</p>
      </div>
    </div>
  );
}

function MicrosoftOutlookSvg1() {
  return (
    <div className="overflow-clip relative shrink-0 size-[22px]" data-name="microsoft-outlook.svg">
      <div className="absolute inset-[-2.5%]" data-name="calendar">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgCalendar} />
      </div>
    </div>
  );
}

function MicrosoftOutlookSvgFill1() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[22px]" data-name="microsoft-outlook.svg fill">
      <MicrosoftOutlookSvg1 />
    </div>
  );
}

function OutlookEmail1() {
  return (
    <div className="relative shrink-0 size-[22px]" data-name="outlook-email">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <MicrosoftOutlookSvgFill1 />
      </div>
    </div>
  );
}

function Border() {
  return (
    <div className="content-stretch flex items-center relative rounded-[8.8px] shrink-0" data-name="Border">
      <OutlookEmail1 />
    </div>
  );
}

function Container43() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[90px]" data-name="Container">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[18px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[28.8px]">24.02.26</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Container">
      <Border />
      <Container43 />
    </div>
  );
}

function Container40() {
  return (
    <div className="h-[56.39px] relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] h-full items-start relative">
        <Container41 />
        <Container42 />
      </div>
    </div>
  );
}

function HorizontalBorder2() {
  return (
    <div className="content-stretch flex gap-[40px] items-center pt-[17px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(232,232,232,0.05)] border-solid border-t inset-0 pointer-events-none" />
      <Container30 />
      <Container34 />
      <Container37 />
      <Container40 />
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[40px] relative shrink-0 w-full" data-name="Margin">
      <HorizontalBorder2 />
    </div>
  );
}

function Tab() {
  return (
    <div className="backdrop-blur-[6px] bg-[rgba(232,232,232,0.05)] content-stretch flex h-[36px] items-center justify-center px-[17px] py-[7px] relative rounded-[16777200px] shrink-0" data-name="Tab">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[16777200px]" />
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[14px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">Assets</p>
      </div>
    </div>
  );
}

function Tab1() {
  return (
    <div className="backdrop-blur-[6px] content-stretch flex h-[36px] items-center justify-center px-[17px] py-[7px] relative rounded-[16777200px] shrink-0" data-name="Tab">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[16777200px]" />
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[14px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">Contract</p>
      </div>
    </div>
  );
}

function Svg17() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SVG">
          <path d={svgPaths.p34261000} fill="var(--fill-0, black)" fillOpacity="0.667" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container49() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <Svg17 />
      </div>
    </div>
  );
}

function ButtonMenu3() {
  return (
    <div className="bg-[#e8e8e8] content-stretch flex gap-[4px] items-center justify-center pb-[8.25px] pl-[9px] pr-[13px] pt-[7.75px] relative rounded-[16777200px] shrink-0" data-name="Button menu">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[16777200px]" />
      <Container49 />
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#141415] text-[13px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.5px]">Add asset</p>
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div className="content-stretch flex flex-[1_0_0] h-full items-start justify-end min-h-px min-w-px relative" data-name="Container">
      <ButtonMenu3 />
    </div>
  );
}

function Tablist() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Tablist">
      <Tab />
      <Tab1 />
      <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
        <Container48 />
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex flex-col h-[58px] items-start relative shrink-0 w-full" data-name="Container">
      <Tablist />
    </div>
  );
}

function Container46() {
  return (
    <div className="content-stretch flex flex-col h-[58px] items-start overflow-auto relative shrink-0 w-full" data-name="Container">
      <Container47 />
    </div>
  );
}

function Container52() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col items-start left-[calc(50%+14.49px)] overflow-clip pr-[236.97px] py-[1.5px] top-[calc(50%-0.5px)]" data-name="Container">
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[13.9px] text-[rgba(232,232,232,0.4)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[normal]">Search content</p>
      </div>
    </div>
  );
}

function Container53() {
  return <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[20px] left-[calc(50%+14px)] top-1/2 w-[330px]" data-name="Container" />;
}

function Input() {
  return (
    <div className="h-[36px] relative rounded-[18px] shrink-0 w-full" data-name="Input">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Container52 />
        <Container53 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(232,232,232,0.15)] border-solid inset-0 pointer-events-none rounded-[18px]" />
    </div>
  );
}

function Svg18() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SVG">
          <path d={svgPaths.p3f80a980} fill="var(--fill-0, #E8E8E8)" fillOpacity="0.4" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container54() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-start left-[12px] size-[16px] top-1/2" data-name="Container">
      <Svg18 />
    </div>
  );
}

function Container51() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0 w-[384px]" data-name="Container">
      <Input />
      <Container54 />
    </div>
  );
}

function Container57() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(232,232,232,0.6)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[21px]">Relevance</p>
      </div>
    </div>
  );
}

function Container56() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Container">
      <Container57 />
    </div>
  );
}

function Margin3() {
  return (
    <div className="content-stretch flex flex-col items-start pr-[8px] relative shrink-0" data-name="Margin">
      <Container56 />
    </div>
  );
}

function Svg19() {
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

function Container58() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 size-[16px]" data-name="Container">
      <Svg19 />
    </div>
  );
}

function ComboboxSelectOption() {
  return (
    <div className="content-stretch flex items-center py-[7.5px] relative rounded-[100px] shrink-0" data-name="Combobox - Select option">
      <Margin3 />
      <Container58 />
    </div>
  );
}

function Container55() {
  return (
    <div className="content-stretch flex items-start px-[12px] relative rounded-[100px] self-stretch shrink-0" data-name="Container">
      <ComboboxSelectOption />
    </div>
  );
}

function Container50() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container51 />
      <Container55 />
    </div>
  );
}

function DemoTeamspaceAssistantFile1Png() {
  return (
    <div className="h-[48px] max-h-[48px] max-w-[48px] min-w-[34px] pointer-events-none relative shrink-0 w-[37.58px]" data-name="demo-teamspace-assistant-file-1.png">
      <div className="absolute inset-0 overflow-hidden">
        <img alt="" className="absolute h-[101.23%] left-0 max-w-none top-[-0.61%] w-full" src={imgDemoTeamspaceAssistantFile1Png} />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(232,232,232,0.02)] border-solid inset-0 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.03),0px_0.5px_2px_0px_rgba(0,0,0,0.16)]" />
    </div>
  );
}

function Container60() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[48px]" data-name="Container">
      <DemoTeamspaceAssistantFile1Png />
    </div>
  );
}

function Container63() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Container">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[14px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.6px] whitespace-pre-wrap">Demo - Customer email</p>
      </div>
    </div>
  );
}

function Container62() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <Container63 />
    </div>
  );
}

function Container66() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[13px] text-[rgba(232,232,232,0.4)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.5px]">PDF</p>
      </div>
    </div>
  );
}

function Time() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Time">
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12.6px] text-[rgba(232,232,232,0.4)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.5px]">3. Okt. 2025, 10:25</p>
      </div>
    </div>
  );
}

function Container65() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Container">
      <Container66 />
      <Time />
    </div>
  );
}

function Container64() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <Container65 />
    </div>
  );
}

function Container61() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start justify-center min-h-px min-w-px overflow-clip relative self-stretch" data-name="Container">
      <Container62 />
      <Container64 />
    </div>
  );
}

function Container59() {
  return (
    <div className="max-h-[68px] relative rounded-[14px] shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex gap-[16px] items-start max-h-[inherit] px-[12px] py-[10px] relative w-full">
        <Container60 />
        <Container61 />
      </div>
    </div>
  );
}

function ItemLink3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item → Link">
      <Container59 />
    </div>
  );
}

function DemoTeamspaceAssistantFile2Png() {
  return (
    <div className="h-[48px] max-h-[48px] max-w-[48px] min-w-[34px] pointer-events-none relative shrink-0 w-[37.58px]" data-name="demo-teamspace-assistant-file-2.png">
      <div className="absolute inset-0 overflow-hidden">
        <img alt="" className="absolute h-[101.23%] left-0 max-w-none top-[-0.61%] w-full" src={imgDemoTeamspaceAssistantFile2Png} />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(232,232,232,0.02)] border-solid inset-0 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.03),0px_0.5px_2px_0px_rgba(0,0,0,0.16)]" />
    </div>
  );
}

function Container68() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[48px]" data-name="Container">
      <DemoTeamspaceAssistantFile2Png />
    </div>
  );
}

function Container71() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Container">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[14px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.6px] whitespace-pre-wrap">Demo - Sample Job Description</p>
      </div>
    </div>
  );
}

function Container70() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <Container71 />
    </div>
  );
}

function Container74() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[13px] text-[rgba(232,232,232,0.4)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.5px]">PDF</p>
      </div>
    </div>
  );
}

function Time1() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Time">
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12.6px] text-[rgba(232,232,232,0.4)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.5px]">3. Okt. 2025, 10:25</p>
      </div>
    </div>
  );
}

function Container73() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Container">
      <Container74 />
      <Time1 />
    </div>
  );
}

function Container72() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <Container73 />
    </div>
  );
}

function Container69() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start justify-center overflow-clip relative self-stretch shrink-0 w-[693px]" data-name="Container">
      <Container70 />
      <Container72 />
    </div>
  );
}

function Container67() {
  return (
    <div className="content-stretch flex gap-[16px] items-start max-h-[68px] px-[12px] py-[10px] relative rounded-[14px] shrink-0 w-[797px]" data-name="Container">
      <Container68 />
      <Container69 />
    </div>
  );
}

function ItemLink4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item → Link">
      <Container67 />
    </div>
  );
}

function DemoTeamspaceAssistantFile3Png() {
  return (
    <div className="h-[48px] max-h-[48px] max-w-[48px] min-w-[34px] pointer-events-none relative shrink-0 w-[37.58px]" data-name="demo-teamspace-assistant-file-3.png">
      <div className="absolute inset-0 overflow-hidden">
        <img alt="" className="absolute h-[101.23%] left-0 max-w-none top-[-0.61%] w-full" src={imgDemoTeamspaceAssistantFile3Png} />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(232,232,232,0.02)] border-solid inset-0 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.03),0px_0.5px_2px_0px_rgba(0,0,0,0.16)]" />
    </div>
  );
}

function Container76() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[48px]" data-name="Container">
      <DemoTeamspaceAssistantFile3Png />
    </div>
  );
}

function Container79() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Container">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[14px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.6px] whitespace-pre-wrap">Demo - Product Description Product 1</p>
      </div>
    </div>
  );
}

function Container78() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <Container79 />
    </div>
  );
}

function Container82() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[13px] text-[rgba(232,232,232,0.4)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.5px]">PDF</p>
      </div>
    </div>
  );
}

function Time2() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Time">
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12.6px] text-[rgba(232,232,232,0.4)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.5px]">3. Okt. 2025, 10:25</p>
      </div>
    </div>
  );
}

function Container81() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Container">
      <Container82 />
      <Time2 />
    </div>
  );
}

function Container80() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <Container81 />
    </div>
  );
}

function Container77() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start justify-center overflow-clip relative self-stretch shrink-0 w-[693px]" data-name="Container">
      <Container78 />
      <Container80 />
    </div>
  );
}

function Container75() {
  return (
    <div className="content-stretch flex gap-[16px] items-start max-h-[68px] px-[12px] py-[10px] relative rounded-[14px] shrink-0 w-[797px]" data-name="Container">
      <Container76 />
      <Container77 />
    </div>
  );
}

function ItemLink5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item → Link">
      <Container75 />
    </div>
  );
}

function DemoTeamspaceAssistantFile4Png() {
  return (
    <div className="h-[48px] max-h-[48px] max-w-[48px] min-w-[34px] pointer-events-none relative shrink-0 w-[37.58px]" data-name="demo-teamspace-assistant-file-4.png">
      <div className="absolute inset-0 overflow-hidden">
        <img alt="" className="absolute h-[101.23%] left-0 max-w-none top-[-0.61%] w-full" src={imgDemoTeamspaceAssistantFile4Png} />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(232,232,232,0.02)] border-solid inset-0 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.03),0px_0.5px_2px_0px_rgba(0,0,0,0.16)]" />
    </div>
  );
}

function Container84() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[48px]" data-name="Container">
      <DemoTeamspaceAssistantFile4Png />
    </div>
  );
}

function Container87() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Container">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[14px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.6px] whitespace-pre-wrap">Demo - Acme Series B Term Sheet</p>
      </div>
    </div>
  );
}

function Container86() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <Container87 />
    </div>
  );
}

function Container90() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[13px] text-[rgba(232,232,232,0.4)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.5px]">PDF</p>
      </div>
    </div>
  );
}

function Time3() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Time">
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12.6px] text-[rgba(232,232,232,0.4)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.5px]">3. Okt. 2025, 10:25</p>
      </div>
    </div>
  );
}

function Container89() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Container">
      <Container90 />
      <Time3 />
    </div>
  );
}

function Container88() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <Container89 />
    </div>
  );
}

function Container85() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start justify-center overflow-clip relative self-stretch shrink-0 w-[693px]" data-name="Container">
      <Container86 />
      <Container88 />
    </div>
  );
}

function Container83() {
  return (
    <div className="content-stretch flex gap-[16px] items-start max-h-[68px] px-[12px] py-[10px] relative rounded-[14px] shrink-0 w-[797px]" data-name="Container">
      <Container84 />
      <Container85 />
    </div>
  );
}

function ItemLink6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item → Link">
      <Container83 />
    </div>
  );
}

function DemoTeamspaceAssistantFile5Png() {
  return (
    <div className="h-[48px] max-h-[48px] max-w-[48px] min-w-[34px] pointer-events-none relative shrink-0 w-[37.58px]" data-name="demo-teamspace-assistant-file-5.png">
      <div className="absolute inset-0 overflow-hidden">
        <img alt="" className="absolute h-[101.23%] left-0 max-w-none top-[-0.61%] w-full" src={imgDemoTeamspaceAssistantFile5Png} />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(232,232,232,0.02)] border-solid inset-0 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.03),0px_0.5px_2px_0px_rgba(0,0,0,0.16)]" />
    </div>
  );
}

function Container92() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[48px]" data-name="Container">
      <DemoTeamspaceAssistantFile5Png />
    </div>
  );
}

function Container95() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Container">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[14px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.6px] whitespace-pre-wrap">Demo - Blog Post</p>
      </div>
    </div>
  );
}

function Container94() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <Container95 />
    </div>
  );
}

function Container98() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[13px] text-[rgba(232,232,232,0.4)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.5px]">PDF</p>
      </div>
    </div>
  );
}

function Time4() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Time">
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12.6px] text-[rgba(232,232,232,0.4)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.5px]">3. Okt. 2025, 10:25</p>
      </div>
    </div>
  );
}

function Container97() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Container">
      <Container98 />
      <Time4 />
    </div>
  );
}

function Container96() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <Container97 />
    </div>
  );
}

function Container93() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start justify-center overflow-clip relative self-stretch shrink-0 w-[693px]" data-name="Container">
      <Container94 />
      <Container96 />
    </div>
  );
}

function Container91() {
  return (
    <div className="content-stretch flex gap-[16px] items-start max-h-[68px] px-[12px] py-[10px] relative rounded-[14px] shrink-0 w-[797px]" data-name="Container">
      <Container92 />
      <Container93 />
    </div>
  );
}

function ItemLink7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item → Link">
      <Container91 />
    </div>
  );
}

function List3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="List">
      <ItemLink3 />
      <ItemLink4 />
      <ItemLink5 />
      <ItemLink6 />
      <ItemLink7 />
    </div>
  );
}

function Svg20() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="SVG">
          <path d={svgPaths.pac4a880} fill="var(--fill-0, #E8E8E8)" fillOpacity="0.4" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container101() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(232,232,232,0.4)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          <p className="leading-[20px]">Previous</p>
        </div>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="content-stretch flex gap-[6px] h-[36px] items-center justify-center px-[17px] py-[7px] relative rounded-[16777200px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[16777200px]" />
      <Svg20 />
      <Container101 />
    </div>
  );
}

function Button3() {
  return (
    <div className="backdrop-blur-[6px] bg-[rgba(232,232,232,0.06)] content-stretch flex items-center justify-center p-px relative rounded-[16777200px] shrink-0 size-[36px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[16777200px]" />
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[12px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[15.6px]">1</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="content-stretch flex items-center justify-center p-px relative rounded-[16777200px] shrink-0 size-[36px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[16777200px]" />
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[12px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[15.6px]">2</p>
      </div>
    </div>
  );
}

function Button5() {
  return (
    <div className="content-stretch flex items-center justify-center p-px relative rounded-[16777200px] shrink-0 size-[36px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[16777200px]" />
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[12px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[15.6px]">3</p>
      </div>
    </div>
  );
}

function Container102() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(232,232,232,0.6)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          <p className="leading-[20px]">Next</p>
        </div>
      </div>
    </div>
  );
}

function Svg21() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="SVG">
          <path d={svgPaths.p2d42e440} fill="var(--fill-0, #E8E8E8)" fillOpacity="0.6" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="content-stretch flex gap-[6px] h-[36px] items-center justify-center px-[17px] py-[7px] relative rounded-[16777200px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[16777200px]" />
      <Container102 />
      <Svg21 />
    </div>
  );
}

function Container100() {
  return (
    <div className="content-stretch flex gap-px items-center relative shrink-0" data-name="Container">
      <Button2 />
      <Button3 />
      <Button4 />
      <Button5 />
      <Button6 />
    </div>
  );
}

function Container99() {
  return (
    <div className="content-stretch flex items-center justify-center pb-[24px] pt-[8px] relative shrink-0 w-full" data-name="Container">
      <Container100 />
    </div>
  );
}

function Tabpanel() {
  return (
    <div className="relative shrink-0 w-full" data-name="Tabpanel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-end relative w-full">
        <Container50 />
        <List3 />
        <Container99 />
      </div>
    </div>
  );
}

function HorizontalBorder3() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[25px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(232,232,232,0.05)] border-solid border-t inset-0 pointer-events-none" />
      <Tabpanel />
    </div>
  );
}

function Container45() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Container">
      <Container46 />
      <HorizontalBorder3 />
    </div>
  );
}

function Container44() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Container45 />
    </div>
  );
}

function Margin2() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[32px] relative shrink-0 w-full" data-name="Margin">
      <Container44 />
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[40px] relative shrink-0 w-full" data-name="Margin">
      <Margin2 />
    </div>
  );
}

function Container26() {
  return (
    <div className="max-w-[1152px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start max-w-[inherit] pb-[112px] pt-[40px] px-[80px] relative w-full">
        <Header />
        <Margin />
        <Margin1 />
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[7px] relative w-full">
        <Container26 />
      </div>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="bg-[#141415] flex-[1_0_0] min-h-px min-w-px relative rounded-[32px] w-full" data-name="Background+Border">
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <HorizontalBorder1 />
        <Container25 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(232,232,232,0.04)] border-solid inset-0 pointer-events-none rounded-[32px]" />
    </div>
  );
}

function Main() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Main">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-center p-[8px] relative size-full">
          <BackgroundBorder />
        </div>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex h-[900px] items-start relative shrink-0 w-full" data-name="Container">
      <Container24 />
      <Main />
    </div>
  );
}

export default function Redesign() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="redesign" style={{ backgroundImage: "linear-gradient(90deg, rgb(20, 20, 21) 0%, rgb(20, 20, 21) 100%), linear-gradient(90deg, rgb(18, 18, 18) 0%, rgb(18, 18, 18) 100%)" }}>
      <Container />
      <Container23 />
    </div>
  );
}