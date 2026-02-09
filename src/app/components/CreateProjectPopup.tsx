import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Check } from "lucide-react";
import Loading03 from "../../imports/Loading03";
import svgPaths from "../../imports/svg-v61uoamt04";
import createProjectBgFallbackPng from "../../assets/optimized/create-project-bg-fallback.png";
import createProjectBgWebp from "../../assets/optimized/create-project-bg.webp";
import { imgGroup } from "../../imports/svg-4v64g";
import { imgGroup as imgGroupOutlook } from "../../imports/svg-ifuqs";
import { motion, AnimatePresence } from "motion/react";
import { DayPicker } from "react-day-picker";
import { toast } from "sonner";
import "react-day-picker/dist/style.css";
import { ProjectLogo } from "./ProjectLogo";
import {
  PendingDraftAttachmentUpload,
  ProjectDraftData,
  ProjectData,
  ReviewComment,
  WorkspaceRole,
} from "../types";
import {
  formatProjectDeadlineLong,
  formatProjectDeadlineMedium,
  fromUtcNoonEpochMsToDateOnly,
  toUtcNoonEpochMsFromDateOnly,
} from "../lib/dates";

// SVG Paths for Outlook Logo (from svg-x13b188avo.ts)
const outlookPaths = {
  p15ecf170: "M22.4476 84.1321C18.7576 84.1321 15.6826 82.9789 13.2226 80.5189C12.0307 79.2752 11.1029 77.8031 10.4952 76.1913C9.88742 74.5794 9.6123 72.8612 9.68639 71.1402C9.68639 66.9889 10.9164 63.6833 13.3764 61.1464C15.7595 58.6864 18.9883 57.3796 22.9089 57.3796C26.5989 57.3796 29.6739 58.6096 31.9801 60.9927C34.2864 63.4527 35.5164 66.6046 35.5164 70.6021C35.5164 74.6764 34.2864 77.982 31.8264 80.442C29.4433 82.902 26.2914 84.1321 22.4476 84.1321ZM22.6014 79.0583C23.5309 79.0949 24.4565 78.9203 25.3088 78.5474C26.161 78.1746 26.9175 77.6133 27.5214 76.9058C28.7514 75.4452 29.3664 73.4464 29.3664 70.9096C29.3664 68.2189 28.7514 66.2202 27.5214 64.7596C26.9605 64.0315 26.2378 63.4441 25.4105 63.0438C24.5832 62.6435 23.6741 62.4413 22.7551 62.4533C21.8004 62.4232 20.8517 62.616 19.9843 63.0163C19.117 63.4166 18.3548 64.0135 17.7583 64.7596C16.4514 66.2971 15.8364 68.2958 15.8364 70.8327C15.8364 73.3695 16.4514 75.3683 17.7583 76.8289C18.9883 78.3664 20.6026 79.0583 22.6014 79.0583Z",
  p1cbcdf00: "M76.2576 9.40974L11.2213 50.6916L5.60947 41.851V34.1635C5.60947 31.4729 6.99322 28.8591 9.37635 27.3985L47.122 2.79849C49.9374 0.971986 53.2216 0 56.5776 0C59.9336 0 63.2178 0.971986 66.0332 2.79849L76.2576 9.40974Z",
  p208c6f00: "M51.5852 77.2137L22.3727 68.2962L84.4877 28.9362C85.6778 28.1703 86.6567 27.1179 87.3345 25.8755C88.0124 24.6332 88.3676 23.2405 88.3676 21.8252C88.3676 20.41 88.0124 19.0173 87.3345 17.775C86.6567 16.5326 85.6778 15.4802 84.4877 14.7143L84.1802 14.5606L84.9489 15.0218L103.86 27.3218C106.166 28.8593 107.55 31.3962 107.55 34.1637V41.4668L51.5852 77.1368V77.2137Z",
  p2f253f80: "M65.4996 2.4908L66.0377 2.87518L95.5577 22.0171L22.4496 68.2958L11.2258 50.6146L64.8846 16.4821C69.9583 13.2533 70.1889 5.95018 65.4996 2.41393V2.4908Z",
  p33940100: "M48.2751 101.967H89.8645C94.5538 101.967 99.0511 100.104 102.367 96.7883C105.683 93.4725 107.546 88.9752 107.546 84.2858V34.3171C107.546 37.2383 106.008 39.9289 103.702 41.4664L41.7407 80.3652C38.3582 82.4408 36.3595 86.1308 36.3595 90.0514C36.3595 96.5858 41.7407 101.967 48.2751 101.967Z",
  p369d2cf0: "M5.93687 14.765C5.84601 14.7649 5.75606 14.7468 5.67223 14.7118C5.5884 14.6767 5.51235 14.6254 5.44847 14.5608C5.3846 14.4961 5.33417 14.4195 5.30011 14.3353C5.26604 14.251 5.24901 14.1609 5.25 14.07C5.25 13.8856 5.3175 13.71 5.45125 13.5844L9.02 10.0075L5.45125 6.43875C5.38664 6.3756 5.3355 6.30001 5.30091 6.21654C5.26632 6.13308 5.249 6.04347 5.25 5.95312C5.25 5.55938 5.55187 5.26688 5.93687 5.26688C6.12937 5.26688 6.28 5.33375 6.41375 5.45938L9.99937 9.03688L13.6012 5.45125C13.7437 5.30875 13.8944 5.25 14.0781 5.25C14.4631 5.25 14.7731 5.55187 14.7731 5.93687C14.7731 6.12937 14.7144 6.28 14.5637 6.43062L10.9869 10.0075L14.5556 13.5763C14.6975 13.7013 14.765 13.8775 14.765 14.07C14.765 14.455 14.765 14.0619 14.765 14.765C13.9701 14.7675 13.8789 14.7509 13.7939 14.7162C13.7089 14.6816 13.632 14.6297 13.5681 14.5638L9.99937 10.9869L6.43875 14.5638C6.37304 14.6295 6.29469 14.6812 6.20843 14.7158C6.12217 14.7504 6.02979 14.7671 5.93687 14.765Z",
  pa4fdc0: "M22.526 83.8246C20.8331 83.8996 19.1431 83.624 17.5617 83.0151C15.9804 82.4062 14.542 81.4772 13.3366 80.2863C12.1312 79.0953 11.1849 77.6682 10.557 76.0943C9.92913 74.5204 9.63322 72.8338 9.68784 71.1402C9.68784 67.1427 10.841 63.9139 13.301 61.4539C15.761 58.9939 18.9897 57.7639 22.9103 57.7639C26.6772 57.7639 29.6753 58.9171 32.0585 61.3002C34.3647 63.6064 35.5947 66.6814 35.5947 70.6021C35.5947 74.5996 34.3647 77.7514 31.9047 80.2114C29.4447 82.5946 26.3697 83.8246 22.526 83.8246ZM22.6028 78.8277C24.6785 78.8277 26.2928 78.1358 27.5228 76.7521C28.7528 75.3683 29.3678 73.3696 29.3678 70.9096C29.3678 68.2958 28.8297 66.2971 27.5997 64.8364C27.0114 64.1305 26.2686 63.5693 25.4289 63.196C24.5891 62.8228 23.6748 62.6476 22.7566 62.6839C20.681 62.6839 18.9897 63.4527 17.7597 64.9902C16.4528 66.4508 15.8378 68.3727 15.8378 70.8327C15.8378 73.2927 16.4528 75.2146 17.7597 76.6752C18.9897 78.1358 20.6041 78.8277 22.6028 78.8277Z",
  paac6d80: "M9.225 48.1549H36.1312C41.1281 48.1549 45.2794 52.2292 45.2794 57.3799V84.2861C45.2794 89.283 41.1281 93.4342 36.0544 93.4342H9.225C6.77838 93.4342 4.43196 92.4623 2.70194 90.7323C0.971917 89.0023 0 86.6558 0 84.2092V57.303C0 52.2292 4.15125 48.078 9.225 48.078V48.1549Z",
  pe3cde40: "M65.1876 101.967H23.2907C18.6014 101.967 14.1041 100.104 10.7882 96.7883C7.47231 93.4725 5.60947 88.9752 5.60947 84.2858V34.3171C5.60947 37.2383 7.14697 39.9289 9.5301 41.4664L71.4145 80.4421C73.5366 81.801 75.1625 83.8095 76.0497 86.1681C76.937 88.5266 77.038 91.1088 76.3377 93.5294C75.6375 95.9501 74.1734 98.0795 72.164 99.6001C70.1546 101.121 67.7075 101.951 65.1876 101.967Z",
  pfbee380: "M66.1101 2.87519C63.2864 1.03273 59.9877 0.0516933 56.616 0.0516933C53.2444 0.0516933 49.9457 1.03273 47.122 2.87519L9.37635 27.3983C7.0701 28.9358 5.60947 31.4727 5.60947 34.2402V34.6246C5.68635 37.3921 7.14697 40.0058 9.5301 41.4664L56.5007 71.0633L103.625 41.4664C106.085 39.9289 107.546 37.2383 107.546 34.3939V41.5433V34.2402C107.546 31.4727 106.162 28.8589 103.856 27.3214L66.0332 2.95206L66.1101 2.87519Z",
};

