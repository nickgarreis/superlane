export default function DeleteButton() {
  return (
    <div className="bg-[rgba(255,59,48,0.06)] content-stretch flex items-center justify-center opacity-80 px-[17px] py-[7px] relative rounded-[16777200px] size-full" data-name="delete button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[16777200px]" />
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#ff3b30] text-[14px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">Delete draft</p>
      </div>
    </div>
  );
}