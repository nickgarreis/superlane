import React, { useEffect, useRef, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "../../../lib/utils";
import { formatFileDisplayDate } from "../../lib/dates";
import type { MainContentFileActions } from "../../dashboard/types";
import type { ProjectFileData } from "../../types"; // File thumbnails
import {
  TABLE_ACTION_ICON_BUTTON_CLASS,
} from "../ui/controlChrome";
import imgFile1 from "figma:asset/86b9c3843ae4733f84c25f8c5003a47372346c7b.png";
import imgFile2 from "figma:asset/ed2300ecc7d7f37175475469dd895c1a9c7a47a7.png";
import imgFile3 from "figma:asset/a6d8d90aa9a345c6a0a0841855776fa6f038f822.png";
import imgFile4 from "figma:asset/6ec5d42097faff5a5e15a92d842d637a67eb0f04.png";
import imgFile5 from "figma:asset/13b4fb46cd2c4b965c5823ea01fe2f6c7842b7bd.png";
const FILE_THUMBNAIL_BY_TYPE: Record<string, string> = {
  SVG: imgFile1,
  PNG: imgFile2,
  ZIP: imgFile3,
  PDF: imgFile4,
  DOCX: imgFile5,
  FIG: imgFile5,
  XLSX: imgFile4,
  FILE: imgFile4,
};
type MainContentFileRowsProps = {
  filteredFiles: ProjectFileData[];
  fileRowRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  fileActions: MainContentFileActions;
  canMutateProjectFiles: boolean;
  fileMutationDisabledMessage: string;
  onRemoveFile: (id: string, event: React.MouseEvent) => void;
  fileRowStyle?: React.CSSProperties;
};
export const MainContentFileRows = React.memo(function MainContentFileRows({
  filteredFiles,
  fileRowRefs,
  fileActions,
  canMutateProjectFiles,
  fileMutationDisabledMessage,
  onRemoveFile,
  fileRowStyle,
}: MainContentFileRowsProps) {
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
  const rowsRootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!rowsRootRef.current) {
      setScrollElement(null);
      return;
    }
    let parent = rowsRootRef.current.parentElement;
    while (parent) {
      const overflowY = window.getComputedStyle(parent).overflowY;
      if (overflowY === "auto" || overflowY === "scroll") {
        setScrollElement(parent);
        return;
      }
      parent = parent.parentElement;
    }
    setScrollElement(null);
  }, [filteredFiles.length]);
  const shouldVirtualizeRows =
    filteredFiles.length > 80 && Boolean(scrollElement);
  const rowVirtualizer = useVirtualizer({
    count: filteredFiles.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => 72,
    overscan: 8,
  });
  return (
    <div ref={rowsRootRef}>
      {shouldVirtualizeRows ? (
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const file = filteredFiles[virtualItem.index];
            if (!file) {
              return null;
            }
            return (
              <div
                key={file.id}
                data-index={virtualItem.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <motion.div
                  ref={(el: HTMLDivElement | null) => {
                    fileRowRefs.current[file.id] = el;
                  }}
                  layout={false}
                  exit={{ opacity: 0 }}
                  className="project-file-row group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5 relative"
                  style={fileRowStyle}
                >
                  <div className="w-10 h-12 shrink-0 bg-white rounded flex items-center justify-center overflow-hidden shadow-sm relative">
                    <img
                      src={
                        file.thumbnailRef ||
                        FILE_THUMBNAIL_BY_TYPE[file.type] ||
                        imgFile4
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white group-hover:text-white transition-colors mb-0.5">
                      {file.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span className="uppercase">{file.type}</span>
                      <span>•</span>
                      <span>
                        {formatFileDisplayDate(file.displayDateEpochMs)}
                      </span>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    <button
                      title="Download"
                      onClick={(event) => {
                        event.stopPropagation();
                        fileActions.download(file.id);
                      }}
                      className="txt-tone-accent hover:txt-tone-accent transition-colors cursor-pointer"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      title={
                        canMutateProjectFiles
                          ? "Remove"
                          : fileMutationDisabledMessage
                      }
                      onClick={(event) => onRemoveFile(file.id, event)}
                      disabled={!canMutateProjectFiles}
                      className={cn(
                        TABLE_ACTION_ICON_BUTTON_CLASS,
                        "hover:bg-popup-danger-soft-hover hover:txt-tone-danger",
                        canMutateProjectFiles
                          ? undefined
                          : "text-text-muted-weak/50 cursor-not-allowed",
                      )}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          {filteredFiles.map((file) => (
            <motion.div
              key={file.id}
              ref={(el: HTMLDivElement | null) => {
                fileRowRefs.current[file.id] = el;
              }}
              layout
              exit={{ opacity: 0 }}
              className="project-file-row group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5 relative"
              style={fileRowStyle}
            >
              <div className="w-10 h-12 shrink-0 bg-white rounded flex items-center justify-center overflow-hidden shadow-sm relative">
                <img
                  src={
                    file.thumbnailRef ||
                    FILE_THUMBNAIL_BY_TYPE[file.type] ||
                    imgFile4
                  }
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white group-hover:text-white transition-colors mb-0.5">
                  {file.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span className="uppercase">{file.type}</span> <span>•</span>
                  <span>{formatFileDisplayDate(file.displayDateEpochMs)}</span>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <button
                  title="Download"
                  onClick={(event) => {
                    event.stopPropagation();
                    fileActions.download(file.id);
                  }}
                  className="txt-tone-accent hover:txt-tone-accent transition-colors cursor-pointer"
                >
                  <Download size={14} />
                </button>
                <button
                  title={
                    canMutateProjectFiles
                      ? "Remove"
                      : fileMutationDisabledMessage
                  }
                  onClick={(event) => onRemoveFile(file.id, event)}
                  disabled={!canMutateProjectFiles}
                  className={cn(
                    TABLE_ACTION_ICON_BUTTON_CLASS,
                    "hover:bg-popup-danger-soft-hover hover:txt-tone-danger",
                    canMutateProjectFiles
                      ? undefined
                      : "text-text-muted-weak/50 cursor-not-allowed",
                  )}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
});