// SVG Paths for Step 3 (from svg-7lu5669hrh.ts)
const step3Paths = {
  p7659d00: "M5.25317 6.2182C5.46077 6.0106 5.7822 6.01729 5.96969 6.21152L8.56792 8.96373L11.1527 6.21152C11.3402 6.0106 11.675 6.01729 11.8692 6.22489C12.05 6.41237 12.0433 6.72043 11.8491 6.92803L9.21746 9.71373C8.86923 10.0954 8.25317 10.0954 7.90494 9.71373L5.27323 6.92803C5.09917 6.74049 5.08574 6.39232 5.25317 6.2182Z",
};

const SERVICES = [
  "Web Design",
  // Future services will be added here
];

const JOB_OPTIONS = [
  "I would like to discuss some possibilities",
  "Create something new",
  "Refine something existing"
];

const WEB_DESIGN_SCOPE = [
  "UI/UX Audit",
  "Landing page(s)",
  "Website",
  "Web content or elements",
  "Design system",
  "Product design",
  "Interactive animations"
];

const WEB_DESIGN_SCOPE_ICONS: Record<string, string> = {
  "UI/UX Audit": "\u{1F4E5}",
  "Landing page(s)": "\u{1F4C4}",
  "Website": "\u{1F310}",
  "Web content or elements": "\u{1F58C}\uFE0F",
  "Design system": "\u{1F3A8}",
  "Product design": "\u{1F4F1}",
  "Interactive animations": "\u{1F300}",
};

