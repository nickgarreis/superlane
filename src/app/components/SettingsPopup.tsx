import React, { useState, useEffect } from "react";
import { X, User, Bell, Users, CreditCard, Check, Plus, Download, ChevronRight, ChevronDown, Building2, Upload } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import imgAvatar from "figma:asset/fea98b130b1d6a04ebf9c88afab5cd53fbd3e447.png";
import { Workspace } from "../types";
import svgPaths from "../../imports/svg-0erue6fqwq";
import DeleteButton from "../../imports/DeleteButton";

// Brand asset imports
import imgFile1 from "figma:asset/86b9c3843ae4733f84c25f8c5003a47372346c7b.png";
import imgFile2 from "figma:asset/ed2300ecc7d7f37175475469dd895c1a9c7a47a7.png";
import imgFile3 from "figma:asset/a6d8d90aa9a345c6a0a0841855776fa6f038f822.png";
import imgFile4 from "figma:asset/6ec5d42097faff5a5e15a92d842d637a67eb0f04.png";
import imgFile5 from "figma:asset/13b4fb46cd2c4b965c5823ea01fe2f6c7842b7bd.png";

const BRAND_FILES = [
  { id: 1, name: "Logo - Primary", type: "SVG", date: "3. Okt. 2025, 10:25", img: imgFile1 },
  { id: 2, name: "Logo - White", type: "SVG", date: "3. Okt. 2025, 10:25", img: imgFile2 },
  { id: 3, name: "Font - Roboto Bold", type: "TTF", date: "3. Okt. 2025, 10:25", img: imgFile3 },
  { id: 4, name: "Brand Guidelines", type: "PDF", date: "3. Okt. 2025, 10:25", img: imgFile4 },
  { id: 5, name: "Social Media Kit", type: "ZIP", date: "3. Okt. 2025, 10:25", img: imgFile5 },
];

type SettingsTab = "Account" | "Notifications" | "Company" | "Billing";

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
  activeWorkspace?: Workspace;
  onUpdateWorkspace?: (id: string, data: Partial<Workspace>) => void;
}

