import svgPaths from "./svg-v61uoamt04";
import imgMargin from "figma:asset/5d34dbbe9efe462031f89ce6f69320ea3cb706ad.png";
import { imgGroup } from "./svg-4v64g";

function Heading() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Heading 2">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[17.7px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[25.2px]">Create a new Project</p>
      </div>
    </div>
  );
}

function Svg() {
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
      <Svg />
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Container">
      <ButtonClose />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full">
      <Heading />
      <Container />
    </div>
  );
}

function Margin() {
  return (
    <div className="h-[187px] relative shrink-0 w-full" data-name="Margin">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-cover pointer-events-none size-full" src={imgMargin} />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start px-[32px] py-[24px] relative size-full">
        <Frame1 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-[1_0_0] flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] min-h-px min-w-px relative text-[#e8e8e8] text-[14px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.6px] whitespace-pre-wrap">Solutions</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[13.8px] text-[rgba(232,232,232,0.6)] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[19.6px] whitespace-pre-wrap">Choose the service that fit your needs.</p>
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[8px] pt-[4px] relative shrink-0 w-full" data-name="Margin">
      <Container3 />
    </div>
  );
}

function Group() {
  return (
    <div className="col-1 h-[15.159px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0.005px] mask-size-[16px_15.143px] ml-0 mt-[-0.03%] relative row-1 w-[15.989px]" data-name="Group" style={{ maskImage: `url('${imgGroup}')` }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9889 15.1589">
        <g id="Group">
          <path d={svgPaths.p1580a300} fill="url(#paint0_linear_10_337)" id="Vector" />
          <path d={svgPaths.p251ad2c0} fill="url(#paint1_linear_10_337)" id="Vector_2" />
          <path d={svgPaths.p251ad2c0} fill="url(#paint2_linear_10_337)" id="Vector_3" />
          <path d={svgPaths.p3d7f4a80} fill="url(#paint3_linear_10_337)" id="Vector_4" />
          <path d={svgPaths.p3d7f4a80} fill="url(#paint4_linear_10_337)" id="Vector_5" />
          <path d={svgPaths.p36e1bf80} fill="url(#paint5_radial_10_337)" id="Vector_6" />
          <path d={svgPaths.p128ee80} fill="url(#paint6_linear_10_337)" id="Vector_7" />
          <path d={svgPaths.p128ee80} fill="url(#paint7_radial_10_337)" id="Vector_8" />
          <path d={svgPaths.p128ee80} fill="url(#paint8_radial_10_337)" id="Vector_9" />
          <path d={svgPaths.p3bc88f00} fill="url(#paint9_radial_10_337)" id="Vector_10" />
          <path d={svgPaths.p3bc88f00} fill="url(#paint10_linear_10_337)" id="Vector_11" />
          <path d={svgPaths.p9fbe800} fill="url(#paint11_radial_10_337)" id="Vector_12" />
          <path d={svgPaths.p9fbe800} fill="url(#paint12_radial_10_337)" id="Vector_13" />
          <path d={svgPaths.p22ddb670} fill="var(--fill-0, white)" id="Vector_14" />
          <path d={svgPaths.p277dcf00} fill="var(--fill-0, white)" id="Vector_15" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_10_337" x1="2.51393" x2="11.3368" y1="6.88462" y2="1.42176">
            <stop stopColor="#20A7FA" />
            <stop offset="0.4" stopColor="#3BD5FF" />
            <stop offset="1" stopColor="#C4B0FF" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_10_337" x1="5.55459" x2="10.4574" y1="8.74745" y2="0.896022">
            <stop stopColor="#165AD9" />
            <stop offset="0.5" stopColor="#0091FF" />
            <stop offset="1" stopColor="#8587FF" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_10_337" x1="9.13174" x2="3.68031" y1="8.86174" y2="4.41602">
            <stop offset="0.24" stopColor="#448AFF" stopOpacity="0" />
            <stop offset="0.79" stopColor="#0032B1" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_10_337" x1="8.43459" x2="17.0517" y1="10.5647" y2="5.05608">
            <stop stopColor="#1A43A6" />
            <stop offset="0.49" stopColor="#2052CB" />
            <stop offset="1" stopColor="#5F20CB" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint4_linear_10_337" x1="10.8689" x2="5.63459" y1="10.2447" y2="5.70751">
            <stop stopColor="#0045B9" stopOpacity="0" />
            <stop offset="0.67" stopColor="#0D1F69" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(8.41107 0.336023) rotate(-90) scale(11.3692 12.3054)" gradientUnits="userSpaceOnUse" id="paint5_radial_10_337" r="1">
            <stop offset="0.57" stopColor="#275FF0" stopOpacity="0" />
            <stop offset="0.99" stopColor="#002177" />
          </radialGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint6_linear_10_337" x1="15.9882" x2="8.35393" y1="10.0732" y2="10.0732">
            <stop stopColor="#4DC4FF" />
            <stop offset="0.2" stopColor="#0FAFFF" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(10.135 13.4335) rotate(-45) scale(4.87225)" gradientUnits="userSpaceOnUse" id="paint7_radial_10_337" r="1">
            <stop offset="0.26" stopColor="#0060D1" stopOpacity="0.4" />
            <stop offset="0.91" stopColor="#0383F1" stopOpacity="0" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(2.78593 17.0279) rotate(-52.66) scale(16.539 14.9554)" gradientUnits="userSpaceOnUse" id="paint8_radial_10_337" r="1">
            <stop offset="0.73" stopColor="#F4A7F7" stopOpacity="0" />
            <stop offset="1" stopColor="#F4A7F7" stopOpacity="0.5" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(6.12536 9.06745) rotate(123.339) scale(8.72634 22.6459)" gradientUnits="userSpaceOnUse" id="paint9_radial_10_337" r="1">
            <stop stopColor="#49DEFF" />
            <stop offset="0.72" stopColor="#29C3FF" />
          </radialGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint10_linear_10_337" x1="-0.240357" x2="7.11964" y1="13.4103" y2="13.4103">
            <stop offset="0.21" stopColor="#6CE0FF" />
            <stop offset="0.54" stopColor="#50D5FF" stopOpacity="0" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(-0.0325506 7.41) rotate(46.92) scale(8.86782)" gradientUnits="userSpaceOnUse" id="paint11_radial_10_337" r="1">
            <stop offset="0.04" stopColor="#0091FF" />
            <stop offset="0.92" stopColor="#183DAD" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(3.36 11.2618) rotate(90) scale(4.71562 5.4393)" gradientUnits="userSpaceOnUse" id="paint12_radial_10_337" r="1">
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
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0" data-name="Clip path group">
      <Group />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <ClipPathGroup />
    </div>
  );
}

function ItemButton({ className }: { className?: string }) {
  return (
    <div className={className || "content-stretch flex gap-[8px] h-[36px] items-center px-[14px] relative rounded-[1000px] shrink-0"} data-name="Item → Button">
      <Container4 />
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[21px]">Web Design</p>
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="col-1 h-[15.159px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0.005px] mask-size-[16px_15.143px] ml-0 mt-[-0.03%] relative row-1 w-[15.989px]" data-name="Group" style={{ maskImage: `url('${imgGroup}')` }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9889 15.1589">
        <g id="Group">
          <path d={svgPaths.p1580a300} fill="url(#paint0_linear_10_337)" id="Vector" />
          <path d={svgPaths.p251ad2c0} fill="url(#paint1_linear_10_337)" id="Vector_2" />
          <path d={svgPaths.p251ad2c0} fill="url(#paint2_linear_10_337)" id="Vector_3" />
          <path d={svgPaths.p3d7f4a80} fill="url(#paint3_linear_10_337)" id="Vector_4" />
          <path d={svgPaths.p3d7f4a80} fill="url(#paint4_linear_10_337)" id="Vector_5" />
          <path d={svgPaths.p36e1bf80} fill="url(#paint5_radial_10_337)" id="Vector_6" />
          <path d={svgPaths.p128ee80} fill="url(#paint6_linear_10_337)" id="Vector_7" />
          <path d={svgPaths.p128ee80} fill="url(#paint7_radial_10_337)" id="Vector_8" />
          <path d={svgPaths.p128ee80} fill="url(#paint8_radial_10_337)" id="Vector_9" />
          <path d={svgPaths.p3bc88f00} fill="url(#paint9_radial_10_337)" id="Vector_10" />
          <path d={svgPaths.p3bc88f00} fill="url(#paint10_linear_10_337)" id="Vector_11" />
          <path d={svgPaths.p9fbe800} fill="url(#paint11_radial_10_337)" id="Vector_12" />
          <path d={svgPaths.p9fbe800} fill="url(#paint12_radial_10_337)" id="Vector_13" />
          <path d={svgPaths.p22ddb670} fill="var(--fill-0, white)" id="Vector_14" />
          <path d={svgPaths.p277dcf00} fill="var(--fill-0, white)" id="Vector_15" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_10_337" x1="2.51393" x2="11.3368" y1="6.88462" y2="1.42176">
            <stop stopColor="#20A7FA" />
            <stop offset="0.4" stopColor="#3BD5FF" />
            <stop offset="1" stopColor="#C4B0FF" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_10_337" x1="5.55459" x2="10.4574" y1="8.74745" y2="0.896022">
            <stop stopColor="#165AD9" />
            <stop offset="0.5" stopColor="#0091FF" />
            <stop offset="1" stopColor="#8587FF" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_10_337" x1="9.13174" x2="3.68031" y1="8.86174" y2="4.41602">
            <stop offset="0.24" stopColor="#448AFF" stopOpacity="0" />
            <stop offset="0.79" stopColor="#0032B1" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_10_337" x1="8.43459" x2="17.0517" y1="10.5647" y2="5.05608">
            <stop stopColor="#1A43A6" />
            <stop offset="0.49" stopColor="#2052CB" />
            <stop offset="1" stopColor="#5F20CB" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint4_linear_10_337" x1="10.8689" x2="5.63459" y1="10.2447" y2="5.70751">
            <stop stopColor="#0045B9" stopOpacity="0" />
            <stop offset="0.67" stopColor="#0D1F69" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(8.41107 0.336023) rotate(-90) scale(11.3692 12.3054)" gradientUnits="userSpaceOnUse" id="paint5_radial_10_337" r="1">
            <stop offset="0.57" stopColor="#275FF0" stopOpacity="0" />
            <stop offset="0.99" stopColor="#002177" />
          </radialGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint6_linear_10_337" x1="15.9882" x2="8.35393" y1="10.0732" y2="10.0732">
            <stop stopColor="#4DC4FF" />
            <stop offset="0.2" stopColor="#0FAFFF" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(10.135 13.4335) rotate(-45) scale(4.87225)" gradientUnits="userSpaceOnUse" id="paint7_radial_10_337" r="1">
            <stop offset="0.26" stopColor="#0060D1" stopOpacity="0.4" />
            <stop offset="0.91" stopColor="#0383F1" stopOpacity="0" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(2.78593 17.0279) rotate(-52.66) scale(16.539 14.9554)" gradientUnits="userSpaceOnUse" id="paint8_radial_10_337" r="1">
            <stop offset="0.73" stopColor="#F4A7F7" stopOpacity="0" />
            <stop offset="1" stopColor="#F4A7F7" stopOpacity="0.5" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(6.12536 9.06745) rotate(123.339) scale(8.72634 22.6459)" gradientUnits="userSpaceOnUse" id="paint9_radial_10_337" r="1">
            <stop stopColor="#49DEFF" />
            <stop offset="0.72" stopColor="#29C3FF" />
          </radialGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint10_linear_10_337" x1="-0.240357" x2="7.11964" y1="13.4103" y2="13.4103">
            <stop offset="0.21" stopColor="#6CE0FF" />
            <stop offset="0.54" stopColor="#50D5FF" stopOpacity="0" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(-0.0325506 7.41) rotate(46.92) scale(8.86782)" gradientUnits="userSpaceOnUse" id="paint11_radial_10_337" r="1">
            <stop offset="0.04" stopColor="#0091FF" />
            <stop offset="0.92" stopColor="#183DAD" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(3.36 11.2618) rotate(90) scale(4.71562 5.4393)" gradientUnits="userSpaceOnUse" id="paint12_radial_10_337" r="1">
            <stop offset="0.56" stopColor="#0FA5F7" stopOpacity="0" />
            <stop offset="1" stopColor="#74C6FF" stopOpacity="0.5" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

function ClipPathGroup1() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0" data-name="Clip path group">
      <Group1 />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <ClipPathGroup1 />
    </div>
  );
}

function ItemButton1() {
  return (
    <div className="content-stretch flex gap-[8px] h-[36px] items-center px-[14px] relative rounded-[1000px] shrink-0" data-name="Item → Button">
      <Container5 />
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[21px]">Presentation</p>
      </div>
    </div>
  );
}

function Group2() {
  return (
    <div className="col-1 h-[15.159px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0.005px] mask-size-[16px_15.143px] ml-0 mt-[-0.03%] relative row-1 w-[15.989px]" data-name="Group" style={{ maskImage: `url('${imgGroup}')` }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9889 15.1589">
        <g id="Group">
          <path d={svgPaths.p1580a300} fill="url(#paint0_linear_10_337)" id="Vector" />
          <path d={svgPaths.p251ad2c0} fill="url(#paint1_linear_10_337)" id="Vector_2" />
          <path d={svgPaths.p251ad2c0} fill="url(#paint2_linear_10_337)" id="Vector_3" />
          <path d={svgPaths.p3d7f4a80} fill="url(#paint3_linear_10_337)" id="Vector_4" />
          <path d={svgPaths.p3d7f4a80} fill="url(#paint4_linear_10_337)" id="Vector_5" />
          <path d={svgPaths.p36e1bf80} fill="url(#paint5_radial_10_337)" id="Vector_6" />
          <path d={svgPaths.p128ee80} fill="url(#paint6_linear_10_337)" id="Vector_7" />
          <path d={svgPaths.p128ee80} fill="url(#paint7_radial_10_337)" id="Vector_8" />
          <path d={svgPaths.p128ee80} fill="url(#paint8_radial_10_337)" id="Vector_9" />
          <path d={svgPaths.p3bc88f00} fill="url(#paint9_radial_10_337)" id="Vector_10" />
          <path d={svgPaths.p3bc88f00} fill="url(#paint10_linear_10_337)" id="Vector_11" />
          <path d={svgPaths.p9fbe800} fill="url(#paint11_radial_10_337)" id="Vector_12" />
          <path d={svgPaths.p9fbe800} fill="url(#paint12_radial_10_337)" id="Vector_13" />
          <path d={svgPaths.p22ddb670} fill="var(--fill-0, white)" id="Vector_14" />
          <path d={svgPaths.p277dcf00} fill="var(--fill-0, white)" id="Vector_15" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_10_337" x1="2.51393" x2="11.3368" y1="6.88462" y2="1.42176">
            <stop stopColor="#20A7FA" />
            <stop offset="0.4" stopColor="#3BD5FF" />
            <stop offset="1" stopColor="#C4B0FF" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_10_337" x1="5.55459" x2="10.4574" y1="8.74745" y2="0.896022">
            <stop stopColor="#165AD9" />
            <stop offset="0.5" stopColor="#0091FF" />
            <stop offset="1" stopColor="#8587FF" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_10_337" x1="9.13174" x2="3.68031" y1="8.86174" y2="4.41602">
            <stop offset="0.24" stopColor="#448AFF" stopOpacity="0" />
            <stop offset="0.79" stopColor="#0032B1" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_10_337" x1="8.43459" x2="17.0517" y1="10.5647" y2="5.05608">
            <stop stopColor="#1A43A6" />
            <stop offset="0.49" stopColor="#2052CB" />
            <stop offset="1" stopColor="#5F20CB" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint4_linear_10_337" x1="10.8689" x2="5.63459" y1="10.2447" y2="5.70751">
            <stop stopColor="#0045B9" stopOpacity="0" />
            <stop offset="0.67" stopColor="#0D1F69" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(8.41107 0.336023) rotate(-90) scale(11.3692 12.3054)" gradientUnits="userSpaceOnUse" id="paint5_radial_10_337" r="1">
            <stop offset="0.57" stopColor="#275FF0" stopOpacity="0" />
            <stop offset="0.99" stopColor="#002177" />
          </radialGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint6_linear_10_337" x1="15.9882" x2="8.35393" y1="10.0732" y2="10.0732">
            <stop stopColor="#4DC4FF" />
            <stop offset="0.2" stopColor="#0FAFFF" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(10.135 13.4335) rotate(-45) scale(4.87225)" gradientUnits="userSpaceOnUse" id="paint7_radial_10_337" r="1">
            <stop offset="0.26" stopColor="#0060D1" stopOpacity="0.4" />
            <stop offset="0.91" stopColor="#0383F1" stopOpacity="0" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(2.78593 17.0279) rotate(-52.66) scale(16.539 14.9554)" gradientUnits="userSpaceOnUse" id="paint8_radial_10_337" r="1">
            <stop offset="0.73" stopColor="#F4A7F7" stopOpacity="0" />
            <stop offset="1" stopColor="#F4A7F7" stopOpacity="0.5" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(6.12536 9.06745) rotate(123.339) scale(8.72634 22.6459)" gradientUnits="userSpaceOnUse" id="paint9_radial_10_337" r="1">
            <stop stopColor="#49DEFF" />
            <stop offset="0.72" stopColor="#29C3FF" />
          </radialGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint10_linear_10_337" x1="-0.240357" x2="7.11964" y1="13.4103" y2="13.4103">
            <stop offset="0.21" stopColor="#6CE0FF" />
            <stop offset="0.54" stopColor="#50D5FF" stopOpacity="0" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(-0.0325506 7.41) rotate(46.92) scale(8.86782)" gradientUnits="userSpaceOnUse" id="paint11_radial_10_337" r="1">
            <stop offset="0.04" stopColor="#0091FF" />
            <stop offset="0.92" stopColor="#183DAD" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(3.36 11.2618) rotate(90) scale(4.71562 5.4393)" gradientUnits="userSpaceOnUse" id="paint12_radial_10_337" r="1">
            <stop offset="0.56" stopColor="#0FA5F7" stopOpacity="0" />
            <stop offset="1" stopColor="#74C6FF" stopOpacity="0.5" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

function ClipPathGroup2() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0" data-name="Clip path group">
      <Group2 />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <ClipPathGroup2 />
    </div>
  );
}

function ItemButton2() {
  return (
    <div className="content-stretch flex gap-[8px] h-[36px] items-center px-[14px] relative rounded-[1000px] shrink-0" data-name="Item → Button">
      <Container6 />
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[21px]">AI Consulting</p>
      </div>
    </div>
  );
}

function Group3() {
  return (
    <div className="col-1 h-[15.159px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0.005px] mask-size-[16px_15.143px] ml-0 mt-[-0.03%] relative row-1 w-[15.989px]" data-name="Group" style={{ maskImage: `url('${imgGroup}')` }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9889 15.1589">
        <g id="Group">
          <path d={svgPaths.p1580a300} fill="url(#paint0_linear_10_337)" id="Vector" />
          <path d={svgPaths.p251ad2c0} fill="url(#paint1_linear_10_337)" id="Vector_2" />
          <path d={svgPaths.p251ad2c0} fill="url(#paint2_linear_10_337)" id="Vector_3" />
          <path d={svgPaths.p3d7f4a80} fill="url(#paint3_linear_10_337)" id="Vector_4" />
          <path d={svgPaths.p3d7f4a80} fill="url(#paint4_linear_10_337)" id="Vector_5" />
          <path d={svgPaths.p36e1bf80} fill="url(#paint5_radial_10_337)" id="Vector_6" />
          <path d={svgPaths.p128ee80} fill="url(#paint6_linear_10_337)" id="Vector_7" />
          <path d={svgPaths.p128ee80} fill="url(#paint7_radial_10_337)" id="Vector_8" />
          <path d={svgPaths.p128ee80} fill="url(#paint8_radial_10_337)" id="Vector_9" />
          <path d={svgPaths.p3bc88f00} fill="url(#paint9_radial_10_337)" id="Vector_10" />
          <path d={svgPaths.p3bc88f00} fill="url(#paint10_linear_10_337)" id="Vector_11" />
          <path d={svgPaths.p9fbe800} fill="url(#paint11_radial_10_337)" id="Vector_12" />
          <path d={svgPaths.p9fbe800} fill="url(#paint12_radial_10_337)" id="Vector_13" />
          <path d={svgPaths.p22ddb670} fill="var(--fill-0, white)" id="Vector_14" />
          <path d={svgPaths.p277dcf00} fill="var(--fill-0, white)" id="Vector_15" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_10_337" x1="2.51393" x2="11.3368" y1="6.88462" y2="1.42176">
            <stop stopColor="#20A7FA" />
            <stop offset="0.4" stopColor="#3BD5FF" />
            <stop offset="1" stopColor="#C4B0FF" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_10_337" x1="5.55459" x2="10.4574" y1="8.74745" y2="0.896022">
            <stop stopColor="#165AD9" />
            <stop offset="0.5" stopColor="#0091FF" />
            <stop offset="1" stopColor="#8587FF" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_10_337" x1="9.13174" x2="3.68031" y1="8.86174" y2="4.41602">
            <stop offset="0.24" stopColor="#448AFF" stopOpacity="0" />
            <stop offset="0.79" stopColor="#0032B1" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_10_337" x1="8.43459" x2="17.0517" y1="10.5647" y2="5.05608">
            <stop stopColor="#1A43A6" />
            <stop offset="0.49" stopColor="#2052CB" />
            <stop offset="1" stopColor="#5F20CB" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint4_linear_10_337" x1="10.8689" x2="5.63459" y1="10.2447" y2="5.70751">
            <stop stopColor="#0045B9" stopOpacity="0" />
            <stop offset="0.67" stopColor="#0D1F69" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(8.41107 0.336023) rotate(-90) scale(11.3692 12.3054)" gradientUnits="userSpaceOnUse" id="paint5_radial_10_337" r="1">
            <stop offset="0.57" stopColor="#275FF0" stopOpacity="0" />
            <stop offset="0.99" stopColor="#002177" />
          </radialGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint6_linear_10_337" x1="15.9882" x2="8.35393" y1="10.0732" y2="10.0732">
            <stop stopColor="#4DC4FF" />
            <stop offset="0.2" stopColor="#0FAFFF" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(10.135 13.4335) rotate(-45) scale(4.87225)" gradientUnits="userSpaceOnUse" id="paint7_radial_10_337" r="1">
            <stop offset="0.26" stopColor="#0060D1" stopOpacity="0.4" />
            <stop offset="0.91" stopColor="#0383F1" stopOpacity="0" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(2.78593 17.0279) rotate(-52.66) scale(16.539 14.9554)" gradientUnits="userSpaceOnUse" id="paint8_radial_10_337" r="1">
            <stop offset="0.73" stopColor="#F4A7F7" stopOpacity="0" />
            <stop offset="1" stopColor="#F4A7F7" stopOpacity="0.5" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(6.12536 9.06745) rotate(123.339) scale(8.72634 22.6459)" gradientUnits="userSpaceOnUse" id="paint9_radial_10_337" r="1">
            <stop stopColor="#49DEFF" />
            <stop offset="0.72" stopColor="#29C3FF" />
          </radialGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint10_linear_10_337" x1="-0.240357" x2="7.11964" y1="13.4103" y2="13.4103">
            <stop offset="0.21" stopColor="#6CE0FF" />
            <stop offset="0.54" stopColor="#50D5FF" stopOpacity="0" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(-0.0325506 7.41) rotate(46.92) scale(8.86782)" gradientUnits="userSpaceOnUse" id="paint11_radial_10_337" r="1">
            <stop offset="0.04" stopColor="#0091FF" />
            <stop offset="0.92" stopColor="#183DAD" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(3.36 11.2618) rotate(90) scale(4.71562 5.4393)" gradientUnits="userSpaceOnUse" id="paint12_radial_10_337" r="1">
            <stop offset="0.56" stopColor="#0FA5F7" stopOpacity="0" />
            <stop offset="1" stopColor="#74C6FF" stopOpacity="0.5" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

function ClipPathGroup3() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0" data-name="Clip path group">
      <Group3 />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <ClipPathGroup3 />
    </div>
  );
}

function ItemButton3() {
  return (
    <div className="content-stretch flex gap-[8px] h-[36px] items-center px-[14px] relative rounded-[1000px] shrink-0" data-name="Item → Button">
      <Container7 />
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[21px]">Marketing Campaigns</p>
      </div>
    </div>
  );
}

function Group4() {
  return (
    <div className="col-1 h-[15.159px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0.005px] mask-size-[16px_15.143px] ml-0 mt-[-0.03%] relative row-1 w-[15.989px]" data-name="Group" style={{ maskImage: `url('${imgGroup}')` }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9889 15.1589">
        <g id="Group">
          <path d={svgPaths.p1580a300} fill="url(#paint0_linear_10_337)" id="Vector" />
          <path d={svgPaths.p251ad2c0} fill="url(#paint1_linear_10_337)" id="Vector_2" />
          <path d={svgPaths.p251ad2c0} fill="url(#paint2_linear_10_337)" id="Vector_3" />
          <path d={svgPaths.p3d7f4a80} fill="url(#paint3_linear_10_337)" id="Vector_4" />
          <path d={svgPaths.p3d7f4a80} fill="url(#paint4_linear_10_337)" id="Vector_5" />
          <path d={svgPaths.p36e1bf80} fill="url(#paint5_radial_10_337)" id="Vector_6" />
          <path d={svgPaths.p128ee80} fill="url(#paint6_linear_10_337)" id="Vector_7" />
          <path d={svgPaths.p128ee80} fill="url(#paint7_radial_10_337)" id="Vector_8" />
          <path d={svgPaths.p128ee80} fill="url(#paint8_radial_10_337)" id="Vector_9" />
          <path d={svgPaths.p3bc88f00} fill="url(#paint9_radial_10_337)" id="Vector_10" />
          <path d={svgPaths.p3bc88f00} fill="url(#paint10_linear_10_337)" id="Vector_11" />
          <path d={svgPaths.p9fbe800} fill="url(#paint11_radial_10_337)" id="Vector_12" />
          <path d={svgPaths.p9fbe800} fill="url(#paint12_radial_10_337)" id="Vector_13" />
          <path d={svgPaths.p22ddb670} fill="var(--fill-0, white)" id="Vector_14" />
          <path d={svgPaths.p277dcf00} fill="var(--fill-0, white)" id="Vector_15" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_10_337" x1="2.51393" x2="11.3368" y1="6.88462" y2="1.42176">
            <stop stopColor="#20A7FA" />
            <stop offset="0.4" stopColor="#3BD5FF" />
            <stop offset="1" stopColor="#C4B0FF" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_10_337" x1="5.55459" x2="10.4574" y1="8.74745" y2="0.896022">
            <stop stopColor="#165AD9" />
            <stop offset="0.5" stopColor="#0091FF" />
            <stop offset="1" stopColor="#8587FF" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_10_337" x1="9.13174" x2="3.68031" y1="8.86174" y2="4.41602">
            <stop offset="0.24" stopColor="#448AFF" stopOpacity="0" />
            <stop offset="0.79" stopColor="#0032B1" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_10_337" x1="8.43459" x2="17.0517" y1="10.5647" y2="5.05608">
            <stop stopColor="#1A43A6" />
            <stop offset="0.49" stopColor="#2052CB" />
            <stop offset="1" stopColor="#5F20CB" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint4_linear_10_337" x1="10.8689" x2="5.63459" y1="10.2447" y2="5.70751">
            <stop stopColor="#0045B9" stopOpacity="0" />
            <stop offset="0.67" stopColor="#0D1F69" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(8.41107 0.336023) rotate(-90) scale(11.3692 12.3054)" gradientUnits="userSpaceOnUse" id="paint5_radial_10_337" r="1">
            <stop offset="0.57" stopColor="#275FF0" stopOpacity="0" />
            <stop offset="0.99" stopColor="#002177" />
          </radialGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint6_linear_10_337" x1="15.9882" x2="8.35393" y1="10.0732" y2="10.0732">
            <stop stopColor="#4DC4FF" />
            <stop offset="0.2" stopColor="#0FAFFF" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(10.135 13.4335) rotate(-45) scale(4.87225)" gradientUnits="userSpaceOnUse" id="paint7_radial_10_337" r="1">
            <stop offset="0.26" stopColor="#0060D1" stopOpacity="0.4" />
            <stop offset="0.91" stopColor="#0383F1" stopOpacity="0" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(2.78593 17.0279) rotate(-52.66) scale(16.539 14.9554)" gradientUnits="userSpaceOnUse" id="paint8_radial_10_337" r="1">
            <stop offset="0.73" stopColor="#F4A7F7" stopOpacity="0" />
            <stop offset="1" stopColor="#F4A7F7" stopOpacity="0.5" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(6.12536 9.06745) rotate(123.339) scale(8.72634 22.6459)" gradientUnits="userSpaceOnUse" id="paint9_radial_10_337" r="1">
            <stop stopColor="#49DEFF" />
            <stop offset="0.72" stopColor="#29C3FF" />
          </radialGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint10_linear_10_337" x1="-0.240357" x2="7.11964" y1="13.4103" y2="13.4103">
            <stop offset="0.21" stopColor="#6CE0FF" />
            <stop offset="0.54" stopColor="#50D5FF" stopOpacity="0" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(-0.0325506 7.41) rotate(46.92) scale(8.86782)" gradientUnits="userSpaceOnUse" id="paint11_radial_10_337" r="1">
            <stop offset="0.04" stopColor="#0091FF" />
            <stop offset="0.92" stopColor="#183DAD" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(3.36 11.2618) rotate(90) scale(4.71562 5.4393)" gradientUnits="userSpaceOnUse" id="paint12_radial_10_337" r="1">
            <stop offset="0.56" stopColor="#0FA5F7" stopOpacity="0" />
            <stop offset="1" stopColor="#74C6FF" stopOpacity="0.5" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

function ClipPathGroup4() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0" data-name="Clip path group">
      <Group4 />
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <ClipPathGroup4 />
    </div>
  );
}

function ItemButton4() {
  return (
    <div className="content-stretch flex gap-[8px] h-[36px] items-center px-[14px] relative rounded-[1000px] shrink-0" data-name="Item → Button">
      <Container8 />
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[21px]">AI Automation</p>
      </div>
    </div>
  );
}

function Group5() {
  return (
    <div className="col-1 h-[15.159px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0.005px] mask-size-[16px_15.143px] ml-0 mt-[-0.03%] relative row-1 w-[15.989px]" data-name="Group" style={{ maskImage: `url('${imgGroup}')` }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9889 15.1589">
        <g id="Group">
          <path d={svgPaths.p1580a300} fill="url(#paint0_linear_10_337)" id="Vector" />
          <path d={svgPaths.p251ad2c0} fill="url(#paint1_linear_10_337)" id="Vector_2" />
          <path d={svgPaths.p251ad2c0} fill="url(#paint2_linear_10_337)" id="Vector_3" />
          <path d={svgPaths.p3d7f4a80} fill="url(#paint3_linear_10_337)" id="Vector_4" />
          <path d={svgPaths.p3d7f4a80} fill="url(#paint4_linear_10_337)" id="Vector_5" />
          <path d={svgPaths.p36e1bf80} fill="url(#paint5_radial_10_337)" id="Vector_6" />
          <path d={svgPaths.p128ee80} fill="url(#paint6_linear_10_337)" id="Vector_7" />
          <path d={svgPaths.p128ee80} fill="url(#paint7_radial_10_337)" id="Vector_8" />
          <path d={svgPaths.p128ee80} fill="url(#paint8_radial_10_337)" id="Vector_9" />
          <path d={svgPaths.p3bc88f00} fill="url(#paint9_radial_10_337)" id="Vector_10" />
          <path d={svgPaths.p3bc88f00} fill="url(#paint10_linear_10_337)" id="Vector_11" />
          <path d={svgPaths.p9fbe800} fill="url(#paint11_radial_10_337)" id="Vector_12" />
          <path d={svgPaths.p9fbe800} fill="url(#paint12_radial_10_337)" id="Vector_13" />
          <path d={svgPaths.p22ddb670} fill="var(--fill-0, white)" id="Vector_14" />
          <path d={svgPaths.p277dcf00} fill="var(--fill-0, white)" id="Vector_15" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_10_337" x1="2.51393" x2="11.3368" y1="6.88462" y2="1.42176">
            <stop stopColor="#20A7FA" />
            <stop offset="0.4" stopColor="#3BD5FF" />
            <stop offset="1" stopColor="#C4B0FF" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_10_337" x1="5.55459" x2="10.4574" y1="8.74745" y2="0.896022">
            <stop stopColor="#165AD9" />
            <stop offset="0.5" stopColor="#0091FF" />
            <stop offset="1" stopColor="#8587FF" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_10_337" x1="9.13174" x2="3.68031" y1="8.86174" y2="4.41602">
            <stop offset="0.24" stopColor="#448AFF" stopOpacity="0" />
            <stop offset="0.79" stopColor="#0032B1" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_10_337" x1="8.43459" x2="17.0517" y1="10.5647" y2="5.05608">
            <stop stopColor="#1A43A6" />
            <stop offset="0.49" stopColor="#2052CB" />
            <stop offset="1" stopColor="#5F20CB" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint4_linear_10_337" x1="10.8689" x2="5.63459" y1="10.2447" y2="5.70751">
            <stop stopColor="#0045B9" stopOpacity="0" />
            <stop offset="0.67" stopColor="#0D1F69" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(8.41107 0.336023) rotate(-90) scale(11.3692 12.3054)" gradientUnits="userSpaceOnUse" id="paint5_radial_10_337" r="1">
            <stop offset="0.57" stopColor="#275FF0" stopOpacity="0" />
            <stop offset="0.99" stopColor="#002177" />
          </radialGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint6_linear_10_337" x1="15.9882" x2="8.35393" y1="10.0732" y2="10.0732">
            <stop stopColor="#4DC4FF" />
            <stop offset="0.2" stopColor="#0FAFFF" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(10.135 13.4335) rotate(-45) scale(4.87225)" gradientUnits="userSpaceOnUse" id="paint7_radial_10_337" r="1">
            <stop offset="0.26" stopColor="#0060D1" stopOpacity="0.4" />
            <stop offset="0.91" stopColor="#0383F1" stopOpacity="0" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(2.78593 17.0279) rotate(-52.66) scale(16.539 14.9554)" gradientUnits="userSpaceOnUse" id="paint8_radial_10_337" r="1">
            <stop offset="0.73" stopColor="#F4A7F7" stopOpacity="0" />
            <stop offset="1" stopColor="#F4A7F7" stopOpacity="0.5" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(6.12536 9.06745) rotate(123.339) scale(8.72634 22.6459)" gradientUnits="userSpaceOnUse" id="paint9_radial_10_337" r="1">
            <stop stopColor="#49DEFF" />
            <stop offset="0.72" stopColor="#29C3FF" />
          </radialGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint10_linear_10_337" x1="-0.240357" x2="7.11964" y1="13.4103" y2="13.4103">
            <stop offset="0.21" stopColor="#6CE0FF" />
            <stop offset="0.54" stopColor="#50D5FF" stopOpacity="0" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(-0.0325506 7.41) rotate(46.92) scale(8.86782)" gradientUnits="userSpaceOnUse" id="paint11_radial_10_337" r="1">
            <stop offset="0.04" stopColor="#0091FF" />
            <stop offset="0.92" stopColor="#183DAD" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(3.36 11.2618) rotate(90) scale(4.71562 5.4393)" gradientUnits="userSpaceOnUse" id="paint12_radial_10_337" r="1">
            <stop offset="0.56" stopColor="#0FA5F7" stopOpacity="0" />
            <stop offset="1" stopColor="#74C6FF" stopOpacity="0.5" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

function ClipPathGroup5() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0" data-name="Clip path group">
      <Group5 />
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <ClipPathGroup5 />
    </div>
  );
}

function ItemButton5() {
  return (
    <div className="content-stretch flex gap-[8px] h-[36px] items-center px-[14px] relative rounded-[1000px] shrink-0" data-name="Item → Button">
      <Container9 />
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[21px]">{`Creative Strategy & Concept`}</p>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-start flex flex-wrap gap-0 items-start relative shrink-0 w-full">
      <ItemButton />
      <ItemButton1 />
      <ItemButton2 />
      <ItemButton3 />
      <ItemButton4 />
      <ItemButton5 />
    </div>
  );
}

function Overlay() {
  return (
    <div className="bg-[rgba(232,232,232,0.02)] relative rounded-[8px] shrink-0 w-full" data-name="Overlay">
      <div className="content-stretch flex flex-col items-start pb-[11.895px] pt-[11.295px] px-[12px] relative w-full">
        <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-[13.8px] text-[rgba(232,232,232,0.8)] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          <p className="mb-0">
            <span className="leading-[19.6px]">Note:</span>
            <span className="font-['Roboto:Regular',sans-serif] font-normal leading-[19.6px] text-[rgba(232,232,232,0.7)]" style={{ fontVariationSettings: "'wdth' 100" }}>{` Push notifications require the Sana mobile app. Slack notifications require your`}</span>
          </p>
          <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[19.6px] text-[rgba(232,232,232,0.7)]" style={{ fontVariationSettings: "'wdth' 100" }}>
            workspace to have the Slack integration connected.
          </p>
        </div>
      </div>
    </div>
  );
}

function Margin2() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[12px] relative shrink-0 w-full" data-name="Margin">
      <Overlay />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[594px]" data-name="Container">
      <Container2 />
      <Margin1 />
      <Frame3 />
      <Margin2 />
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

function Container10() {
  return (
    <div className="content-stretch flex gap-[16px] items-start justify-end relative shrink-0 w-full" data-name="Container">
      <Button />
      <Button1 />
    </div>
  );
}

function Margin3() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[24px] relative shrink-0 w-[594px]" data-name="Margin">
      <Container10 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start p-[32px] relative">
        <Container1 />
        <Margin3 />
      </div>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="bg-[#1e1f20] relative rounded-[40px] size-full" data-name="Frame">
      <div className="content-stretch flex flex-col items-start max-w-[inherit] overflow-clip p-px relative rounded-[inherit] size-full">
        <Margin />
        <Frame2 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#131314] border-solid inset-0 pointer-events-none rounded-[40px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.04),0px_12px_32px_0px_rgba(0,0,0,0.08)]" />
    </div>
  );
}