const createDraftSessionId = () =>
  `draft-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

function ServiceIcon() {
  return (
    <div className="col-1 h-[15.159px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0.005px] mask-size-[16px_15.143px] ml-0 mt-[-0.03%] relative row-1 w-[15.989px]" style={{ maskImage: `url('${imgGroup}')` }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9889 15.1589">
        <g>
          <path d={svgPaths.p1580a300} fill="url(#paint0_linear_10_337)" />
          <path d={svgPaths.p251ad2c0} fill="url(#paint1_linear_10_337)" />
          <path d={svgPaths.p251ad2c0} fill="url(#paint2_linear_10_337)" />
          <path d={svgPaths.p3d7f4a80} fill="url(#paint3_linear_10_337)" />
          <path d={svgPaths.p3d7f4a80} fill="url(#paint4_linear_10_337)" />
          <path d={svgPaths.p36e1bf80} fill="url(#paint5_radial_10_337)" />
          <path d={svgPaths.p128ee80} fill="url(#paint6_linear_10_337)" />
          <path d={svgPaths.p128ee80} fill="url(#paint7_radial_10_337)" />
          <path d={svgPaths.p128ee80} fill="url(#paint8_radial_10_337)" />
          <path d={svgPaths.p3bc88f00} fill="url(#paint9_radial_10_337)" />
          <path d={svgPaths.p3bc88f00} fill="url(#paint10_linear_10_337)" />
          <path d={svgPaths.p9fbe800} fill="url(#paint11_radial_10_337)" />
          <path d={svgPaths.p9fbe800} fill="url(#paint12_radial_10_337)" />
          <path d={svgPaths.p22ddb670} fill="var(--fill-0, white)" />
          <path d={svgPaths.p277dcf00} fill="var(--fill-0, white)" />
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

function OutlookLogo() {
  return (
    <div className="mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0.031px] mask-size-[107.625px_101.859px] w-[107.6px] h-[102px] mx-auto" style={{ maskImage: `url('${imgGroupOutlook}')` }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 107.55 101.967">
        <g id="Group">
          <path d={outlookPaths.p1cbcdf00} fill="url(#paint0_linear_11_498)" id="Vector" />
          <path d={outlookPaths.p2f253f80} fill="url(#paint1_linear_11_498)" id="Vector_2" />
          <path d={outlookPaths.p2f253f80} fill="url(#paint2_linear_11_498)" id="Vector_3" />
          <path d={outlookPaths.p208c6f00} fill="url(#paint3_linear_11_498)" id="Vector_4" />
          <path d={outlookPaths.p208c6f00} fill="url(#paint4_linear_11_498)" id="Vector_5" />
          <path d={outlookPaths.pfbee380} fill="url(#paint5_radial_11_498)" id="Vector_6" />
          <path d={outlookPaths.p33940100} fill="url(#paint6_linear_11_498)" id="Vector_7" />
          <path d={outlookPaths.p33940100} fill="url(#paint7_radial_11_498)" id="Vector_8" />
          <path d={outlookPaths.p33940100} fill="url(#paint8_radial_11_498)" id="Vector_9" />
          <path d={outlookPaths.pe3cde40} fill="url(#paint9_radial_11_498)" id="Vector_10" />
          <path d={outlookPaths.pe3cde40} fill="url(#paint10_linear_11_498)" id="Vector_11" />
          <path d={outlookPaths.paac6d80} fill="url(#paint11_radial_11_498)" id="Vector_12" />
          <path d={outlookPaths.paac6d80} fill="url(#paint12_radial_11_498)" id="Vector_13" />
          <path d={outlookPaths.pa4fdc0} fill="var(--fill-0, white)" id="Vector_14" />
          <path d={outlookPaths.p15ecf170} fill="var(--fill-0, white)" id="Vector_15" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_11_498" x1="16.9101" x2="76.2576" y1="46.3097" y2="9.56349">
            <stop stopColor="#20A7FA" />
            <stop offset="0.4" stopColor="#3BD5FF" />
            <stop offset="1" stopColor="#C4B0FF" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_11_498" x1="37.3633" x2="70.3427" y1="58.8402" y2="6.02705">
            <stop stopColor="#165AD9" />
            <stop offset="0.5" stopColor="#0091FF" />
            <stop offset="1" stopColor="#8587FF" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_11_498" x1="61.4252" x2="24.7558" y1="59.6089" y2="29.7045">
            <stop offset="0.24" stopColor="#448AFF" stopOpacity="0" />
            <stop offset="0.79" stopColor="#0032B1" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_11_498" x1="56.7358" x2="114.7" y1="71.0637" y2="34.0099">
            <stop stopColor="#1A43A6" />
            <stop offset="0.49" stopColor="#2052CB" />
            <stop offset="1" stopColor="#5F20CB" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint4_linear_11_498" x1="73.1102" x2="37.9014" y1="68.9112" y2="38.3918">
            <stop stopColor="#0045B9" stopOpacity="0" />
            <stop offset="0.67" stopColor="#0D1F69" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(56.5776 2.26018) rotate(-90) scale(76.4753 82.7729)" gradientUnits="userSpaceOnUse" id="paint5_radial_11_498" r="1">
            <stop offset="0.57" stopColor="#275FF0" stopOpacity="0" />
            <stop offset="0.99" stopColor="#002177" />
          </radialGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint6_linear_11_498" x1="107.546" x2="56.1932" y1="67.7577" y2="67.7577">
            <stop stopColor="#4DC4FF" />
            <stop offset="0.2" stopColor="#0FAFFF" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(68.1739 90.3609) rotate(-45) scale(32.7735)" gradientUnits="userSpaceOnUse" id="paint7_radial_11_498" r="1">
            <stop offset="0.26" stopColor="#0060D1" stopOpacity="0.4" />
            <stop offset="0.91" stopColor="#0383F1" stopOpacity="0" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(18.7397 114.539) rotate(-52.66) scale(111.25 100.599)" gradientUnits="userSpaceOnUse" id="paint8_radial_11_498" r="1">
            <stop offset="0.73" stopColor="#F4A7F7" stopOpacity="0" />
            <stop offset="1" stopColor="#F4A7F7" stopOpacity="0.5" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(41.2026 60.9927) rotate(123.339) scale(58.6983 152.329)" gradientUnits="userSpaceOnUse" id="paint9_radial_11_498" r="1">
            <stop stopColor="#49DEFF" />
            <stop offset="0.72" stopColor="#29C3FF" />
          </radialGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint10_linear_11_498" x1="-1.61678" x2="47.8907" y1="90.2052" y2="90.2052">
            <stop offset="0.21" stopColor="#6CE0FF" />
            <stop offset="0.54" stopColor="#50D5FF" stopOpacity="0" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(-0.218953 49.8437) rotate(46.92) scale(59.6499)" gradientUnits="userSpaceOnUse" id="paint11_radial_11_498" r="1">
            <stop offset="0.04" stopColor="#0091FF" />
            <stop offset="0.92" stopColor="#183DAD" />
          </radialGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(22.6012 75.753) rotate(90) scale(31.7199 36.5878)" gradientUnits="userSpaceOnUse" id="paint12_radial_11_498" r="1">
            <stop offset="0.56" stopColor="#0FA5F7" stopOpacity="0" />
            <stop offset="1" stopColor="#74C6FF" stopOpacity="0.5" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

export function CreateProjectPopup({ 
  isOpen, 
  onClose,
  onCreate,
  user,
  editProjectId,
  initialDraftData,
  onDeleteDraft,
  reviewProject,
  onUpdateComments,
  onApproveReviewProject,
  onUploadAttachment,
  onRemovePendingAttachment,
  onDiscardDraftUploads,
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onCreate?: (data: any) => void;
  user?: { userId?: string; name: string; avatar: string; role?: WorkspaceRole };
  editProjectId?: string | null;
  initialDraftData?: ProjectDraftData | null;
  onDeleteDraft?: (id: string) => void;
  reviewProject?: ProjectData | null;
  onUpdateComments?: (projectId: string, comments: ReviewComment[]) => Promise<unknown>;
  onApproveReviewProject?: (projectId: string) => Promise<unknown>;
  onUploadAttachment?: (
    file: File,
    draftSessionId: string,
  ) => Promise<{
    pendingUploadId: string;
    name: string;
    type: string;
    mimeType: string | null;
    sizeBytes: number;
  }>;
  onRemovePendingAttachment?: (pendingUploadId: string) => Promise<void>;
  onDiscardDraftUploads?: (draftSessionId: string) => Promise<void>;
}) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [attachments, setAttachments] = useState<PendingDraftAttachmentUpload[]>([]);
  const [draftSessionId, setDraftSessionId] = useState(() => createDraftSessionId());
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteProjectConfirm, setShowDeleteProjectConfirm] = useState(false);
  const [reviewComments, setReviewComments] = useState<ReviewComment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [isApprovingReview, setIsApprovingReview] = useState(false);
  const discardRequestedRef = useRef(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Initialize from draft data when opening in edit mode
  useEffect(() => {
    if (isOpen && initialDraftData) {
      setSelectedService(initialDraftData.selectedService);
      setProjectName(initialDraftData.projectName);
      setSelectedJob(initialDraftData.selectedJob);
      setDescription(initialDraftData.description);
      setIsAIEnabled(initialDraftData.isAIEnabled);
      setDeadline(fromUtcNoonEpochMsToDateOnly(initialDraftData.deadlineEpochMs));
      setStep(initialDraftData.lastStep);
    }
  }, [isOpen, initialDraftData]);

  // Initialize from review project — jump directly to step 4 (success page)
  useEffect(() => {
    if (isOpen && reviewProject) {
      const categoryMap: Record<string, string> = {
        "webdesign": "Web Design", "web design": "Web Design",
        "automation": "AI Automation", "ai automation": "AI Automation",
        "marketing": "Marketing Campaigns", "marketing campaigns": "Marketing Campaigns",
        "presentation": "Presentation", "ai consulting": "AI Consulting",
        "creative strategy & concept": "Creative Strategy & Concept",
      };
      setSelectedService(categoryMap[reviewProject.category.toLowerCase()] || reviewProject.category);
      setProjectName(reviewProject.name);
      setSelectedJob(reviewProject.scope || null);
      setDescription(reviewProject.description);
      setDeadline(fromUtcNoonEpochMsToDateOnly(reviewProject.deadlineEpochMs));
      setReviewComments(reviewProject.comments || []);
      setStep(4);
    }
  }, [isOpen, reviewProject]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    discardRequestedRef.current = false;
    setDraftSessionId(createDraftSessionId());
    setAttachments([]);
  }, [isOpen]);

  // ── Service-specific configuration ──────────────────────────────
  type ServiceKey = typeof SERVICES[number];

  const getStep2Config = (service: ServiceKey) => {
    switch (service) {
      case "Web Design":
        return { title: "Define project details", logo: <ProjectLogo size={108} category={service} />, jobLabel: "Scope", jobOptions: WEB_DESIGN_SCOPE, jobIcons: WEB_DESIGN_SCOPE_ICONS as Record<string, string> | null };
      case "Presentation":
        return { title: "Define project details", logo: <ProjectLogo size={108} category={service} />, jobLabel: "Job", jobOptions: JOB_OPTIONS, jobIcons: null as Record<string, string> | null };
      case "AI Consulting":
        return { title: "Define project details", logo: <ProjectLogo size={108} category={service} />, jobLabel: "Job", jobOptions: JOB_OPTIONS, jobIcons: null as Record<string, string> | null };
      case "Marketing Campaigns":
        return { title: "Define project details", logo: <ProjectLogo size={108} category={service} />, jobLabel: "Job", jobOptions: JOB_OPTIONS, jobIcons: null as Record<string, string> | null };
      case "AI Automation":
        return { title: "Define project details", logo: <ProjectLogo size={108} category={service} />, jobLabel: "Job", jobOptions: JOB_OPTIONS, jobIcons: null as Record<string, string> | null };
      case "Creative Strategy & Concept":
        return { title: "Define project details", logo: <ProjectLogo size={108} category={service} />, jobLabel: "Job", jobOptions: JOB_OPTIONS, jobIcons: null as Record<string, string> | null };
      default:
        return { title: "Define project details", logo: <ProjectLogo size={108} category={service} />, jobLabel: "Job", jobOptions: JOB_OPTIONS, jobIcons: null as Record<string, string> | null };
    }
  };

  const getStep3Config = (service: ServiceKey) => {
    switch (service) {
      case "Web Design":
        return { title: "Lets explore some possibilities", showAttachments: true, showAI: true, showDeadline: true };
      case "Presentation":
        return { title: "Lets explore some possibilities", showAttachments: true, showAI: true, showDeadline: true };
      case "AI Consulting":
        return { title: "Lets explore some possibilities", showAttachments: true, showAI: true, showDeadline: true };
      case "Marketing Campaigns":
        return { title: "Lets explore some possibilities", showAttachments: true, showAI: true, showDeadline: true };
      case "AI Automation":
        return { title: "Lets explore some possibilities", showAttachments: true, showAI: true, showDeadline: true };
      case "Creative Strategy & Concept":
        return { title: "Lets explore some possibilities", showAttachments: true, showAI: true, showDeadline: true };
      default:
        return { title: "Lets explore some possibilities", showAttachments: true, showAI: true, showDeadline: true };
    }
  };

  const step2Config = selectedService ? getStep2Config(selectedService as ServiceKey) : null;
  const step3Config = selectedService ? getStep3Config(selectedService as ServiceKey) : null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }

    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarOpen]);

  const uploadAttachmentEntry = useCallback(
    async (file: File, clientId: string) => {
      if (!onUploadAttachment) {
        setAttachments((prev) =>
          prev.map((entry) =>
            entry.clientId === clientId
              ? { ...entry, status: "error", error: "Upload handler is unavailable" }
              : entry,
          ),
        );
        return;
      }

      try {
        const uploaded = await onUploadAttachment(file, draftSessionId);
        if (discardRequestedRef.current && onRemovePendingAttachment) {
          await onRemovePendingAttachment(uploaded.pendingUploadId);
          setAttachments((prev) => prev.filter((entry) => entry.clientId !== clientId));
          return;
        }

        setAttachments((prev) =>
          prev.map((entry) =>
            entry.clientId === clientId
              ? {
                  ...entry,
                  status: "uploaded",
                  pendingUploadId: uploaded.pendingUploadId,
                  name: uploaded.name,
                  type: uploaded.type,
                  error: undefined,
                }
              : entry,
          ),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed";
        setAttachments((prev) =>
          prev.map((entry) =>
            entry.clientId === clientId
              ? { ...entry, status: "error", error: message }
              : entry,
          ),
        );
      }
    },
    [draftSessionId, onRemovePendingAttachment, onUploadAttachment],
  );

  const inferAttachmentType = (file: File) =>
    file.name.split(".").pop()?.toUpperCase() || "FILE";

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newEntries: PendingDraftAttachmentUpload[] = acceptedFiles.map((file, index) => ({
        clientId: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        name: file.name,
        type: inferAttachmentType(file),
        status: "uploading",
      }));

      setAttachments((prev) => [...prev, ...newEntries]);
      newEntries.forEach((entry) => {
        void uploadAttachmentEntry(entry.file, entry.clientId);
      });
    },
    [uploadAttachmentEntry],
  );

  const handleRemoveAttachment = useCallback(
    (clientId: string) => {
      setAttachments((prev) => {
        const target = prev.find((entry) => entry.clientId === clientId);
        if (target?.pendingUploadId && onRemovePendingAttachment) {
          void onRemovePendingAttachment(target.pendingUploadId).catch(() => {
            // The row is removed from UI regardless. Backend retention cleanup still protects storage.
          });
        }
        return prev.filter((entry) => entry.clientId !== clientId);
      });
    },
    [onRemovePendingAttachment],
  );

  const handleRetryAttachment = useCallback(
    (clientId: string) => {
      const target = attachments.find((entry) => entry.clientId === clientId);
      if (!target) {
        return;
      }
      setAttachments((prev) =>
        prev.map((entry) =>
          entry.clientId === clientId
            ? { ...entry, status: "uploading", error: undefined, pendingUploadId: undefined }
            : entry,
        ),
      );
      void uploadAttachmentEntry(target.file, target.clientId);
    },
    [attachments, uploadAttachmentEntry],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  if (!isOpen) return null;

  const isStepValid = () => {
    if (step === 1) return !!selectedService;
    if (step === 2) return !!projectName.trim() && !!selectedJob;
    return true;
  };
  const isUploading = attachments.some((file) => file.status === "uploading");
  const isNextDisabled = !isStepValid() || (step === 3 && isUploading);

  const hasUnsavedWork = () => {
    // For new projects: any selection means there's something to save
    if (!editProjectId) {
      return !!selectedService || !!projectName.trim();
    }
    // For existing drafts: compare current state against initial draft data
    if (initialDraftData) {
      if ((selectedService || "") !== (initialDraftData.selectedService || "")) return true;
      if (projectName !== (initialDraftData.projectName || "")) return true;
      if ((selectedJob || "") !== (initialDraftData.selectedJob || "")) return true;
      if (description !== (initialDraftData.description || "")) return true;
      if (isAIEnabled !== initialDraftData.isAIEnabled) return true;
      const initialDeadlineEpochMs = initialDraftData.deadlineEpochMs ?? null;
      const currentDeadlineEpochMs = deadline ? toUtcNoonEpochMsFromDateOnly(deadline) : null;
      if (currentDeadlineEpochMs !== initialDeadlineEpochMs) return true;
      if (attachments.length > 0) return true;
      return false;
    }
    // Editing but no initial draft data (e.g. review project) — check if anything is filled
    return !!selectedService || !!projectName.trim();
  };

  const buildDraftData = (): ProjectDraftData => ({
    selectedService: selectedService || "",
    projectName,
    selectedJob: selectedJob || "",
    description,
    isAIEnabled,
    deadlineEpochMs: deadline ? toUtcNoonEpochMsFromDateOnly(deadline) : null,
    lastStep: step,
  });

  const createProject = (status: string) => {
    if (isUploading) {
      toast.error("Please wait for attachments to finish uploading");
      return;
    }

    const attachmentPendingUploadIds = attachments
      .filter((file) => file.status === "uploaded" && file.pendingUploadId)
      .map((file) => file.pendingUploadId as string);

    // Generate project ID so we can reference it for comments on the success page
    const generatedId = editProjectId || (projectName || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
    setCreatedProjectId(generatedId);

    const projectData: any = {
      _generatedId: generatedId,
      name: projectName,
      description,
      category: selectedService,
      scope: selectedJob,
      deadlineEpochMs: deadline ? toUtcNoonEpochMsFromDateOnly(deadline) : null,
      attachmentPendingUploadIds,
      status: status,
    };

    // Include draft data for draft saves so progress can be restored
    if (status === "Draft") {
      projectData.draftData = buildDraftData();
    } else {
      projectData.draftData = null; // Clear draft data on final submit
    }

    // Include editProjectId so App.tsx knows to update rather than create
    if (editProjectId) {
      projectData._editProjectId = editProjectId;
    }
    
    console.log("Project Created", projectData);
    
    if (onCreate) {
      onCreate(projectData);
    }
  };

  const handleNext = () => {
    if (step === 1 && isStepValid()) {
      setStep(2);
    } else if (step === 2 && isStepValid()) {
      setStep(3);
    } else if (step === 3) {
      createProject("Review");
      setStep(4);
    }
  };

  const handleDeleteDraft = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (editProjectId && onDeleteDraft) {
      onDeleteDraft(editProjectId);
    }
    setShowDeleteConfirm(false);
    handleCancel();
  };

  const handleConfirmDeleteProject = () => {
    const projectId = reviewProject?.id || editProjectId || createdProjectId;
    if (projectId && onDeleteDraft) {
      onDeleteDraft(projectId);
    }
    setShowDeleteProjectConfirm(false);
    handleCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const handleCancel = (options?: { discardUploads?: boolean }) => {
    const shouldDiscardUploads = options?.discardUploads !== false;
    if (shouldDiscardUploads) {
      discardRequestedRef.current = true;
    }
    if (
      shouldDiscardUploads &&
      onDiscardDraftUploads &&
      attachments.length > 0
    ) {
      void onDiscardDraftUploads(draftSessionId).catch(() => {
        // Best effort cleanup; stale-upload cron covers missed cases.
      });
    }

    onClose();
    setTimeout(() => {
      setStep(1);
      setSelectedService(null);
      setProjectName("");
      setSelectedJob(null);
      setDescription("");
      setIsAIEnabled(true);
      setDeadline(undefined);
      setIsCalendarOpen(false);
      setAttachments([]);
      setShowCloseConfirm(false);
      setShowDeleteConfirm(false);
      setReviewComments([]);
      setCommentInput("");
      setCreatedProjectId(null);
      setDraftSessionId(createDraftSessionId());
    }, 300);
  };

  // Close button handler: show confirmation if there's unsaved work
  const handleCloseClick = () => {
    // Review projects should close directly — no "Save as draft?" prompt
    if (reviewProject) {
      handleCancel();
      return;
    }
    if (hasUnsavedWork()) {
      setShowCloseConfirm(true);
    } else {
      handleCancel();
    }
  };

  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    const newComment: ReviewComment = {
      id: Date.now().toString(),
      author: { userId: user?.userId, name: user?.name || "You", avatar: user?.avatar || "" },
      content: commentInput.trim(),
      timestamp: "Just now",
    };
    const previous = reviewComments;
    const updated = [...previous, newComment];
    setReviewComments(updated);
    setCommentInput("");
    // Persist to project data
    const projectId = reviewProject?.id || editProjectId || createdProjectId;
    if (projectId && onUpdateComments) {
      void onUpdateComments(projectId, updated).catch((error) => {
        console.error(error);
        setReviewComments(previous);
        toast.error("Failed to update comments");
      });
    }
    setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleDeleteComment = (commentId: string) => {
    const comment = reviewComments.find((entry) => entry.id === commentId);
    if (!comment) {
      return;
    }

    if (!user?.userId || comment.author.userId !== user.userId) {
      toast.error("You can only delete your own comments");
      return;
    }

    const previous = reviewComments;
    const updated = previous.filter((c) => c.id !== commentId);
    setReviewComments(updated);
    const projectId = reviewProject?.id || editProjectId || createdProjectId;
    if (projectId && onUpdateComments) {
      void onUpdateComments(projectId, updated).catch((error) => {
        console.error(error);
        setReviewComments(previous);
        toast.error("Failed to update comments");
      });
    }
  };

  const canApproveReviewProject =
    !!reviewProject?.id &&
    reviewProject.status.label === "Review" &&
    user?.role === "owner" &&
    !!onApproveReviewProject;

  const handleApproveReview = () => {
    if (!reviewProject?.id || !onApproveReviewProject || isApprovingReview) {
      return;
    }

    setIsApprovingReview(true);
    void onApproveReviewProject(reviewProject.id)
      .then(() => {
        handleCancel();
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to approve project");
      })
      .finally(() => {
        setIsApprovingReview(false);
      });
  };

  // Save draft / Save progress from confirmation dialog
  const handleConfirmSave = () => {
    createProject("Draft");
    setShowCloseConfirm(false);
    handleCancel({ discardUploads: false });
  };

  // Cancel from confirmation dialog
  const handleConfirmCancel = () => {
    if (editProjectId && initialDraftData) {
      // Revert: re-save the project with its ORIGINAL draft data (no changes)
      const revertData: any = {
        name: initialDraftData.projectName,
        description: initialDraftData.description,
        category: initialDraftData.selectedService,
        scope: initialDraftData.selectedJob,
        deadlineEpochMs: initialDraftData.deadlineEpochMs ?? null,
        status: "Draft",
        draftData: initialDraftData,
        _editProjectId: editProjectId,
      };
      if (onCreate) {
        onCreate(revertData);
      }
    }
    setShowCloseConfirm(false);
    handleCancel();
  };

  // Close button SVG component for reuse
  const CloseButton = ({ className = "" }: { className?: string }) => (
    <button 
      onClick={handleCloseClick}
      className={`backdrop-blur-[6px] bg-[rgba(232,232,232,0.06)] content-stretch flex items-center justify-center p-px relative rounded-full shrink-0 size-[36px] hover:bg-[rgba(232,232,232,0.1)] transition-colors cursor-pointer ${className}`}
    >
      <div className="relative shrink-0 size-[20px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
          <path d={svgPaths.p369d2cf0} fill="var(--fill-0, #E8E8E8)" />
        </svg>
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={handleCloseClick}>
      <div className={`bg-[#1e1f20] relative rounded-[40px] w-full max-w-[514px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.04),0px_12px_32px_0px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300 max-h-[90vh] flex flex-col`} onClick={(e) => e.stopPropagation()}>
        {/* Border stroke */}
        <div aria-hidden="true" className="absolute border border-[#131314] border-solid inset-0 pointer-events-none rounded-[40px] z-20" />
        
        <div className={`flex flex-col items-start w-full relative rounded-[inherit] ${step === 4 ? 'flex-1 overflow-hidden' : 'overflow-y-auto custom-scrollbar'}`}>
          
          {/* Header Image Area (Step 1 only) */}
          {step === 1 && (
            <div className="h-[187px] relative shrink-0 w-full">
              <picture className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none pointer-events-none size-full">
                <source srcSet={createProjectBgWebp} type="image/webp" />
                <img
                  alt=""
                  className="size-full object-cover pointer-events-none"
                  src={createProjectBgFallbackPng}
                />
              </picture>
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start px-[32px] py-[24px] relative size-full">
                <div className="content-stretch flex items-center relative shrink-0 w-full justify-between">
                  <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[17.7px] whitespace-nowrap">
                    <p className="leading-[25.2px]">{editProjectId ? "Edit Project" : "Create a new Project"}</p>
                  </div>
                  
                  {/* Close Button */}
                  <CloseButton className="z-30" />
                </div>
              </div>
            </div>
          )}

          {/* Close Button (Steps 2 & 3) */}
          {(step === 2 || step === 3) && (
             <div className="absolute right-[25px] top-[25px] z-30">
                <CloseButton />
             </div>
          )}

          {/* Step 3 Header Title */}
          {step === 3 && step3Config && (
            <motion.div
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.35 }}
              className="px-[33px] pt-[29px] w-full"
            >
               <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[17.7px] whitespace-nowrap">
                  <p className="leading-[25.2px]">{step3Config.title}</p>
               </div>
            </motion.div>
          )}

          {/* Content Area */}
          <div className={`${step === 1 ? 'p-[32px]' : step === 4 ? 'flex-1 flex flex-col overflow-hidden' : 'px-[33px] pb-[33px]'} w-full flex flex-col`}>
            
            {/* Step 1 Content */}
            {step === 1 && (
              <>
                <motion.div 
                  initial={{ y: 6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.05, duration: 0.35 }}
                  className="mb-6 w-full"
                >
                  <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] min-h-px min-w-px relative text-[#e8e8e8] text-[14px] mb-2">
                    <p className="leading-[19.6px] whitespace-pre-wrap">Solutions</p>
                  </div>
                  <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[13.8px] text-[rgba(232,232,232,0.6)] w-full">
                    <p className="leading-[19.6px] whitespace-pre-wrap">Choose the service that fit your needs.</p>
                  </div>
                </motion.div>

                <div className="flex flex-wrap gap-4 w-full mb-8">
                  {SERVICES.map((service, idx) => (
                    <motion.div 
                      key={service}
                      initial={{ y: 6, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.12 + idx * 0.05, duration: 0.3 }}
                      onClick={() => setSelectedService(service)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => handleKeyDown(e, () => setSelectedService(service))}
                      className={`
                        content-stretch flex gap-[8px] h-[36px] items-center px-[14px] relative rounded-full shrink-0 cursor-pointer transition-all border outline-none focus-visible:ring-2 focus-visible:ring-white/50
                        ${selectedService === service 
                          ? "bg-white/10 border-white/20 text-white" 
                          : "bg-transparent border-transparent hover:bg-white/5 text-[#e8e8e8]"}
                      `}
                    >
                      <ProjectLogo size={16} category={service} />
                      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] whitespace-nowrap">
                        <p className="leading-[21px]">{service}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                

              </>
            )}

            {/* Step 2 Content */}
            {step === 2 && step2Config && (
              <div className="pt-[29px] flex flex-col items-center gap-[32px] w-full">
                 <div className="flex flex-col items-center gap-4 pt-[20px]">
                   <motion.div
                     initial={{ scale: 0.5, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     transition={{ type: "spring", stiffness: 300, damping: 20 }}
                   >
                     {step2Config.logo}
                   </motion.div>
                   <motion.div
                     initial={{ y: 6, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.15, duration: 0.35 }}
                     className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[17.7px] whitespace-nowrap"
                   >
                      <p className="leading-[25.2px]">{step2Config.title}</p>
                   </motion.div>
                 </div>

                 <div className="w-full flex flex-col gap-[16px]">
                    <motion.div
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.25, duration: 0.35 }}
                      className="w-full flex flex-col gap-[0.01px]"
                    >
                       <div className="pb-[8px] w-full">
                          <p className="font-medium text-[14px] text-[rgba(232,232,232,0.6)] leading-[19.6px]">Project name</p>
                       </div>
                       <div className="w-full border-b border-[rgba(232,232,232,0.1)] pb-[5px]">
                          <input 
                             type="text" 
                             value={projectName}
                             onChange={(e) => setProjectName(e.target.value)}
                             className="w-full bg-transparent border-none outline-none font-medium text-[#e8e8e8] text-[19.5px] leading-[32px] p-0 placeholder-white/20"
                             placeholder="Enter project name..."
                          />
                       </div>
                    </motion.div>

                    <motion.div
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.35, duration: 0.35 }}
                      className="w-full pt-[16px]"
                    >
                       <div className="pb-[8px] w-full">
                          <p className="font-medium text-[14px] text-[rgba(232,232,232,0.6)] leading-[19.6px]">{step2Config.jobLabel}</p>
                       </div>
                       <div className="flex flex-wrap gap-[6px] items-start w-full">
                          {step2Config.jobOptions.map((job, idx) => (
                             <motion.div 
                                key={job}
                                initial={{ y: 6, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.42 + idx * 0.04, duration: 0.3 }}
                                onClick={() => setSelectedJob(job)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => handleKeyDown(e, () => setSelectedJob(job))}
                                className={`
                                   backdrop-blur-[6px] bg-[rgba(232,232,232,0.04)] content-stretch flex h-[36px] items-center px-[17px] py-[7px] relative rounded-full shrink-0 cursor-pointer border transition-all outline-none focus-visible:ring-2 focus-visible:ring-white/50
                                   ${selectedJob === job 
                                     ? "bg-white/10 border-white/20 text-white" 
                                     : "border-[rgba(232,232,232,0.04)] hover:bg-white/5 text-[#e8e8e8]"}
                                `}
                             >
                                <p className="font-medium text-[14px] leading-[20px] whitespace-nowrap">
                                   {step2Config.jobIcons?.[job] && <span className="mr-[6px]">{step2Config.jobIcons[job]}</span>}
                                   {job}
                                </p>
                             </motion.div>
                          ))}
                       </div>
                    </motion.div>
                 </div>
              </div>
            )}

            {/* Step 3 Content */}
            {step === 3 && step3Config && (
               <div className="pt-[16px] w-full flex flex-col h-[480px] overflow-y-auto custom-scrollbar pr-1">
                  {/* Project Description */}
                  <motion.div
                     initial={{ y: 8, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.1, duration: 0.35 }}
                     className="w-full mb-[32px]"
                  >
                     <p className="font-medium text-[14px] text-[rgba(232,232,232,0.6)] mb-[8px]">Project descripton</p>
                     <div className="bg-[rgba(232,232,232,0.04)] h-[104px] rounded-[18px] w-full border border-[rgba(232,232,232,0.04)] relative">
                        <textarea 
                           className="w-full h-full bg-transparent border-none outline-none resize-none p-[16px] text-[#e8e8e8] text-[14px] placeholder-[rgba(232,232,232,0.4)]"
                           placeholder="Enter workflow description"
                           value={description}
                           onChange={(e) => setDescription(e.target.value)}
                        />
                     </div>
                  </motion.div>

                  {/* Attachments */}
                  {step3Config.showAttachments && (
                     <motion.div
                        initial={{ y: 8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.35 }}
                        className="w-full mb-[32px]"
                     >
                        <p className="font-medium text-[14px] text-[rgba(232,232,232,0.6)] mb-[8px]">Attachments</p>
                        
                        <div 
                           {...getRootProps()}
                           className={`
                               border border-dashed border-[rgba(232,232,232,0.2)] rounded-[18px] w-full min-h-[64px] flex flex-col items-center justify-center cursor-pointer transition-colors relative p-4
                               ${isDragActive ? "bg-white/10 border-white/40" : "hover:bg-[rgba(232,232,232,0.04)]"}
                           `}
                        >
                           <input {...getInputProps()} />
                           <div className="flex items-center gap-2 mb-1">
                               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#e8e8e8] opacity-60">
                                   <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                               </svg>
                               <span className="text-[14px] text-[#e8e8e8] opacity-60 font-medium">
                                   {isDragActive ? "Drop files here..." : "Upload file"}
                               </span>
                           </div>
                           
                           {attachments.length > 0 && (
                               <div className="flex flex-col gap-1 mt-2 w-full">
                                   {attachments.map((file) => (
                                       <div key={file.clientId} className="flex items-center justify-between text-xs text-white/60 bg-white/5 rounded px-2 py-1">
                                           <div className="flex flex-col min-w-0">
                                             <span className="truncate max-w-[250px]">{file.name}</span>
                                             <span className="text-[10px] text-white/40">
                                               {file.status === "uploading" && "Uploading..."}
                                               {file.status === "uploaded" && "Uploaded"}
                                               {file.status === "error" && (file.error || "Upload failed")}
                                             </span>
                                           </div>
                                           <div className="flex items-center gap-2 shrink-0">
                                             {file.status === "error" && (
                                               <button
                                                 onClick={(e) => {
                                                   e.stopPropagation();
                                                   handleRetryAttachment(file.clientId);
                                                 }}
                                                 className="text-[10px] text-white/70 hover:text-white"
                                               >
                                                 Retry
                                               </button>
                                             )}
                                             <button
                                               onClick={(e) => {
                                                 e.stopPropagation();
                                                 handleRemoveAttachment(file.clientId);
                                               }}
                                               className="hover:text-white"
                                             >
                                               &times;
                                             </button>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           )}
                        </div>
                     </motion.div>
                  )}

                  {/* Allow AI usage */}
                  {step3Config.showAI && (
                     <motion.div
                        initial={{ y: 8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.35 }}
                        className="w-full mb-[32px]"
                     >
                        <p className="font-medium text-[14px] text-[#e8e8e8] mb-[4px]">Allow AI usage</p>
                        <p className="text-[13.8px] text-[rgba(232,232,232,0.6)] mb-[8px] leading-[19.6px]">
                           Superlane will leverage AI tools when and if it&apos;s useful; for ideation, efficiency, volume and quality.
                        </p>
                        <div 
                           className={`${isAIEnabled ? "bg-[#22c55e]" : "bg-[rgba(232,232,232,0.08)]"} flex h-[16px] items-center px-[2px] relative rounded-[16px] w-[26px] cursor-pointer transition-colors`}
                           onClick={() => setIsAIEnabled(!isAIEnabled)}
                        >
                           <motion.div 
                              className="bg-white rounded-[6px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.15)] size-[12px]" 
                              animate={{ x: isAIEnabled ? 10 : 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                           />
                        </div>
                     </motion.div>
                  )}

                  {/* Final Deadline */}
                  {step3Config.showDeadline && (
                     <motion.div
                        initial={{ y: 8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.35 }}
                        className="w-full mb-[24px]"
                     >
                        <p className="font-medium text-[14px] text-[#e8e8e8] mb-[4px]">Final deadline</p>
                        <p className="text-[13.7px] text-[rgba(232,232,232,0.6)] mb-[8px]">When do you expect to receive all assets ready to use?</p>
                        
                        <div className="relative w-full" ref={calendarRef}>
                           <div 
                              className="bg-[rgba(255,255,255,0)] flex items-center h-[36px] rounded-[100px] shadow-[0px_0px_0px_1px_rgba(232,232,232,0.15)] w-full px-[20px] relative cursor-pointer hover:bg-white/5 transition-colors"
                              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                           >
                              <div className="flex-1 text-[#e8e8e8] text-[14px] font-medium">
                                 {formatProjectDeadlineLong(
                                   deadline ? toUtcNoonEpochMsFromDateOnly(deadline) : null,
                                 )}
                              </div>
                              <div className="size-[16px] shrink-0 opacity-80">
                                 <svg className="block size-full" fill="none" viewBox="0 0 16 16">
                                    <path d={step3Paths.p7659d00} fill="var(--fill-0, #E8E8E8)" fillOpacity="0.8" />
                                 </svg>
                              </div>
                           </div>

                           <AnimatePresence>
                              {isCalendarOpen && (
                                 <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute bottom-[calc(100%+8px)] right-0 z-50 p-4 bg-[#262626] rounded-2xl shadow-xl border border-white/10"
                                 >
                                    <style>{`
                                       .rdp {
                                         --rdp-cell-size: 32px;
                                         --rdp-accent-color: #ffffff;
                                         --rdp-background-color: #333333;
                                         margin: 0;
                                       }
                                       .rdp-day_selected:not([disabled]) { 
                                         background-color: #ef4444;
                                         color: #ffffff;
                                         font-weight: bold;
                                         border-radius: 50%;
                                       }
                                       .rdp-day_selected:hover:not([disabled]) { 
                                         background-color: #dc2626;
                                       }
                                       .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
                                         background-color: rgba(255,255,255,0.1);
                                         border-radius: 50%;
                                       }
                                       .rdp-caption_label {
                                         color: #e8e8e8;
                                         font-size: 14px;
                                         font-weight: 500;
                                       }
                                       .rdp-nav_button {
                                         color: #e8e8e8;
                                         width: 24px;
                                         height: 24px;
                                         background: transparent;
                                         border: none;
                                         opacity: 0.7;
                                         transition: opacity 0.2s;
                                       }
                                       .rdp-nav_button:hover {
                                         opacity: 1;
                                         background-color: rgba(255,255,255,0.05) !important;
                                       }
                                       .rdp-nav_button svg {
                                         width: 14px;
                                         height: 14px;
                                       }
                                       .rdp-head_cell {
                                          color: rgba(232,232,232,0.5);
                                          font-size: 12px;
                                       }
                                       .rdp-day {
                                          color: #e8e8e8;
                                          font-size: 13px;
                                       }
                                       .rdp-day_outside {
                                         opacity: 0.5;
                                       }
                                       .rdp-day_disabled { 
                                         color: rgba(232,232,232, 0.2);
                                         opacity: 0.5;
                                         pointer-events: none;
                                       }
                                       .rdp-day_today:not(.rdp-day_selected) { 
                                         font-weight: 600;
                                       }
                                    `}</style>
                                    <DayPicker
                                       mode="single"
                                       selected={deadline}
                                       onSelect={(date) => {
                                           if (date) {
                                               setDeadline(date);
                                               setIsCalendarOpen(false);
                                           }
                                       }}
                                       showOutsideDays
                                       disabled={{ before: new Date() }}
                                    />
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                     </motion.div>
                  )}
               </div>
            )}

            {/* Step 4 Content: Success — fixed header, scrollable middle, fixed footer */}
            {step === 4 && (
              <div className="flex flex-col w-full flex-1 overflow-hidden">
                {/* Fixed Header */}
                <div className="px-[33px] pt-[29px] pb-[20px] shrink-0 relative">
                  {/* Close button */}
                  <div className="absolute right-[25px] top-[25px] z-30">
                    <button 
                      onClick={handleCancel}
                      className="backdrop-blur-[6px] bg-[rgba(232,232,232,0.06)] content-stretch flex items-center justify-center p-px relative rounded-full shrink-0 size-[36px] hover:bg-[rgba(232,232,232,0.1)] transition-colors cursor-pointer"
                    >
                      <div className="relative shrink-0 size-[20px]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                          <path d={svgPaths.p369d2cf0} fill="var(--fill-0, #E8E8E8)" />
                        </svg>
                      </div>
                    </button>
                  </div>

                  {/* Success header */}
                  <div className="flex items-center gap-3">
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="size-[36px] rounded-full bg-[#f97316]/10 flex items-center justify-center shrink-0"
                    >
                      <Loading03 className="size-[18px] animate-spin [animation-duration:4s] [--stroke-0:#f97316]" />
                    </motion.div>
                    <motion.div
                      initial={{ y: 6, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15, duration: 0.35 }}
                    >
                      <h2 className="text-[17.7px] font-medium text-[#e8e8e8] leading-[25.2px]">{editProjectId ? "Project updated" : "Your Project is in Review"}</h2>
                    </motion.div>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-[33px]">
                  {/* Summary */}
                  <motion.div
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25, duration: 0.35 }}
                    className="w-full rounded-[16px] bg-[rgba(232,232,232,0.03)] border border-[rgba(232,232,232,0.06)] p-[20px] mb-[28px]"
                  >
                    <div className="grid grid-cols-2 gap-y-[16px] gap-x-[24px]">
                      <div className="flex flex-col gap-[4px]">
                        <span className="text-[12px] text-[rgba(232,232,232,0.4)] tracking-wide uppercase">Service</span>
                        <div className="flex items-center gap-[6px]">
                          {selectedService && <ProjectLogo size={14} category={selectedService} />}
                          <span className="text-[14px] text-[#e8e8e8] font-medium">{selectedService || "\u2014"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-[4px]">
                        <span className="text-[12px] text-[rgba(232,232,232,0.4)] tracking-wide uppercase">{step2Config?.jobLabel || "Scope"}</span>
                        <span className="text-[14px] text-[#e8e8e8] font-medium">{selectedJob || "\u2014"}</span>
                      </div>
                      <div className="flex flex-col gap-[4px]">
                        <span className="text-[12px] text-[rgba(232,232,232,0.4)] tracking-wide uppercase">Created by</span>
                        <div className="flex items-center gap-[6px]">
                          {user?.avatar && (
                            <img src={user.avatar} alt={user.name} className="size-[16px] rounded-full object-cover" />
                          )}
                          <span className="text-[14px] text-[#e8e8e8] font-medium">{user?.name || "Unknown"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-[4px]">
                        <span className="text-[12px] text-[rgba(232,232,232,0.4)] tracking-wide uppercase">Deadline</span>
                        <span className="text-[14px] text-[#e8e8e8] font-medium">
                          {formatProjectDeadlineMedium(
                            deadline ? toUtcNoonEpochMsFromDateOnly(deadline) : null,
                          )}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                {/* Comments Section */}
                  <motion.div
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.35 }}
                    className="w-full mb-[28px]"
                  >
                    <p className="text-[14px] text-[rgba(232,232,232,0.5)] font-medium mb-[12px]">Add additional comments</p>

                    {/* Comment Input */}
                    <div className="flex items-start gap-[10px] mb-[16px]">
                      <div className="shrink-0 pt-[3px]">
                        <div className="w-[26px] h-[26px] rounded-full overflow-hidden bg-[#222] ring-1 ring-white/[0.06]">
                          {user?.avatar && <img src={user.avatar} alt={user?.name || "You"} className="w-full h-full object-cover" />}
                        </div>
                      </div>
                      <div className="flex-1 flex items-center gap-[8px]">
                        <input
                          type="text"
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && commentInput.trim()) { e.preventDefault(); handleAddComment(); } }}
                          placeholder="Add a comment..."
                          className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-full px-[14px] py-[7px] text-[13px] text-[#E8E8E8] placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                        />
                        <button
                          onClick={handleAddComment}
                          disabled={!commentInput.trim()}
                          className="shrink-0 size-[32px] rounded-full bg-[#e8e8e8] hover:bg-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#131314" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                        </button>
                      </div>
                    </div>

                    {/* Comment List */}
                    {reviewComments.length > 0 && (
                      <div className="flex flex-col">
                        {reviewComments.map((comment) => (
                          <div key={comment.id} className="group/comment flex items-start gap-[10px] py-[10px] px-[2px] rounded-xl">
                            <div className="shrink-0 pt-[1px]">
                              <div className="w-[26px] h-[26px] rounded-full overflow-hidden bg-[#222] ring-1 ring-white/[0.06]">
                                {comment.author.avatar && <img src={comment.author.avatar} alt={comment.author.name} className="w-full h-full object-cover" />}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-[8px] mb-[2px]">
                                <span className="text-[13px] text-[#E8E8E8]">{comment.author.name}</span>
                                <span className="text-[11px] text-white/25 select-none">{comment.timestamp}</span>
                              </div>
                              <p className="text-[13.5px] text-[#E8E8E8]/75 leading-[1.55] whitespace-pre-wrap break-words">{comment.content}</p>
                            </div>
                            {user?.userId && comment.author.userId === user.userId && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="shrink-0 mt-[2px] opacity-0 group-hover/comment:opacity-100 transition-opacity duration-150 p-[5px] rounded-md hover:bg-white/[0.06] cursor-pointer"
                                title="Delete comment"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(232,232,232,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}


                  </motion.div>

                  {/* What happens next */}
                  <motion.div
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.35 }}
                    className="w-full mb-[8px]"
                  >
                    <p className="text-[14px] text-[rgba(232,232,232,0.5)] font-medium mb-[20px]">Here&#39;s what happens next:</p>

                    <div className="flex flex-col relative">
                      {/* Vertical connector line */}
                      <div className="absolute left-[11px] top-[24px] bottom-[24px] w-px bg-[rgba(232,232,232,0.06)]" />

                      {[
                        {
                          num: "1",
                          title: "Brief review",
                          desc: "Your PM will review your project request within 48 hours, confirm the details, and follow up with any questions so we\u2019re fully aligned."
                        },
                        {
                          num: "2",
                          title: "Kickoff call",
                          desc: "Our team may reach out if a kickoff call is needed to ensure the project\u2019s success."
                        },
                        {
                          num: "3",
                          title: "Scoping and estimates",
                          desc: "We\u2019ll prepare cost estimates for your approval before any work begins, ensuring everything\u2019s clear and agreed upfront."
                        },
                        {
                          num: "4",
                          title: "Project timeline",
                          desc: "Your PM will share a proposed timeline based on your requested delivery date, so you\u2019ll know exactly what\u2019s happening and when."
                        }
                      ].map((item, idx) => (
                        <motion.div
                          key={item.num}
                          initial={{ y: 6, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.5 + idx * 0.08, duration: 0.3 }}
                          className={`flex gap-[12px] ${idx < 3 ? "pb-[20px]" : ""}`}
                        >
                          <div className="size-[22px] rounded-full bg-[rgba(232,232,232,0.06)] flex items-center justify-center shrink-0 z-10">
                            <span className="text-[11px] text-[rgba(232,232,232,0.5)] font-medium">{item.num}</span>
                          </div>
                          <div className="flex flex-col gap-[2px] pt-[1px]">
                            <span className="text-[13.5px] text-[#e8e8e8] font-medium leading-[20px]">{item.title}</span>
                            <span className="text-[13px] text-[rgba(232,232,232,0.4)] leading-[18px]">{item.desc}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                  <div ref={commentsEndRef} />
                </div>

                {/* Fixed Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.85, duration: 0.3 }}
                  className="shrink-0 px-[33px] py-[20px] border-t border-[rgba(232,232,232,0.06)] flex justify-between items-center"
                >
                  <button 
                    onClick={() => setShowDeleteProjectConfirm(true)}
                    className="content-stretch flex h-[36px] items-center justify-center px-[17px] py-[7px] relative rounded-full shrink-0 bg-[rgba(255,59,48,0.06)] opacity-80 hover:opacity-100 transition-all cursor-pointer"
                  >
                    <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#ff3b30] text-[14px] text-center whitespace-nowrap">
                      <p className="leading-[20px]">Delete project</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-[10px]">
                    {canApproveReviewProject && (
                      <button
                        onClick={handleApproveReview}
                        disabled={isApprovingReview}
                        className="h-[36px] px-[20px] bg-[#e8e8e8] hover:bg-white disabled:bg-[#e8e8e8]/50 disabled:text-[#131314]/50 disabled:cursor-not-allowed text-[#131314] rounded-full text-[14px] font-medium transition-all cursor-pointer"
                      >
                        {isApprovingReview ? "Approving..." : "Approve"}
                      </button>
                    )}
                    <button
                      onClick={handleCancel}
                      className={`h-[36px] px-[20px] rounded-full text-[14px] font-medium transition-all cursor-pointer ${
                        canApproveReviewProject
                          ? "border border-[rgba(232,232,232,0.2)] text-[#e8e8e8] hover:bg-white/5"
                          : "bg-[#e8e8e8] hover:bg-white text-[#131314]"
                      }`}
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Footer Buttons (Common) */}
            {step !== 4 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className={`w-full flex items-center ${step === 1 ? 'pt-[24px]' : 'pt-[24px]'}`}
              >
                {step > 1 && (
                  <button 
                    onClick={() => setStep(step - 1)}
                    className="backdrop-blur-[6px] content-stretch flex h-[36px] items-center justify-center px-[17px] py-[7px] relative rounded-full shrink-0 border border-[rgba(232,232,232,0.1)] hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[14px] text-center whitespace-nowrap">
                      <p className="leading-[20px]">Previous</p>
                    </div>
                  </button>
                )}

                <div className="flex gap-[16px] ml-auto">
                  {editProjectId && (
                    <button 
                      onClick={handleDeleteDraft}
                      className="content-stretch flex h-[36px] items-center justify-center px-[17px] py-[7px] relative rounded-full shrink-0 bg-[rgba(255,59,48,0.06)] opacity-80 hover:opacity-100 transition-all cursor-pointer"
                    >
                      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#ff3b30] text-[14px] text-center whitespace-nowrap">
                        <p className="leading-[20px]">Delete draft</p>
                      </div>
                    </button>
                  )}

                  <button 
                    onClick={handleNext}
                    disabled={isNextDisabled}
                    className={`
                      content-stretch flex h-[36px] items-center justify-center px-[17px] py-[7px] relative rounded-full shrink-0 transition-all cursor-pointer
                      ${isNextDisabled ? "bg-[#e8e8e8]/50 cursor-not-allowed text-[#131314]/50" : "bg-[#e8e8e8] hover:bg-white text-[#131314]"}
                    `}
                  >
                    <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center whitespace-nowrap">
                      <p className="leading-[20px]">{step === 3 ? (editProjectId ? "Update & submit" : "Review & submit") : "Next"}</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>

      {/* Close Confirmation Dialog */}
      <AnimatePresence>
        {showCloseConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
            onClick={() => setShowCloseConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-[#1e1f20] rounded-[24px] p-[24px] w-full max-w-[340px] shadow-[0px_12px_40px_0px_rgba(0,0,0,0.3)] border border-[rgba(232,232,232,0.06)]"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[15px] text-[#e8e8e8] font-medium mb-[6px]">
                {editProjectId ? "Save your progress?" : "Save as draft?"}
              </p>
              <p className="text-[13.5px] text-[rgba(232,232,232,0.5)] mb-[24px] leading-[19px]">
                {editProjectId 
                  ? "Would you like to save your changes before closing?" 
                  : "You can continue where you left off later."}
              </p>
              <div className="flex gap-[10px] justify-end">
                <button
                  onClick={handleConfirmCancel}
                  className="h-[36px] px-[17px] rounded-full border border-[rgba(232,232,232,0.1)] text-[14px] font-medium text-[#e8e8e8] hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSave}
                  className="h-[36px] px-[17px] rounded-full bg-[#e8e8e8] hover:bg-white text-[#131314] text-[14px] font-medium transition-all cursor-pointer"
                >
                  {editProjectId ? "Save progress" : "Save draft"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Draft Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-[#1e1f20] rounded-[24px] p-[24px] w-full max-w-[340px] shadow-[0px_12px_40px_0px_rgba(0,0,0,0.3)] border border-[rgba(232,232,232,0.06)]"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[15px] text-[#e8e8e8] font-medium mb-[6px]">
                Delete this draft?
              </p>
              <p className="text-[13.5px] text-[rgba(232,232,232,0.5)] mb-[24px] leading-[19px]">
                This action cannot be undone. The draft and all its progress will be permanently removed.
              </p>
              <div className="flex gap-[10px] justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-[36px] px-[17px] rounded-full border border-[rgba(232,232,232,0.1)] text-[14px] font-medium text-[#e8e8e8] hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="h-[36px] px-[17px] rounded-full bg-[rgba(255,59,48,0.12)] hover:bg-[rgba(255,59,48,0.2)] text-[#ff3b30] text-[14px] font-medium transition-all cursor-pointer"
                >
                  Delete draft
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Project Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteProjectConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
            onClick={() => setShowDeleteProjectConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-[#1e1f20] rounded-[24px] p-[24px] w-full max-w-[340px] shadow-[0px_12px_40px_0px_rgba(0,0,0,0.3)] border border-[rgba(232,232,232,0.06)]"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[15px] text-[#e8e8e8] font-medium mb-[6px]">
                Delete this project?
              </p>
              <p className="text-[13.5px] text-[rgba(232,232,232,0.5)] mb-[24px] leading-[19px]">
                This action cannot be undone. The project and all its data will be permanently removed.
              </p>
              <div className="flex gap-[10px] justify-end">
                <button
                  onClick={() => setShowDeleteProjectConfirm(false)}
                  className="h-[36px] px-[17px] rounded-full border border-[rgba(232,232,232,0.1)] text-[14px] font-medium text-[#e8e8e8] hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteProject}
                  className="h-[36px] px-[17px] rounded-full bg-[rgba(255,59,48,0.12)] hover:bg-[rgba(255,59,48,0.2)] text-[#ff3b30] text-[14px] font-medium transition-all cursor-pointer"
                >
                  Delete project
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