export function SettingsPopup({ isOpen, onClose, initialTab = "Account", activeWorkspace, onUpdateWorkspace }: SettingsPopupProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full max-w-[960px] h-[640px] bg-[#141515] border border-white/10 rounded-[24px] shadow-2xl flex overflow-hidden font-['Roboto',sans-serif] text-[#E8E8E8]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Sidebar */}
        <div className="w-[240px] flex flex-col py-6 px-4 shrink-0 bg-[#141515]">
          <div className="px-2 mb-6 mt-2">
             <span className="text-[18px] font-medium text-[#E8E8E8]">Settings</span>
          </div>
          
          <div className="flex flex-col gap-1">
            {[
              { id: "Account", icon: User, label: "My Account" },
              { id: "Notifications", icon: Bell, label: "Notifications" },
              { id: "Company", icon: Building2, label: "Company" },
              { id: "Billing", icon: CreditCard, label: "Billing & Plans" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as SettingsTab)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all group outline-none cursor-pointer",
                  activeTab === item.id
                    ? "bg-white/10 text-[#E8E8E8]"
                    : "text-[#E8E8E8]/60 hover:text-[#E8E8E8] hover:bg-white/5"
                )}
              >
                <item.icon 
                  size={16} 
                  strokeWidth={2}
                  className={cn(
                    "transition-colors",
                    activeTab === item.id ? "text-[#E8E8E8]" : "text-[#E8E8E8]/60 group-hover:text-[#E8E8E8]"
                  )}
                />
                <span>{item.label}</span>
                {activeTab === item.id && (
                    <motion.div 
                        layoutId="activeTabIndicator"
                        className="ml-auto w-1 h-1 rounded-full bg-white" 
                        transition={{ duration: 0.2 }}
                    />
                )}
              </button>
            ))}
          </div>

          <div className="mt-auto px-2">

          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#191A1A] m-2 rounded-[20px] border border-white/5 flex flex-col overflow-hidden relative">
          {/* Close Button absolute positioned */}
          <div className="absolute top-4 right-4 z-10">
             <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors outline-none cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
             <div className="max-w-[640px] mx-auto py-12 px-8">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="mb-8">
                            <h2 className="text-[24px] font-medium text-[#E8E8E8] mb-2">{
                                activeTab === "Account" ? "My Account" : 
                                activeTab === "Notifications" ? "Notifications" :
                                activeTab === "Company" ? "Company" : "Billing & Plans"
                            }</h2>
                            <p className="text-[14px] text-[#E8E8E8]/60">
                                {activeTab === "Account" && "Manage your personal profile and preferences."}
                                {activeTab === "Notifications" && "Choose what you want to be notified about."}
                                {activeTab === "Company" && "Manage your company settings and members."}
                                {activeTab === "Billing" && "Manage your plan and billing details."}
                            </p>
                        </div>

                        {activeTab === "Account" && <AccountSettings />}
                        {activeTab === "Notifications" && <NotificationSettings />}
                        {activeTab === "Company" && <WorkspaceSettings workspace={activeWorkspace} onUpdate={onUpdateWorkspace} />}
                        {activeTab === "Billing" && <BillingSettings />}
                    </motion.div>
                 </AnimatePresence>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountSettings() {
  const [profileImage, setProfileImage] = useState<string | null>(imgAvatar);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      toast.success("Profile picture updated");
    }
  };

  const handleRemove = () => {
    setProfileImage(null);
    toast.success("Profile picture removed");
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start gap-6 pb-8 border-b border-white/5">
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/png, image/jpeg, image/gif" 
            onChange={handleFileChange}
        />
        <div 
            className="w-[100px] h-[100px] rounded-full overflow-hidden border border-white/10 shrink-0 group relative cursor-pointer bg-[#2A2A2C]"
            onClick={handleUploadClick}
        >
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#E8E8E8]/40">
                <User size={48} />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[12px] font-medium text-white">Change</span>
          </div>
        </div>
        <div className="flex flex-col pt-2 gap-3">
          <h3 className="text-[16px] font-medium text-[#E8E8E8]">Profile Picture</h3>
          <div className="flex gap-3">
              <button 
                onClick={handleUploadClick}
                className="cursor-pointer px-4 py-2 bg-[#E8E8E8] text-[#141515] rounded-full text-[13px] font-medium hover:bg-white transition-colors"
              >
                Upload new
              </button>
              <button 
                onClick={handleRemove}
                disabled={!profileImage}
                className="cursor-pointer px-4 py-2 bg-white/5 text-[#E8E8E8] border border-white/10 rounded-full text-[13px] font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Remove
              </button>
          </div>
          <p className="text-[13px] text-[#E8E8E8]/40 max-w-[300px]">
            We support JPG, PNG and GIF files. Max file size is 2MB.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-[#E8E8E8]/80">First Name</label>
            <input 
                type="text" 
                defaultValue="Nick"
                className="w-full bg-transparent border-b border-white/10 rounded-none px-0 py-2 text-[14px] text-[#E8E8E8] focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20"
            />
            </div>
            <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-[#E8E8E8]/80">Last Name</label>
            <input 
                type="text" 
                defaultValue="Garreis"
                className="w-full bg-transparent border-b border-white/10 rounded-none px-0 py-2 text-[14px] text-[#E8E8E8] focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20"
            />
            </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-medium text-[#E8E8E8]/80">Email Address</label>
          <input 
            type="email" 
            defaultValue="nick@example.com"
            className="w-full bg-transparent border-b border-white/10 rounded-none px-0 py-2 text-[14px] text-[#E8E8E8] focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20"
          />
        </div>
        

      </div>

      <div className="pt-6 flex justify-end">
        <button className="cursor-pointer px-6 py-2.5 bg-[#E8E8E8] hover:bg-white text-[#141515] rounded-full text-[14px] font-medium transition-colors shadow-lg shadow-white/5">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const Toggle = ({ label, description, defaultChecked }: { label: string, description: string, defaultChecked?: boolean }) => {
    const [checked, setChecked] = useState(defaultChecked);
    return (
      <div className="flex items-start justify-between py-5 border-b border-white/5 last:border-0 group">
        <div className="flex flex-col gap-1 pr-8">
          <span className="text-[14px] font-medium text-[#E8E8E8]/90 group-hover:text-white transition-colors">{label}</span>
          <span className="text-[13px] text-[#E8E8E8]/50">{description}</span>
        </div>
        <button 
          onClick={() => setChecked(!checked)}
          className={cn(
            "w-[44px] h-[24px] rounded-full relative transition-colors shrink-0 cursor-pointer",
            checked ? 'bg-[#10b981]' : 'bg-white/10'
          )}
        >
          <motion.div 
            className={cn(
                "absolute top-[2px] w-[20px] h-[20px] rounded-full shadow-sm transition-all",
                checked ? 'bg-white left-[22px]' : 'bg-[#E8E8E8] left-[2px]'
            )}
            layout
            transition={{ type: "spring", stiffness: 700, damping: 30 }}
          />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
          <Bell className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
              <span className="text-[14px] font-medium text-blue-100">Push Notifications</span>
              <p className="text-[13px] text-blue-200/60 leading-relaxed">
                  Enable push notifications to get real-time updates about your projects and team activities directly in your browser.
              </p>
              <button className="text-[13px] font-medium text-blue-400 hover:text-blue-300 self-start mt-1 cursor-pointer">Enable now</button>
          </div>
      </div>
      
      <Toggle 
        label="Email Notifications" 
        description="Receive emails about your account activity and security."
        defaultChecked={true}
      />
      <Toggle 
        label="Desktop Notifications" 
        description="Get push notifications in your browser for new messages."
        defaultChecked={false}
      />
      <Toggle 
        label="Product Updates" 
        description="Receive the latest news and updates about features."
        defaultChecked={true}
      />
      <Toggle 
        label="Team Activity" 
        description="Get notified when team members comment or upload files."
        defaultChecked={true}
      />
    </div>
  );
}

function BrandAssetsSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "name">("relevance");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [files, setFiles] = useState<any[]>([...BRAND_FILES]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newFile = {
      id: Date.now(),
      name: file.name,
      type: file.name.split('.').pop()?.toUpperCase() || "FILE",
      date: new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' }) + ", " + new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      img: imgFile4
    };

    setFiles(prev => [newFile, ...prev]);
    toast.success(`Successfully uploaded ${file.name}`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles(prev => prev.filter(f => f.id !== id));
    toast.success("File removed");
  };

  const filteredFiles = files
    .filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-[16px] font-medium text-[#E8E8E8]">Brand Assets</h3>
        <p className="text-[13px] text-[#E8E8E8]/40">Manage your brand files and assets.</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between z-10 relative">
        <div className="relative h-[36px] flex-1 max-w-[280px]">
          <div className="absolute inset-0 rounded-[18px] border border-[rgba(232,232,232,0.15)] pointer-events-none" />
          <div className="flex items-center h-full px-3">
            <div className="w-4 h-4 shrink-0 mr-2 opacity-40">
              <svg className="w-full h-full" viewBox="0 0 16 16" fill="none">
                <path d={svgPaths.p3f80a980} fill="#E8E8E8" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search assets"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-[13.9px] text-[#E8E8E8] placeholder:text-[rgba(232,232,232,0.4)] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-1 pl-[9px] pr-[13px] py-[7.75px] bg-[#E8E8E8] rounded-full hover:bg-white transition-colors cursor-pointer"
          >
            <div className="w-4 h-4 shrink-0">
              <svg className="w-full h-full" viewBox="0 0 16 16" fill="none">
                <path d={svgPaths.p34261000} fill="black" fillOpacity="0.667" />
              </svg>
            </div>
            <span className="text-[13px] font-medium text-[#141415] leading-[19.5px]">
              Upload asset
            </span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 text-[14px] font-medium text-[rgba(232,232,232,0.6)] hover:text-[#E8E8E8] transition-colors cursor-pointer"
            >
              {sortBy === "relevance" ? "Relevance" : "Name (A-Z)"}
              <div className="w-4 h-4 shrink-0">
                <svg className="w-full h-full" viewBox="0 0 16 16" fill="none">
                  <path d={svgPaths.p7659d00} fill="#E8E8E8" fillOpacity="0.8" />
                </svg>
              </div>
            </button>

            {isSortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-40 bg-[#1A1A1C] border border-[#262626] rounded-xl shadow-xl overflow-hidden py-1 z-20">
                  <button
                    onClick={() => { setSortBy("relevance"); setIsSortOpen(false); }}
                    className={cn(
                      "w-full px-4 py-2 text-left text-[13px] hover:bg-white/5 transition-colors cursor-pointer",
                      sortBy === "relevance" ? "text-white font-medium" : "text-white/60"
                    )}
                  >
                    Relevance
                  </button>
                  <button
                    onClick={() => { setSortBy("name"); setIsSortOpen(false); }}
                    className={cn(
                      "w-full px-4 py-2 text-left text-[13px] hover:bg-white/5 transition-colors cursor-pointer",
                      sortBy === "name" ? "text-white font-medium" : "text-white/60"
                    )}
                  >
                    Name (A-Z)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {filteredFiles.map((file) => (
            <motion.div
              key={file.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5 relative"
            >
              <div className="w-10 h-12 shrink-0 bg-white rounded flex items-center justify-center overflow-hidden shadow-sm relative">
                <img src={file.img} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white group-hover:text-white transition-colors mb-0.5">{file.name}</h3>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span className="uppercase">{file.type}</span>
                  <span>•</span>
                  <span>{file.date}</span>
                </div>
              </div>

              {/* Remove Button */}
              <div
                className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 top-1/2 -translate-y-1/2 w-[88px] h-[34px]"
                onClick={(e) => handleRemoveFile(file.id, e)}
              >
                <DeleteButton />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-white/40">
            <p className="text-sm">No files found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

function WorkspaceSettings({ workspace, onUpdate }: { workspace?: Workspace, onUpdate?: (id: string, data: Partial<Workspace>) => void }) {
  const [members, setMembers] = useState([
    { name: "Nick Garreis", email: "nick@example.com", role: "Owner", img: imgAvatar, status: "Active" },
    { name: "Sarah Smith", email: "sarah@example.com", role: "Editor", img: null, status: "Active" },
    { name: "Mike Johnson", email: "mike@example.com", role: "Viewer", img: null, status: "Active" },
  ]);

  const [workspaceName, setWorkspaceName] = useState(workspace?.name || "My Workspace");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Viewer");
  const [isInviteRoleOpen, setIsInviteRoleOpen] = useState(false);
  const [openRoleDropdownId, setOpenRoleDropdownId] = useState<number | null>(null);

  useEffect(() => {
    if (workspace) {
        setWorkspaceName(workspace.name);
    }
  }, [workspace]);

  const handleNameBlur = () => {
    if (workspace && onUpdate && workspaceName !== workspace.name) {
        onUpdate(workspace.id, { name: workspaceName });
    }
  };

  const handleInvite = () => {
    if (!inviteEmail) return;
    
    // Simulate API call
    setTimeout(() => {
      setMembers([...members, {
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        img: null,
        status: "Pending"
      }]);
      setInviteEmail("");
      setInviteRole("Viewer");
      toast.success(`Invitation sent to ${inviteEmail}`);
    }, 500);
  };

  const handleRoleUpdate = (index: number, newRole: string) => {
      const updatedMembers = [...members];
      updatedMembers[index].role = newRole;
      setMembers(updatedMembers);
      setOpenRoleDropdownId(null);
  };

  const bgStyle = workspace?.logoColor && !workspace.logoColor.includes('-') 
      ? { backgroundColor: workspace.logoColor } 
      : undefined;
  const bgClass = workspace?.logoColor && workspace.logoColor.includes('-')
      ? `bg-${workspace.logoColor}`
      : "bg-blue-600";

  return (
    <div className="flex flex-col gap-10">
      {/* Workspace General Settings */}
      <div className="flex flex-col gap-6">
        <h3 className="text-[16px] font-medium text-[#E8E8E8]">General</h3>
        
        <div className="flex items-start gap-6">
            <div 
                className={cn("w-[80px] h-[80px] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-inner shrink-0 border border-white/10 relative group cursor-pointer overflow-hidden", !bgStyle && bgClass)}
                style={bgStyle}
            >
                {workspace?.logo ? (
                     <img src={workspace.logo} alt={workspace.name} className="w-full h-full object-cover" />
                ) : (
                     workspaceName.charAt(0)
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-medium text-white">Change</span>
                </div>
            </div>
             <div className="flex flex-col gap-4 flex-1 max-w-[400px]">
                <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-[#E8E8E8]/60">Workspace Name</label>
                    <input 
                        type="text" 
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        onBlur={handleNameBlur}
                        className="w-full bg-transparent border-b border-white/10 rounded-none px-0 py-2 text-[14px] text-[#E8E8E8] focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20"
                    />
                </div>

             </div>
         </div>
      </div>

      <div className="w-full h-px bg-white/5" />

      {/* Members Section */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
            <h3 className="text-[16px] font-medium text-[#E8E8E8]">Members</h3>
            <p className="text-[13px] text-[#E8E8E8]/40">Manage who has access to this workspace.</p>
        </div>

        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 pb-2">
                <h4 className="text-[13px] font-medium text-[#E8E8E8]/60 uppercase tracking-wider">Invite Team Members</h4>
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <input 
                            type="email" 
                            placeholder="Email address"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="w-full bg-transparent border-b border-white/10 rounded-none px-0 py-2.5 text-[14px] text-[#E8E8E8] focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20"
                        />
                    </div>
                    <div className="relative">
                        {isInviteRoleOpen && (
                            <div className="fixed inset-0 z-10" onClick={() => setIsInviteRoleOpen(false)} />
                        )}
                        <button 
                            onClick={() => setIsInviteRoleOpen(!isInviteRoleOpen)}
                            className="h-[42px] px-3 bg-transparent border-b border-white/10 rounded-none text-[13px] font-medium text-[#E8E8E8] flex items-center gap-2 hover:border-white/40 transition-colors min-w-[100px] justify-between relative z-20 cursor-pointer"
                        >
                            {inviteRole}
                            <ChevronDown size={14} className="text-white/40" />
                        </button>
                        
                        {isInviteRoleOpen && (
                            <div className="absolute right-0 top-full mt-1 w-[120px] bg-[#1A1A1C] border border-[#262626] rounded-lg shadow-xl overflow-hidden py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                                {["Viewer", "Editor", "Owner"].map(role => (
                                    <div 
                                        key={role} 
                                        onClick={() => {
                                            setInviteRole(role);
                                            setIsInviteRoleOpen(false);
                                        }}
                                        className="px-3 py-2 text-[13px] hover:bg-white/5 cursor-pointer text-[#E8E8E8]"
                                    >
                                        {role}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={handleInvite}
                        disabled={!inviteEmail}
                        className="h-[42px] px-5 bg-[#E8E8E8] text-[#141515] hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-[13px] font-medium transition-colors cursor-pointer"
                    >
                        Invite
                    </button>
                </div>
            </div>

            <div className="flex flex-col">
                <h4 className="text-[13px] font-medium text-[#E8E8E8]/60 uppercase tracking-wider mb-4">Members ({members.length})</h4>
                <div className="flex flex-col">
                    {members.map((member, i) => (
                    <div key={i} className={cn(
                        "flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors relative",
                        openRoleDropdownId === i ? "z-20" : "z-0"
                    )}>
                        <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-[12px] font-medium text-white overflow-hidden shadow-inner">
                            {member.img ? <img src={member.img} className="w-full h-full object-cover" /> : member.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-[14px] font-medium text-[#E8E8E8]">{member.name}</span>
                                {member.status === "Pending" && (
                                    <span className="text-[10px] font-medium text-[#58AFFF] bg-[#58AFFF]/10 px-1.5 py-0.5 rounded border border-[#58AFFF]/20">Pending</span>
                                )}
                            </div>
                            <span className="text-[12px] text-[#E8E8E8]/40">{member.email}</span>
                        </div>
                        </div>
                        <div className="flex items-center gap-4">
                        
                        {member.role === "Owner" ? (
                            <div className="px-3 py-1 text-[13px] font-medium text-[#E8E8E8]/60 cursor-default">
                                Owner
                            </div>
                        ) : (
                            <div className="relative">
                                {openRoleDropdownId === i && (
                                    <div className="fixed inset-0 z-10" onClick={() => setOpenRoleDropdownId(null)} />
                                )}
                                <button 
                                    onClick={() => setOpenRoleDropdownId(openRoleDropdownId === i ? null : i)}
                                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[12px] text-[#E8E8E8]/80 hover:bg-white/10 hover:text-white transition-colors relative z-20 cursor-pointer"
                                >
                                    {member.role}
                                    <ChevronDown size={12} className="opacity-50" />
                                </button>
                                
                                {openRoleDropdownId === i && (
                                    <div className="absolute right-0 top-full mt-1 w-[120px] bg-[#1A1A1C] border border-[#262626] rounded-lg shadow-xl overflow-hidden py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                                        {["Viewer", "Editor"].map(role => (
                                            <div 
                                                key={role} 
                                                onClick={() => handleRoleUpdate(i, role)}
                                                className={cn(
                                                    "px-3 py-2 text-[13px] hover:bg-white/5 cursor-pointer flex items-center justify-between",
                                                    member.role === role ? "text-white bg-white/5" : "text-[#E8E8E8]"
                                                )}
                                            >
                                                {role}
                                                {member.role === role && <Check size={12} />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {member.role !== "Owner" && (
                            <button className="text-[12px] text-red-400/80 hover:text-red-400 transition-colors font-medium cursor-pointer">Remove</button>
                        )}
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

       <div className="w-full h-px bg-white/5" />

       {/* Brand Assets */}
       <BrandAssetsSection />

       <div className="w-full h-px bg-white/5" />

       {/* Danger Zone */}
       <div className="flex flex-col gap-4">
            <h3 className="text-[16px] font-medium text-red-400">Danger Zone</h3>
            <div className="flex items-center justify-between p-4 border border-red-500/10 rounded-xl bg-red-500/[0.02]">
                <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-medium text-[#E8E8E8]">Delete Workspace</span>
                    <span className="text-[12px] text-[#E8E8E8]/50">Permanently delete this workspace and all of its data.</span>
                </div>
                <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-[13px] font-medium transition-colors cursor-pointer">
                    Delete Workspace
                </button>
            </div>
       </div>

    </div>
  );
}

function BillingSettings() {
  return (
    <div className="flex flex-col gap-8">


      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h4 className="text-[14px] font-medium text-[#E8E8E8]">Payment Method</h4>
            <button className="text-[13px] text-[#E8E8E8]/60 hover:text-[#E8E8E8] flex items-center gap-1 transition-colors cursor-pointer">
                <Plus size={14} /> Add new
            </button>
        </div>
        
        <div className="flex items-center gap-4 py-4 border-b border-white/5 group hover:border-white/20 transition-colors cursor-pointer">
          <div className="w-12 h-8 bg-[#2A2A2C] rounded border border-white/10 flex items-center justify-center shrink-0">
             <div className="w-7 h-5 bg-white/90 rounded-[3px] relative overflow-hidden">
                 <div className="absolute top-1.5 left-0 w-full h-1 bg-black/20" />
             </div>
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-[14px] font-medium text-[#E8E8E8]">Visa ending in 4242</span>
            <span className="text-[12px] text-[#E8E8E8]/50">Expires 12/28</span>
          </div>
          <div className="flex items-center gap-3">
             <span className="px-2 py-0.5 rounded bg-white/10 text-[11px] text-white/60">Default</span>
             <button className="p-2 text-white/40 hover:text-white transition-colors cursor-pointer">
                <ChevronRight size={16} />
             </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h4 className="text-[14px] font-medium text-[#E8E8E8]">Billing History</h4>
            <button className="text-[13px] text-[#E8E8E8]/60 hover:text-[#E8E8E8] transition-colors cursor-pointer">Download all</button>
        </div>
        
        <div className="flex flex-col">
           {[1, 2, 3].map((i) => (
             <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
               <div className="flex flex-col gap-0.5">
                 <span className="text-[14px] font-medium text-[#E8E8E8]/90">Invoice #2024-00{i}</span>
                 <span className="text-[12px] text-[#E8E8E8]/50">Oct {i}, 2025 • Pro Plan</span>
               </div>
               <div className="flex items-center gap-6">
                 <span className="text-[13px] font-medium text-[#E8E8E8]">$29.00</span>
                 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-[11px] font-medium border border-green-500/20">Paid</span>
                     <button className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors cursor-pointer">
                        <Download size={14} />
                     </button>
                 </div>
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}