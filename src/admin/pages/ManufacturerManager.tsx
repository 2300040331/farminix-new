import React, { useState } from 'react';
import {
  Factory,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  X,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import { defaultManufacturerConfig } from '../defaultConfig';
import type {
  ManufacturerConfig,
  ManufacturerFacility,
  ManufacturerProcessStep,
  ManufacturerCertification,
} from '../types';

export const ManufacturerManager: React.FC = () => {
  const { config, updateManufacturer } = useAdminConfig();
  const initialData: ManufacturerConfig = config.manufacturer || defaultManufacturerConfig;

  const [formData, setFormData] = useState<ManufacturerConfig>(initialData);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modal states for Facility
  const [facilityModalOpen, setFacilityModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<ManufacturerFacility | null>(null);
  const [facilityForm, setFacilityForm] = useState<ManufacturerFacility>({
    id: '',
    name: '',
    location: '',
    type: 'Multi-Stage Optical Sortex Milling & Packaging Plant',
    capacity: '150 Metric Tons / Day',
    status: 'Active & Operational',
    fssaiNumber: '20126142000933',
    enabled: true,
  });

  // Modal states for Process Step
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<ManufacturerProcessStep | null>(null);
  const [stepForm, setStepForm] = useState<ManufacturerProcessStep>({
    id: '',
    step: '01',
    title: '',
    desc: '',
    enabled: true,
  });

  // Modal states for Certification
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<ManufacturerCertification | null>(null);
  const [certForm, setCertForm] = useState<ManufacturerCertification>({
    id: '',
    title: '',
    authority: '',
    number: '',
    status: '100% Verified',
    enabled: true,
  });

  const handleSave = (dataToSave = formData) => {
    updateManufacturer(dataToSave);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Facility handlers
  const handleOpenAddFacility = () => {
    setEditingFacility(null);
    setFacilityForm({
      id: `fac-${Date.now()}`,
      name: '',
      location: '',
      type: 'Multi-Stage Optical Sortex Milling & Packaging Plant',
      capacity: '150 Metric Tons / Day',
      status: 'Active & Operational',
      fssaiNumber: formData.fssaiNumber || '20126142000933',
      enabled: true,
    });
    setFacilityModalOpen(true);
  };

  const handleOpenEditFacility = (facility: ManufacturerFacility) => {
    setEditingFacility(facility);
    setFacilityForm({ ...facility });
    setFacilityModalOpen(true);
  };

  const handleSaveFacility = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedFacilities: ManufacturerFacility[];
    if (editingFacility) {
      updatedFacilities = formData.facilities.map((f) =>
        f.id === editingFacility.id ? facilityForm : f
      );
    } else {
      updatedFacilities = [...formData.facilities, facilityForm];
    }
    const updated = { ...formData, facilities: updatedFacilities };
    setFormData(updated);
    handleSave(updated);
    setFacilityModalOpen(false);
  };

  const handleDeleteFacility = (id: string) => {
    if (window.confirm('Are you sure you want to delete this manufacturing facility?')) {
      const updatedFacilities = formData.facilities.filter((f) => f.id !== id);
      const updated = { ...formData, facilities: updatedFacilities };
      setFormData(updated);
      handleSave(updated);
    }
  };

  const handleToggleFacility = (id: string) => {
    const updatedFacilities = formData.facilities.map((f) =>
      f.id === id ? { ...f, enabled: !f.enabled } : f
    );
    const updated = { ...formData, facilities: updatedFacilities };
    setFormData(updated);
    handleSave(updated);
  };

  // Step handlers
  const handleOpenAddStep = () => {
    setEditingStep(null);
    setStepForm({
      id: `step-${Date.now()}`,
      step: `0${formData.processSteps.length + 1}`,
      title: '',
      desc: '',
      enabled: true,
    });
    setStepModalOpen(true);
  };

  const handleOpenEditStep = (step: ManufacturerProcessStep) => {
    setEditingStep(step);
    setStepForm({ ...step });
    setStepModalOpen(true);
  };

  const handleSaveStep = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedSteps: ManufacturerProcessStep[];
    if (editingStep) {
      updatedSteps = formData.processSteps.map((s) =>
        s.id === editingStep.id ? stepForm : s
      );
    } else {
      updatedSteps = [...formData.processSteps, stepForm];
    }
    const updated = { ...formData, processSteps: updatedSteps };
    setFormData(updated);
    handleSave(updated);
    setStepModalOpen(false);
  };

  const handleDeleteStep = (id: string) => {
    if (window.confirm('Delete this process step?')) {
      const updatedSteps = formData.processSteps.filter((s) => s.id !== id);
      const updated = { ...formData, processSteps: updatedSteps };
      setFormData(updated);
      handleSave(updated);
    }
  };

  const handleToggleStep = (id: string) => {
    const updatedSteps = formData.processSteps.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    const updated = { ...formData, processSteps: updatedSteps };
    setFormData(updated);
    handleSave(updated);
  };

  // Certification handlers
  const handleOpenAddCert = () => {
    setEditingCert(null);
    setCertForm({
      id: `cert-${Date.now()}`,
      title: '',
      authority: '',
      number: '',
      status: '100% Verified',
      enabled: true,
    });
    setCertModalOpen(true);
  };

  const handleOpenEditCert = (cert: ManufacturerCertification) => {
    setEditingCert(cert);
    setCertForm({ ...cert });
    setCertModalOpen(true);
  };

  const handleSaveCert = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedCerts: ManufacturerCertification[];
    if (editingCert) {
      updatedCerts = formData.certifications.map((c) =>
        c.id === editingCert.id ? certForm : c
      );
    } else {
      updatedCerts = [...formData.certifications, certForm];
    }
    const updated = { ...formData, certifications: updatedCerts };
    setFormData(updated);
    handleSave(updated);
    setCertModalOpen(false);
  };

  const handleDeleteCert = (id: string) => {
    if (window.confirm('Delete this certification standard?')) {
      const updatedCerts = formData.certifications.filter((c) => c.id !== id);
      const updated = { ...formData, certifications: updatedCerts };
      setFormData(updated);
      handleSave(updated);
    }
  };

  const handleToggleCert = (id: string) => {
    const updatedCerts = formData.certifications.map((c) =>
      c.id === id ? { ...c, enabled: !c.enabled } : c
    );
    const updated = { ...formData, certifications: updatedCerts };
    setFormData(updated);
    handleSave(updated);
  };

  return (
    <div className="space-y-8 text-left pb-16">
      {/* ── TOP HEADER & SAVE BAR ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center font-bold">
              <Factory className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manufacturer Page Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure official corporate details, milling facilities, Sortex standards, FSSAI licenses, and public page display mode.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <a
            href="/manufacturer"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-purple-300 text-xs font-bold text-slate-700 hover:text-[#7C3AED] transition-colors flex items-center gap-1.5 bg-slate-50 hover:bg-white"
          >
            <span>Preview Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => handleSave()}
            className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Changes Saved &amp; Live!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Manufacturer configuration successfully saved! Changes are live on https://farminix.vercel.app/manufacturer</span>
        </div>
      )}

      {/* ── 1. PAGE DISPLAY MODE ── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>🚀 Page Display Mode</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose whether to present the full official manufacturing showcase or a "Coming Soon" teaser on <code className="text-purple-600 bg-purple-50 px-1 py-0.5 rounded">/manufacturer</code>.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.comingSoonMode}
              onChange={(e) => {
                const updated = { ...formData, comingSoonMode: e.target.checked };
                setFormData(updated);
                handleSave(updated);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7C3AED]"></div>
            <span className="ml-3 text-xs font-black text-slate-800">
              {formData.comingSoonMode ? 'Coming Soon Mode (Active)' : 'Full Live Showcase (Active)'}
            </span>
          </label>
        </div>

        {formData.comingSoonMode ? (
          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3">
            <div className="text-xs font-bold text-purple-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Coming Soon Teaser Settings</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">Badge Label</label>
                <input
                  type="text"
                  value={formData.comingSoonBadge}
                  onChange={(e) => setFormData({ ...formData, comingSoonBadge: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
                  placeholder="e.g. Coming Soon / Launching Shortly"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">Teaser Headline</label>
                <input
                  type="text"
                  value={formData.comingSoonTitle}
                  onChange={(e) => setFormData({ ...formData, comingSoonTitle: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
                  placeholder="e.g. Manufacturer"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Teaser Message</label>
                <textarea
                  rows={2}
                  value={formData.comingSoonText}
                  onChange={(e) => setFormData({ ...formData, comingSoonText: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#7C3AED] focus:outline-none"
                  placeholder="We're working on something exciting. This page will be available soon with all the details you need."
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Live Mode is active! Shoppers viewing <code className="bg-emerald-100 px-1 py-0.5 rounded">/manufacturer</code> see the full interactive manufacturing facilities, Sortex process, and FSSAI credentials below.</span>
          </div>
        )}
      </div>

      {/* ── 2. CORPORATE & REGULATORY DOSSIER ── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <span>🏛️ Corporate Entity &amp; FSSAI License</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official legal entity information, registered office address, and statutory food safety credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Company Name</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
              placeholder="Farminix Private Limited"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Page Header Title</label>
            <input
              type="text"
              value={formData.pageTitle}
              onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
              placeholder="Official Manufacturing & Processing Hub"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Tagline / Mission</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
              placeholder="Pure Grains. Direct From Soil to Soul."
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">FSSAI License Number</label>
            <input
              type="text"
              value={formData.fssaiNumber}
              onChange={(e) => setFormData({ ...formData, fssaiNumber: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none text-[#7C3AED]"
              placeholder="20126142000933"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">CIN / Reg Number</label>
            <input
              type="text"
              value={formData.cinOrRegNumber}
              onChange={(e) => setFormData({ ...formData, cinOrRegNumber: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
              placeholder="U01100AP2024PTC123456"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Registered Office Address</label>
            <input
              type="text"
              value={formData.registeredOffice}
              onChange={(e) => setFormData({ ...formData, registeredOffice: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
              placeholder="Flat No 302, Srinivasa Towers, Gorantla, Guntur – 522034, AP"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="text-[11px] font-bold text-slate-600 uppercase">About Farminix Manufacturing Narrative</label>
            <textarea
              rows={3}
              value={formData.aboutCorporate}
              onChange={(e) => setFormData({ ...formData, aboutCorporate: e.target.value })}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium leading-relaxed focus:border-[#7C3AED] focus:bg-white focus:outline-none"
              placeholder="Farminix bridges generational Andhra paddy farmers and your dining table..."
            />
          </div>
        </div>
      </div>

      {/* ── 3. MANUFACTURING & MILLING FACILITIES ── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>🏭 Processing &amp; Milling Units ({formData.facilities.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add, edit, hide or delete Sortex processing mills and paddy aggregation centers.
            </p>
          </div>

          <button
            onClick={handleOpenAddFacility}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Facility</span>
          </button>
        </div>

        <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-center gap-2 text-xs text-purple-900 font-bold">
          <HelpCircle className="w-4 h-4 text-[#7C3AED] shrink-0" />
          <span>Recommended facility photos: 800 × 500 px (16:10 aspect ratio, JPG or WebP).</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.facilities.map((fac) => (
            <div
              key={fac.id}
              className={`p-5 rounded-2xl border transition-all ${
                fac.enabled !== false
                  ? 'bg-slate-50/70 border-slate-200 hover:border-purple-300'
                  : 'bg-slate-100/60 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">{fac.name}</span>
                    {fac.enabled === false && (
                      <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-extrabold uppercase">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{fac.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleFacility(fac.id)}
                    title={fac.enabled !== false ? 'Hide Facility' : 'Show Facility'}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    {fac.enabled !== false ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                  </button>

                  <button
                    onClick={() => handleOpenEditFacility(fac)}
                    title="Edit Facility"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#7C3AED] hover:bg-purple-100 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteFacility(fac.id)}
                    title="Delete Facility"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-600 font-medium mt-2 space-y-1 bg-white p-3 rounded-xl border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Type:</span>
                  <span className="font-extrabold text-slate-800 text-right">{fac.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Capacity:</span>
                  <span className="font-extrabold text-[#7C3AED] text-right">{fac.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">FSSAI Lic:</span>
                  <span className="font-extrabold text-slate-700 text-right">{fac.fssaiNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Status:</span>
                  <span className="font-bold text-emerald-700 text-right">{fac.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. PROCESS STEPS (SOIL TO SACKS) ── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>🌾 Manufacturing &amp; Sortex Process Steps ({formData.processSteps.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Highlight each step of the farm-to-table paddy milling and delivery pipeline.
            </p>
          </div>

          <button
            onClick={handleOpenAddStep}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Step</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {formData.processSteps.map((step) => (
            <div
              key={step.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                step.enabled !== false
                  ? 'bg-purple-50/40 border-purple-100 hover:border-purple-300'
                  : 'bg-slate-100/60 border-slate-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-lg bg-[#7C3AED] text-white font-black text-xs flex items-center justify-center">
                    {step.step}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleStep(step.id)}
                      className="p-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      {step.enabled !== false ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                    <button
                      onClick={() => handleOpenEditStep(step)}
                      className="p-1 text-slate-500 hover:text-[#7C3AED] transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStep(step.id)}
                      className="p-1 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xs font-black text-slate-900 mb-1">{step.title}</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. OPERATING PHILOSOPHY & CERTIFICATIONS ── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>🛡️ Operating Philosophy &amp; Standards ({formData.certifications.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Statutory guarantees, Fair Trade sourcing, zero synthetic polish standards, and net weight assurances.
            </p>
          </div>

          <button
            onClick={handleOpenAddCert}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Standard</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {formData.certifications.map((cert) => (
            <div
              key={cert.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                cert.enabled !== false
                  ? 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-300'
                  : 'bg-slate-100/60 border-slate-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider">
                    {cert.authority}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleCert(cert.id)}
                      className="p-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      {cert.enabled !== false ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                    <button
                      onClick={() => handleOpenEditCert(cert)}
                      className="p-1 text-slate-500 hover:text-[#7C3AED] transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCert(cert.id)}
                      className="p-1 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xs font-black text-slate-900 mt-1">{cert.title}</h3>
                <p className="text-[11px] text-slate-600 mt-0.5 font-bold">{cert.number}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-emerald-100 flex items-center gap-1 text-[10px] font-black text-emerald-800">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>{cert.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. DIRECT SUPPORT & B2B INQUIRIES ── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <span>📞 Direct Support &amp; Institutional Contacts</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Customer helpline, bulk wholesale inquiries, and factory operating schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Direct Phone / WhatsApp</label>
            <div className="flex items-center gap-2 mt-1">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
                placeholder="+91 7989743595"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Official Email</label>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <input
                type="text"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
                placeholder="info@farminix.in"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Operating Hours</label>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <input
                type="text"
                value={formData.supportHours}
                onChange={(e) => setFormData({ ...formData, supportHours: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
                placeholder="Mon – Sat: 8:00 AM – 8:00 PM"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: ADD / EDIT FACILITY ── */}
      {facilityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingFacility ? 'Edit Processing Facility' : 'Add Processing Facility'}
              </h3>
              <button
                onClick={() => setFacilityModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFacility} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700">Facility / Mill Name</label>
                <input
                  type="text"
                  required
                  value={facilityForm.name}
                  onChange={(e) => setFacilityForm({ ...facilityForm, name: e.target.value })}
                  className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
                  placeholder="e.g. Farminix Central Milling & Sortex Facility"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Location Address</label>
                <input
                  type="text"
                  required
                  value={facilityForm.location}
                  onChange={(e) => setFacilityForm({ ...facilityForm, location: e.target.value })}
                  className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
                  placeholder="e.g. Gorantla, Guntur District, Andhra Pradesh – 522034"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Plant / Milling Type</label>
                  <input
                    type="text"
                    required
                    value={facilityForm.type}
                    onChange={(e) => setFacilityForm({ ...facilityForm, type: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
                    placeholder="Optical Sortex & Packaging Plant"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Daily Capacity</label>
                  <input
                    type="text"
                    required
                    value={facilityForm.capacity}
                    onChange={(e) => setFacilityForm({ ...facilityForm, capacity: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
                    placeholder="150 Metric Tons / Day"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">FSSAI Number</label>
                  <input
                    type="text"
                    required
                    value={facilityForm.fssaiNumber}
                    onChange={(e) => setFacilityForm({ ...facilityForm, fssaiNumber: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
                    placeholder="20126142000933"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Operating Status</label>
                  <input
                    type="text"
                    required
                    value={facilityForm.status}
                    onChange={(e) => setFacilityForm({ ...facilityForm, status: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
                    placeholder="Active & Operational"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFacilityModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Save Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD / EDIT STEP ── */}
      {stepModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingStep ? 'Edit Process Step' : 'Add Process Step'}
              </h3>
              <button
                onClick={() => setStepModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStep} className="space-y-3.5">
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Step #</label>
                  <input
                    type="text"
                    required
                    value={stepForm.step}
                    onChange={(e) => setStepForm({ ...stepForm, step: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs font-black text-center focus:border-[#7C3AED] focus:outline-none"
                    placeholder="01"
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-xs font-bold text-slate-700">Title</label>
                  <input
                    type="text"
                    required
                    value={stepForm.title}
                    onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
                    placeholder="e.g. Optical Sortex Cleaned"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  required
                  value={stepForm.desc}
                  onChange={(e) => setStepForm({ ...stepForm, desc: e.target.value })}
                  className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:border-[#7C3AED] focus:outline-none leading-relaxed"
                  placeholder="Describe this stage of the manufacturing and packaging process..."
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStepModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Save Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD / EDIT CERTIFICATION ── */}
      {certModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingCert ? 'Edit Standard / Guarantee' : 'Add Standard / Guarantee'}
              </h3>
              <button
                onClick={() => setCertModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCert} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700">Pillar / Standard Title</label>
                <input
                  type="text"
                  required
                  value={certForm.title}
                  onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                  className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
                  placeholder="e.g. Zero Synthetic Polish"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Authority / Category Badge</label>
                <input
                  type="text"
                  required
                  value={certForm.authority}
                  onChange={(e) => setCertForm({ ...certForm, authority: e.target.value })}
                  className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
                  placeholder="e.g. Pure Health Standard"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Guarantee Detail</label>
                  <input
                    type="text"
                    required
                    value={certForm.number}
                    onChange={(e) => setCertForm({ ...certForm, number: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
                    placeholder="e.g. 100% Unadulterated"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Verification Status</label>
                  <input
                    type="text"
                    required
                    value={certForm.status}
                    onChange={(e) => setCertForm({ ...certForm, status: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
                    placeholder="Chemical-Free"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCertModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Save Standard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
