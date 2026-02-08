import imgNickGarreis from "figma:asset/8ff76ab4f0991c684214e12b050fc8cc11b7f7f8.png";

function Container2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Container">
      <div className="flex flex-col font-['SF_Pro_Text:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#ada9a3] text-[13px] w-full">
        <p className="leading-[18px] whitespace-pre-wrap">Kommentare</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex items-center py-[3px] relative shrink-0 w-full" data-name="Container">
      <Container2 />
    </div>
  );
}

function NickGarreis() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[24px] w-full" data-name="Nick Garreis">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[24px]">
        <div className="absolute bg-[#191919] inset-0 rounded-[24px]" />
        <div className="absolute inset-0 overflow-hidden rounded-[24px]">
          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgNickGarreis} />
        </div>
      </div>
    </div>
  );
}

function ImgNickGarreisOutlineGroup() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-center min-h-px min-w-px relative w-full" data-name="Img - Nick Garreis:outline-group">
      <NickGarreis />
      <div className="absolute inset-px rounded-[23px]" data-name="Nick Garreis:outline">
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,243,0.08)] border-solid inset-[-1px] pointer-events-none rounded-[24px]" />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-start justify-center min-h-px min-w-px relative" data-name="Container">
      <ImgNickGarreisOutlineGroup />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[24px] shrink-0 size-[24px]" data-name="Container">
      <Container5 />
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pr-[8px] relative shrink-0" data-name="Margin">
      <Container4 />
    </div>
  );
}

function MarginAlignFlexStart() {
  return (
    <div className="content-stretch flex h-full items-start relative shrink-0" data-name="Margin:align-flex-start">
      <Margin />
    </div>
  );
}

function Textbox() {
  return (
    <div className="flex-[1_0_0] max-h-[517.2999877929688px] min-h-[14px] min-w-px relative self-stretch" data-name="Textbox">
      <div className="max-h-[inherit] min-h-[inherit] overflow-auto size-full">
        <div className="content-stretch flex flex-col items-start max-h-[inherit] min-h-[inherit] p-[2.5px] relative size-full">
          <div className="flex flex-col font-['SF_Pro_Text:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#7d7a75] text-[14px] w-full">
            <p className="leading-[20px] whitespace-pre-wrap">{`Kommentar hinzufügen…" / "`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex items-start justify-center min-h-[24px] pr-[2.5px] relative shrink-0 w-[438.5px]" data-name="Container">
      <Textbox />
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute content-center flex flex-wrap items-center justify-end left-[-4px] pb-[0.5px] pt-[3px] px-[4px] right-[-4px] rounded-[6px] top-[-3.5px]" data-name="Container">
      <Container7 />
    </div>
  );
}

function Margin1() {
  return (
    <div className="flex-[1_0_0] h-[27px] min-h-px min-w-px relative" data-name="Margin">
      <Container6 />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[468px]" data-name="Container">
      <div className="flex flex-row items-center self-stretch">
        <MarginAlignFlexStart />
      </div>
      <Margin1 />
    </div>
  );
}

function Container() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start pb-[12px] relative w-full">
        <Container1 />
        <Container3 />
      </div>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="content-stretch flex flex-col items-start pb-px relative size-full" data-name="Frame">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.09)] border-b border-solid inset-0 pointer-events-none" />
      <Container />
    </div>
  );
}