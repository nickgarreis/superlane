import React from "react";
import projectSvgPaths from "../../imports/svg-0erue6fqwq";
import { imgGroup } from "../../imports/svg-p2kdi";

// ── Service icon image imports ────────────────────────────────────
import imgWebDesign from "../../assets/web-design-service.avif";

// ── Category → icon mapping ───────────────────────────────────────
// Maps category strings (case-insensitive) to an image URL.
// Add new entries here when a service gets its own icon.
const SERVICE_ICON_MAP: Record<string, string> = {
  "web design": imgWebDesign,
  "webdesign": imgWebDesign,
};

/**
 * Resolves a category string to an icon image URL, or null for the default SVG.
 */
export function getServiceIconUrl(category?: string): string | null {
  if (!category) return null;
  return SERVICE_ICON_MAP[category.toLowerCase()] ?? null;
}

/**
 * ProjectLogo – renders the service icon for a project.
 *
 * @param size     pixel dimensions (width & height)
 * @param category project category string; when matched, renders a raster
 *                 icon instead of the default Outlook-style SVG.
 */
export function ProjectLogo({
  size = 18,
  category,
}: {
  size?: number;
  category?: string;
}) {
  const iconUrl = getServiceIconUrl(category);

  // ── Image-based icon ──────────────────────────────────────────
  if (iconUrl) {
    // Scale border-radius proportionally: ~18% of size for nice rounded corners
    const borderRadius = Math.round(size * 0.18);
    return (
      <img
        src={iconUrl}
        alt={category ?? ""}
        className="shrink-0 object-cover"
        style={{ width: size * 1.4, height: size * 1.4, borderRadius }}
      />
    );
  }

  // ── Default Outlook SVG logo ──────────────────────────────────
  return (
    <div className="relative shrink-0 overflow-hidden" style={{ width: size, height: size }}>
        <div className="absolute inset-[6.97%_3.81%_10.13%_8.75%]" style={{ maskImage: `url('${imgGroup}')`, maskSize: "100% 100%", maskRepeat: "no-repeat" }}>
             <svg className="block w-full h-full" viewBox="0 0 122.414 116.06" fill="none" preserveAspectRatio="none">
                <g>
                    <path d={projectSvgPaths.p4533640} fill="url(#paint0_linear_1_566_sm)" />
                    <path d={projectSvgPaths.p3fb64680} fill="url(#paint1_linear_1_566_sm)" />
                    <path d={projectSvgPaths.p3fb64680} fill="url(#paint2_linear_1_566_sm)" />
                    <path d={projectSvgPaths.p33e02200} fill="url(#paint3_linear_1_566_sm)" />
                    <path d={projectSvgPaths.p33e02200} fill="url(#paint4_linear_1_566_sm)" />
                    <path d={projectSvgPaths.p3b04b480} fill="url(#paint5_radial_1_566_sm)" />
                    <path d={projectSvgPaths.p248f9400} fill="url(#paint6_linear_1_566_sm)" />
                    <path d={projectSvgPaths.p248f9400} fill="url(#paint7_radial_1_566_sm)" />
                    <path d={projectSvgPaths.p248f9400} fill="url(#paint8_radial_1_566_sm)" />
                    <path d={projectSvgPaths.p2825c500} fill="url(#paint9_radial_1_566_sm)" />
                    <path d={projectSvgPaths.p2825c500} fill="url(#paint10_linear_1_566_sm)" />
                    <path d={projectSvgPaths.p219ad800} fill="url(#paint11_radial_1_566_sm)" />
                    <path d={projectSvgPaths.p219ad800} fill="url(#paint12_radial_1_566_sm)" />
                    <path d={projectSvgPaths.p21101900} fill="white" />
                    <path d={projectSvgPaths.p31ff5280} fill="white" />
                </g>
                <defs>
                    <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_566_sm" x1="19.2473" x2="86.7973" y1="52.7103" y2="10.8853">
                        <stop stopColor="#20A7FA" />
                        <stop offset="0.4" stopColor="#3BD5FF" />
                        <stop offset="1" stopColor="#C4B0FF" />
                    </linearGradient>
                    <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_566_sm" x1="42.5264" x2="80.0639" y1="66.9726" y2="6.86012">
                        <stop stopColor="#165AD9" />
                        <stop offset="0.5" stopColor="#0091FF" />
                        <stop offset="1" stopColor="#8587FF" />
                    </linearGradient>
                    <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_566_sm" x1="69.9139" x2="28.1764" y1="67.8476" y2="33.8101">
                        <stop offset="0.24" stopColor="#448AFF" stopOpacity="0" />
                        <stop offset="0.79" stopColor="#0032B1" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_1_566_sm" x1="64.5764" x2="130.551" y1="80.8854" y2="38.7104">
                        <stop stopColor="#1A43A6" />
                        <stop offset="0.49" stopColor="#2052CB" />
                        <stop offset="1" stopColor="#5F20CB" />
                    </linearGradient>
                    <linearGradient gradientUnits="userSpaceOnUse" id="paint4_linear_1_566_sm" x1="83.2139" x2="43.1389" y1="78.4354" y2="43.6979">
                        <stop stopColor="#0045B9" stopOpacity="0" />
                        <stop offset="0.67" stopColor="#0D1F69" stopOpacity="0.2" />
                    </linearGradient>
                    <radialGradient cx="0" cy="0" gradientTransform="translate(64.3973 2.57269) rotate(-90) scale(87.0451 94.213)" gradientUnits="userSpaceOnUse" id="paint5_radial_1_566_sm" r="1">
                        <stop offset="0.57" stopColor="#275FF0" stopOpacity="0" />
                        <stop offset="0.99" stopColor="#002177" />
                    </radialGradient>
                    <linearGradient gradientUnits="userSpaceOnUse" id="paint6_linear_1_566_sm" x1="122.41" x2="63.9598" y1="77.1226" y2="77.1226">
                        <stop stopColor="#4DC4FF" />
                        <stop offset="0.2" stopColor="#0FAFFF" />
                    </linearGradient>
                    <radialGradient cx="0" cy="0" gradientTransform="translate(77.5963 102.85) rotate(-45) scale(37.3032)" gradientUnits="userSpaceOnUse" id="paint7_radial_1_566_sm" r="1">
                        <stop offset="0.26" stopColor="#0060D1" stopOpacity="0.4" />
                        <stop offset="0.91" stopColor="#0383F1" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient cx="0" cy="0" gradientTransform="translate(21.3298 130.37) rotate(-52.66) scale(126.627 114.503)" gradientUnits="userSpaceOnUse" id="paint8_radial_1_566_sm" r="1">
                        <stop offset="0.73" stopColor="#F4A7F7" stopOpacity="0" />
                        <stop offset="1" stopColor="#F4A7F7" stopOpacity="0.5" />
                    </radialGradient>
                    <radialGradient cx="0" cy="0" gradientTransform="translate(46.8973 69.4226) rotate(123.339) scale(66.8111 173.383)" gradientUnits="userSpaceOnUse" id="paint9_radial_1_566_sm" r="1">
                        <stop stopColor="#49DEFF" />
                        <stop offset="0.72" stopColor="#29C3FF" />
                    </radialGradient>
                    <linearGradient gradientUnits="userSpaceOnUse" id="paint10_linear_1_566_sm" x1="-1.84023" x2="54.5098" y1="102.673" y2="102.673">
                        <stop offset="0.21" stopColor="#6CE0FF" />
                        <stop offset="0.54" stopColor="#50D5FF" stopOpacity="0" />
                    </linearGradient>
                    <radialGradient cx="0" cy="0" gradientTransform="translate(-0.249215 56.7328) rotate(46.92) scale(67.8942 67.8942)" gradientUnits="userSpaceOnUse" id="paint11_radial_1_566_sm" r="1">
                        <stop offset="0.04" stopColor="#0091FF" />
                        <stop offset="0.92" stopColor="#183DAD" />
                    </radialGradient>
                    <radialGradient cx="0" cy="0" gradientTransform="translate(25.725 86.223) rotate(90) scale(36.104 41.6447)" gradientUnits="userSpaceOnUse" id="paint12_radial_1_566_sm" r="1">
                        <stop offset="0.56" stopColor="#0FA5F7" stopOpacity="0" />
                        <stop offset="1" stopColor="#74C6FF" stopOpacity="0.5" />
                    </radialGradient>
                </defs>
             </svg>
        </div>
    </div>
  );
}
