import React, { useState } from 'react';
import { Layers, Check } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import { AdminImageUpload } from '../components/AdminImageUpload';
import type { FooterConfig } from '../types';

export const FooterManager: React.FC = () => {
  const { config, updateFooter } = useAdminConfig();
  const [formData, setFormData] = useState<FooterConfig>(config.footer);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdateField = (keyofFooter: keyof FooterConfig, value: any) => {
    // Wait, let's keep name handleUpdateField signature but fix typescript if needed:
    const updated = { ...formData, [keyofFooter]: value };
    setFormData(updated);
    updateFooter({ [keyofFooter]: value });
    notifySaved();
  };

  const handleUpdateSocial = (platform: string, url: string) => {
    const updatedSocials = { ...formData.socialLinks, [platform]: url };
    handleUpdateField('socialLinks', updatedSocials);
  };

  const handleUpdateCompanyLink = (index: number, label: string, url: string) => {
    const copy = [...formData.companyLinks];
    copy[index] = { ...copy[index], label, url };
    handleUpdateField('companyLinks', copy);
  };

  const handleUpdateHelpLink = (index: number, label: string, url: string) => {
    const copy = [...formData.helpLinks];
    copy[index] = { ...copy[index], label, url };
    handleUpdateField('helpLinks', copy);
  };

  const notifySaved = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Storefront Base</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Footer Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure store bio, social media handles, Company &amp; Help links, app store links, and copyright text.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              updateFooter(formData);
              notifySaved();
            }}
            className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Save &amp; Publish</span>
          </button>
        </div>
      </div>

      {/* Live Saved Notification Banner */}
      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 shadow-2xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>✓ Footer Changes Saved &amp; Live on the Main Storefront!</span>
        </div>
      )}

      {/* Brand Bio & Copyright */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          1. Brand Information &amp; Copyright
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Footer Bio Description</label>
            <textarea
              rows={2}
              value={formData.bioText}
              onChange={(e) => handleUpdateField('bioText', e.target.value)}
              className="w-full p-3 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Copyright Notice</label>
            <input
              type="text"
              value={formData.copyrightText}
              onChange={(e) => handleUpdateField('copyrightText', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <AdminImageUpload
              value={formData.logoUrl}
              onChange={(val) => handleUpdateField('logoUrl', val)}
              label="Footer Logo Image"
              aspectRatio="auto"
              recommendedDimensions="400 × 120 px (Transparent PNG)"
            />
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          2. Social Media URLs
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Instagram URL</label>
            <input
              type="text"
              value={formData.socialLinks.instagram}
              onChange={(e) => handleUpdateSocial('instagram', e.target.value)}
              className="w-full h-9 px-3 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Facebook URL</label>
            <input
              type="text"
              value={formData.socialLinks.facebook}
              onChange={(e) => handleUpdateSocial('facebook', e.target.value)}
              className="w-full h-9 px-3 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Twitter URL</label>
            <input
              type="text"
              value={formData.socialLinks.twitter}
              onChange={(e) => handleUpdateSocial('twitter', e.target.value)}
              className="w-full h-9 px-3 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">YouTube URL</label>
            <input
              type="text"
              value={formData.socialLinks.youtube}
              onChange={(e) => handleUpdateSocial('youtube', e.target.value)}
              className="w-full h-9 px-3 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Navigation Columns (Company & Help) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Links */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            3. Company Column Links
          </h2>
          <div className="space-y-3">
            {(formData.companyLinks || []).map((link, idx) => (
              <div key={link.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => handleUpdateCompanyLink(idx, e.target.value, link.url)}
                  className="w-1/2 h-9 px-3 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl"
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => handleUpdateCompanyLink(idx, link.label, e.target.value)}
                  className="w-1/2 h-9 px-3 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Help Links */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            4. Help Column Links
          </h2>
          <div className="space-y-3">
            {(formData.helpLinks || []).map((link, idx) => (
              <div key={link.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => handleUpdateHelpLink(idx, e.target.value, link.url)}
                  className="w-1/2 h-9 px-3 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl"
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => handleUpdateHelpLink(idx, link.label, e.target.value)}
                  className="w-1/2 h-9 px-3 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Changes Bottom Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-500 font-medium">
          Changes saved here are instantly published and visible on the main website footer.
        </p>
        <button
          onClick={() => {
            updateFooter(formData);
            notifySaved();
          }}
          className="w-full sm:w-auto px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
        >
          <Check className="w-4 h-4" />
          <span>Save &amp; Publish Footer Changes</span>
        </button>
      </div>
    </div>
  );
};
