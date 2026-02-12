import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { WorkspaceRole } from "../../types";
import type { SettingsFocusTarget } from "../../dashboard/types";
import {
  bytesToHumanReadable,
  getAssetPreviewSrc,
  type CompanyBrandAsset,
} from "./types";
import { DeniedAction } from "../permissions/DeniedAction";
import { getBrandAssetDeniedReason } from "../../lib/permissionRules";
import { reportUiError } from "../../lib/errors";
import { safeScrollIntoView } from "../../lib/dom";
type CompanyBrandAssetsSectionProps = {
  brandAssets: CompanyBrandAsset[];
  focusTarget?: SettingsFocusTarget | null;
  canManageBrandAssets: boolean;
  viewerRole?: WorkspaceRole;
  onUploadBrandAsset: (file: File) => Promise<void>;
  onRemoveBrandAsset: (payload: { brandAssetId: string }) => Promise<void>;
  onGetBrandAssetDownloadUrl: (payload: {
    brandAssetId: string;
  }) => Promise<string | null>;
};
export function CompanyBrandAssetsSection({
  brandAssets,
  focusTarget = null,
  canManageBrandAssets,
  viewerRole,
  onUploadBrandAsset,
  onRemoveBrandAsset,
  onGetBrandAssetDownloadUrl,
}: CompanyBrandAssetsSectionProps) {
  const [downloadUrlByAssetId, setDownloadUrlByAssetId] = useState<
    Record<string, string>
  >({});
  const brandAssetsDeniedReason = getBrandAssetDeniedReason(viewerRole);
  const brandAssetRowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastAppliedFocusKeyRef = useRef<string | null>(null);
  const normalizedFocusAssetName = useMemo(() => {
    if (!focusTarget || focusTarget.kind !== "brandAsset") {
      return null;
    }
    const value = focusTarget.assetName.trim().toLowerCase();
    return value.length > 0 ? value : null;
  }, [focusTarget]);
  const handleUploadBrandAsset = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
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
  useEffect(() => {
    if (!normalizedFocusAssetName) {
      return;
    }

    const focusKey = `brand-asset:${normalizedFocusAssetName}`;
    if (focusKey === lastAppliedFocusKeyRef.current) {
      return;
    }

    const target = brandAssetRowRefs.current[normalizedFocusAssetName];
    if (!target) {
      return;
    }

    lastAppliedFocusKeyRef.current = focusKey;
    safeScrollIntoView(target, { block: "center", behavior: "smooth" });
    target.classList.remove("settings-row-flash");
    void target.offsetWidth;
    target.classList.add("settings-row-flash");
    const timeout = window.setTimeout(() => {
      target.classList.remove("settings-row-flash");
    }, 1700);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [brandAssets, normalizedFocusAssetName]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h4 className="txt-role-body-md font-medium txt-tone-subtle uppercase tracking-wider">
          Brand Assets ({brandAssets.length})
        </h4>
        <DeniedAction
          denied={!canManageBrandAssets}
          reason={brandAssetsDeniedReason}
          tooltipAlign="right"
        >
          <label
            className={`inline-flex items-center gap-2 px-3 py-2 bg-text-tone-primary rounded-full text-bg-base txt-role-body-md font-medium ${canManageBrandAssets ? "cursor-pointer" : "opacity-50 cursor-not-allowed pointer-events-none"}`}
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
        {brandAssets.length === 0 && (
          <p className="txt-role-body-md txt-tone-faint">
            No brand assets uploaded.
          </p>
        )}
        {brandAssets.map((asset) => {
          const assetNameKey = asset.name.trim().toLowerCase();
          return (
            <div
              key={asset.id}
              ref={(node) => {
                brandAssetRowRefs.current[assetNameKey] = node;
              }}
              className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 relative"
            >
              <div className="w-10 h-12 shrink-0 bg-white rounded flex items-center justify-center overflow-hidden shadow-sm relative">
                <img
                  src={
                    downloadUrlByAssetId[asset.id] || getAssetPreviewSrc(asset)
                  }
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="txt-role-body-lg txt-tone-primary truncate">
                  {asset.name}
                </span>
                <span className="txt-role-body-sm txt-tone-faint">
                  {asset.type} • {bytesToHumanReadable(asset.sizeBytes)} •
                  {new Date(asset.displayDateEpochMs).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="txt-role-body-sm txt-tone-accent hover:txt-tone-accent transition-colors disabled:opacity-50 cursor-pointer"
                  onClick={() => {
                    const cachedUrl =
                      downloadUrlByAssetId[asset.id] || asset.downloadUrl;
                    if (cachedUrl) {
                      window.open(cachedUrl, "_blank", "noopener,noreferrer");
                      return;
                    }
                    void onGetBrandAssetDownloadUrl({ brandAssetId: asset.id })
                      .then((downloadUrl) => {
                        if (!downloadUrl) {
                          toast.error("Download link unavailable");
                          return;
                        }
                        setDownloadUrlByAssetId((prev) => ({
                          ...prev,
                          [asset.id]: downloadUrl,
                        }));
                        window.open(downloadUrl, "_blank", "noopener,noreferrer");
                      })
                      .catch((error) => {
                        reportUiError("settings.brandAssets.downloadUrl", error, {
                          showToast: false,
                        });
                        toast.error("Failed to resolve download link");
                      });
                  }}
                >
                  <Download size={14} />
                </button>
                <DeniedAction
                  denied={!canManageBrandAssets}
                  reason={brandAssetsDeniedReason}
                  tooltipAlign="right"
                >
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
                          reportUiError("settings.brandAssets.remove", error, {
                            showToast: false,
                          });
                          toast.error("Failed to remove brand asset");
                        });
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </DeniedAction>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
