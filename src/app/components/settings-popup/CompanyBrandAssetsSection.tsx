import type React from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { WorkspaceRole } from "../../types";
import { bytesToHumanReadable, getAssetPreviewSrc, type CompanyBrandAsset } from "./types";
import { DeniedAction } from "../permissions/DeniedAction";
import { getBrandAssetDeniedReason } from "../../lib/permissionRules";
import { reportUiError } from "../../lib/errors";

type CompanyBrandAssetsSectionProps = {
  brandAssets: CompanyBrandAsset[];
  canManageBrandAssets: boolean;
  viewerRole?: WorkspaceRole;
  onUploadBrandAsset: (file: File) => Promise<void>;
  onRemoveBrandAsset: (payload: { brandAssetId: string }) => Promise<void>;
};

export function CompanyBrandAssetsSection({
  brandAssets,
  canManageBrandAssets,
  viewerRole,
  onUploadBrandAsset,
  onRemoveBrandAsset,
}: CompanyBrandAssetsSectionProps) {
  const brandAssetsDeniedReason = getBrandAssetDeniedReason(viewerRole);
  const handleUploadBrandAsset = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    try {
      await onUploadBrandAsset(file);
      toast.success("Brand asset uploaded");
    } catch (error) {
      reportUiError("settings.brandAssets.upload", error, { showToast: false });
      toast.error("Failed to upload brand asset");
    } finally {
      input.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-medium text-[#E8E8E8]">Brand Assets</h3>
          <p className="text-[13px] text-[#E8E8E8]/40">Workspace-level brand files.</p>
        </div>
        <DeniedAction denied={!canManageBrandAssets} reason={brandAssetsDeniedReason} tooltipAlign="right">
          <label
            className={`inline-flex items-center gap-2 px-3 py-2 bg-[#E8E8E8] rounded-full text-bg-base text-[13px] font-medium ${
              canManageBrandAssets ? "cursor-pointer" : "opacity-50 cursor-not-allowed pointer-events-none"
            }`}
            aria-disabled={!canManageBrandAssets}
            tabIndex={canManageBrandAssets ? 0 : -1}
          >
            <Upload size={14} /> Upload
            <input
              type="file"
              className="hidden"
              disabled={!canManageBrandAssets}
              onChange={handleUploadBrandAsset}
            />
          </label>
        </DeniedAction>
      </div>

      <div className="flex flex-col gap-2">
        {brandAssets.length === 0 && <p className="text-[13px] text-[#E8E8E8]/40">No brand assets uploaded.</p>}
        {brandAssets.map((asset) => (
          <div key={asset.id} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 relative">
            <div className="w-10 h-12 shrink-0 bg-white rounded flex items-center justify-center overflow-hidden shadow-sm relative">
              <img
                src={getAssetPreviewSrc(asset)}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <span className="text-[14px] text-[#E8E8E8] truncate">{asset.name}</span>
              <span className="text-[12px] text-[#E8E8E8]/40">
                {asset.type} • {bytesToHumanReadable(asset.sizeBytes)} • {new Date(asset.displayDateEpochMs).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="text-[12px] text-[#58AFFF] hover:text-[#7fc0ff] transition-colors disabled:opacity-50 cursor-pointer"
                disabled={!asset.downloadUrl}
                onClick={() => {
                  if (!asset.downloadUrl) {
                    return;
                  }
                  window.open(asset.downloadUrl, "_blank", "noopener,noreferrer");
                }}
              >
                <Download size={14} />
              </button>
              <DeniedAction denied={!canManageBrandAssets} reason={brandAssetsDeniedReason} tooltipAlign="right">
                <button
                  className="p-1.5 hover:bg-red-500/10 hover:text-red-500 text-white/20 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  disabled={!canManageBrandAssets}
                  onClick={() => {
                    if (!canManageBrandAssets) {
                      return;
                    }
                    void onRemoveBrandAsset({ brandAssetId: asset.id })
                      .then(() => toast.success("Brand asset removed"))
                      .catch((error) => {
                        reportUiError("settings.brandAssets.remove", error, { showToast: false });
                        toast.error("Failed to remove brand asset");
                      });
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </DeniedAction>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
