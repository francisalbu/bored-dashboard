import React, { useState, useRef, useCallback } from 'react';
import {
  X,
  Upload,
  FileText,
  Loader2,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
  Trash2,
  Pen,
  Clock,
  Image as ImageIcon,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { extractTextFromFile } from '../../lib/fileExtractor';
import {
  ExtractedExperience,
  ExtractionProgress,
  extractExperiencesFromText,
  toExperienceInsert,
  hasAIKey,
} from '../../lib/bulkExperienceExtractor';
import { createExperience, ExperienceRow, ExperienceInsert } from '../../lib/experienceService';

// ─── Props ───────────────────────────────────────────────────────────────────

interface BulkUploadModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (created: ExperienceRow[]) => void;
  operatorId: number;
  defaultCategory?: string;
  hotelContext?: { name?: string; city?: string; location?: string; address?: string };
}

// ─── Stages ──────────────────────────────────────────────────────────────────

type Stage = 'upload' | 'extracting' | 'review' | 'creating' | 'done';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtCurrency = (c?: string) =>
  c === 'EUR' ? '€' : c === 'USD' ? '$' : c === 'GBP' ? '£' : c || '';

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  open,
  onClose,
  onComplete,
  operatorId,
  defaultCategory,
  hotelContext,
}) => {
  const [stage, setStage] = useState<Stage>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<ExtractionProgress | null>(null);
  const [experiences, setExperiences] = useState<ExtractedExperience[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createProgress, setCreateProgress] = useState({ done: 0, total: 0 });
  const [createdExperiences, setCreatedExperiences] = useState<ExperienceRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File processing ────────────────────────────────────────────────────

  const processFile = useCallback(
    async (f: File) => {
      setFile(f);
      setError(null);
      setStage('extracting');
      setProgress({ stage: 'reading', message: 'Reading file...', percent: 5 });

      try {
        // Step 1: Extract text from file
        const extraction = await extractTextFromFile(f);

        console.log('[BulkUpload] Extracted text length:', extraction.text.length, 'pages:', extraction.pageCount);

        setProgress({
          stage: 'reading',
          message: `Extracted text from ${extraction.pageCount || 1} page(s)`,
          percent: 15,
        });

        // Step 2: AI analysis
        const results = await extractExperiencesFromText(
          extraction.text,
          setProgress,
          {
            name: hotelContext?.name,
            city: hotelContext?.city,
            category: defaultCategory,
          }
        );

        setExperiences(results);
        setStage('review');
      } catch (err: any) {
        console.error('[BulkUpload] Error:', err);
        const message =
          err.name === 'AbortError'
            ? 'Request timed out — the document may be too large. Try a smaller file or an image instead.'
            : err.message || 'Failed to process file';
        setError(message);
        setStage('upload');
      }
    },
    [hotelContext, defaultCategory]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = '';
  };

  // ── Experience toggles ─────────────────────────────────────────────────

  const toggleSelect = (id: string) => {
    setExperiences((prev) =>
      prev.map((e) => (e.id === id ? { ...e, selected: !e.selected } : e))
    );
  };

  const selectAll = () => {
    const allSelected = experiences.every((e) => e.selected);
    setExperiences((prev) => prev.map((e) => ({ ...e, selected: !allSelected })));
  };

  const removeExperience = (id: string) => {
    setExperiences((prev) => prev.filter((e) => e.id !== id));
  };

  const updateExperience = (id: string, updates: Partial<ExtractedExperience>) => {
    setExperiences((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  // ── Bulk create ────────────────────────────────────────────────────────

  const handleBulkCreate = async () => {
    const selected = experiences.filter((e) => e.selected);
    if (selected.length === 0) return;

    setStage('creating');
    setCreateProgress({ done: 0, total: selected.length });
    const created: ExperienceRow[] = [];

    for (let i = 0; i < selected.length; i++) {
      const exp = selected[i];
      const insert = toExperienceInsert(exp, operatorId, {
        location: hotelContext?.location || hotelContext?.name,
        address: hotelContext?.address,
        city: hotelContext?.city,
      });

      const result = await createExperience(insert);
      if (result.success && result.data) {
        created.push(result.data);
      }

      setCreateProgress({ done: i + 1, total: selected.length });
    }

    setCreatedExperiences(created);
    setStage('done');
  };

  // ── Reset ──────────────────────────────────────────────────────────────

  const reset = () => {
    setStage('upload');
    setFile(null);
    setProgress(null);
    setExperiences([]);
    setError(null);
    setExpandedId(null);
    setEditingId(null);
    setCreateProgress({ done: 0, total: 0 });
    setCreatedExperiences([]);
  };

  const handleClose = () => {
    if (stage === 'done' && createdExperiences.length > 0) {
      onComplete(createdExperiences);
    }
    reset();
    onClose();
  };

  // ── Counts ─────────────────────────────────────────────────────────────

  const selectedCount = experiences.filter((e) => e.selected).length;

  if (!open) return null;

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={stage !== 'creating' ? handleClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-bored-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold text-bored-black tracking-tight">
                {stage === 'upload' && 'Import Experiences from Document'}
                {stage === 'extracting' && 'Analyzing Document...'}
                {stage === 'review' && 'Review Extracted Experiences'}
                {stage === 'creating' && 'Creating Experiences...'}
                {stage === 'done' && 'Import Complete!'}
              </h2>
              <p className="text-[12px] text-bored-gray-400 mt-0.5">
                {stage === 'upload' &&
                  'Upload a PDF or image — AI will extract all services automatically'}
                {stage === 'extracting' && file?.name}
                {stage === 'review' &&
                  `${experiences.length} experiences found · ${selectedCount} selected`}
                {stage === 'creating' &&
                  `${createProgress.done} of ${createProgress.total} created`}
                {stage === 'done' &&
                  `${createdExperiences.length} experiences added to your catalog`}
              </p>
            </div>
          </div>
          {stage !== 'creating' && (
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-xl hover:bg-bored-gray-50 flex items-center justify-center transition-colors"
            >
              <X size={18} className="text-bored-gray-400" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* ── UPLOAD STAGE ─────────────────────────────────────────── */}
          {stage === 'upload' && (
            <div className="p-8">
              {/* Error banner */}
              {error && (
                <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[13px] font-medium text-red-700">{error}</p>
                    <p className="text-[11px] text-red-500 mt-0.5">
                      Please try again with a different file
                    </p>
                  </div>
                </div>
              )}

              {/* No API Key warning */}
              {!hasAIKey() && (
                <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[13px] font-medium text-amber-700">OpenAI API key required</p>
                    <p className="text-[11px] text-amber-500 mt-0.5">
                      Add VITE_OPENAI_API_KEY to your .env.local file to enable AI extraction
                    </p>
                  </div>
                </div>
              )}

              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
                  dragOver
                    ? 'border-violet-400 bg-violet-50/50 scale-[1.01]'
                    : 'border-bored-gray-200 bg-bored-gray-50/30 hover:border-bored-gray-300 hover:bg-bored-gray-50/60'
                }`}
              >
                <div className="flex flex-col items-center justify-center py-16 px-8">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all ${
                      dragOver
                        ? 'bg-violet-100 scale-110'
                        : 'bg-bored-gray-100'
                    }`}
                  >
                    <Upload
                      size={24}
                      className={`transition-colors ${
                        dragOver ? 'text-violet-500' : 'text-bored-gray-400'
                      }`}
                    />
                  </div>
                  <p className="text-[15px] font-medium text-bored-black mb-1.5">
                    Drop your document here
                  </p>
                  <p className="text-[13px] text-bored-gray-400 mb-5">
                    or{' '}
                    <span className="text-bored-black underline underline-offset-2">
                      browse files
                    </span>
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-bored-gray-100">
                      <FileText size={13} className="text-red-500" />
                      <span className="text-[11px] text-bored-gray-500 font-medium">PDF</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-bored-gray-100">
                      <ImageIcon size={13} className="text-blue-500" />
                      <span className="text-[11px] text-bored-gray-500 font-medium">
                        JPG / PNG
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />

              {/* How it works */}
              <div className="mt-8">
                <p className="text-[11px] font-medium text-bored-gray-400 uppercase tracking-wider mb-4">
                  How it works
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      step: '1',
                      title: 'Upload document',
                      desc: 'Spa menu, brochure, price list — any hotel service document',
                    },
                    {
                      step: '2',
                      title: 'AI extracts services',
                      desc: 'Names, prices, durations, and descriptions are identified automatically',
                    },
                    {
                      step: '3',
                      title: 'Review & publish',
                      desc: 'Edit, select, and publish all experiences to your catalog at once',
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-3">
                      <div className="w-7 h-7 rounded-lg bg-bored-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-[11px] font-bold text-bored-gray-500">
                          {item.step}
                        </span>
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-bored-black">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-bored-gray-400 mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── EXTRACTING STAGE ─────────────────────────────────────── */}
          {stage === 'extracting' && progress && (
            <div className="p-8 flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-6 animate-pulse">
                <Sparkles size={24} className="text-white" />
              </div>
              <p className="text-[15px] font-medium text-bored-black mb-2">
                {progress.message}
              </p>
              <p className="text-[12px] text-bored-gray-400 mb-6">
                This usually takes 10-20 seconds
              </p>
              {/* Progress bar */}
              <div className="w-full max-w-xs">
                <div className="h-1.5 bg-bored-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-700 ease-out"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
                <p className="text-[10px] text-bored-gray-300 text-center mt-2">
                  {progress.percent}%
                </p>
              </div>
            </div>
          )}

          {/* ── REVIEW STAGE ─────────────────────────────────────────── */}
          {stage === 'review' && (
            <div className="p-6">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={selectAll}
                  className="flex items-center gap-2 text-[12px] font-medium text-bored-gray-500 hover:text-bored-black transition-colors"
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center transition-all ${
                      experiences.every((e) => e.selected)
                        ? 'bg-bored-black border-bored-black'
                        : 'border-bored-gray-300'
                    }`}
                    style={{ width: 18, height: 18 }}
                  >
                    {experiences.every((e) => e.selected) && (
                      <Check size={11} className="text-white" />
                    )}
                  </div>
                  Select all
                </button>
                <button
                  onClick={() => {
                    reset();
                    setStage('upload');
                  }}
                  className="flex items-center gap-1.5 text-[12px] text-bored-gray-400 hover:text-bored-black transition-colors"
                >
                  <RotateCcw size={12} />
                  Upload different file
                </button>
              </div>

              {/* Experience cards */}
              <div className="space-y-2">
                {experiences.map((exp) => {
                  const isExpanded = expandedId === exp.id;
                  const isEditing = editingId === exp.id;

                  return (
                    <div
                      key={exp.id}
                      className={`rounded-xl border transition-all ${
                        exp.selected
                          ? 'border-bored-gray-200 bg-white'
                          : 'border-bored-gray-100 bg-bored-gray-50/50 opacity-60'
                      }`}
                    >
                      {/* Main row */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleSelect(exp.id)}
                          className="flex-shrink-0"
                        >
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                              exp.selected
                                ? 'bg-bored-black border-bored-black'
                                : 'border-bored-gray-300 hover:border-bored-gray-400'
                            }`}
                          >
                            {exp.selected && (
                              <Check size={12} className="text-white" />
                            )}
                          </div>
                        </button>

                        {/* Image */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-bored-gray-100 flex-shrink-0">
                          <img
                            src={exp.image_url}
                            alt={exp.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-bored-black truncate">
                            {exp.title}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[11px] text-bored-gray-400 flex items-center gap-1">
                              <Clock size={10} />
                              {exp.duration}
                            </span>
                            <span className="text-[11px] font-medium text-bored-black">
                              {fmtCurrency(exp.currency)}
                              {exp.price}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-bored-gray-100 rounded text-bored-gray-500">
                              {exp.category}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => {
                              setEditingId(isEditing ? null : exp.id);
                              setExpandedId(exp.id);
                            }}
                            className="w-7 h-7 rounded-lg hover:bg-bored-gray-100 flex items-center justify-center transition-colors"
                            title="Edit"
                          >
                            <Pen size={12} className="text-bored-gray-400" />
                          </button>
                          <button
                            onClick={() => removeExperience(exp.id)}
                            className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors"
                            title="Remove"
                          >
                            <Trash2 size={12} className="text-bored-gray-300 hover:text-red-500" />
                          </button>
                          <button
                            onClick={() =>
                              setExpandedId(isExpanded ? null : exp.id)
                            }
                            className="w-7 h-7 rounded-lg hover:bg-bored-gray-100 flex items-center justify-center transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp size={14} className="text-bored-gray-400" />
                            ) : (
                              <ChevronDown size={14} className="text-bored-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-bored-gray-100 mt-1">
                          {isEditing ? (
                            // Edit mode
                            <div className="space-y-3">
                              <div>
                                <label className="block text-[10px] font-medium text-bored-gray-400 uppercase tracking-wider mb-1">
                                  Title
                                </label>
                                <input
                                  type="text"
                                  value={exp.title}
                                  onChange={(e) =>
                                    updateExperience(exp.id, {
                                      title: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 text-[13px] border border-bored-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-[10px] font-medium text-bored-gray-400 uppercase tracking-wider mb-1">
                                    Price
                                  </label>
                                  <input
                                    type="number"
                                    value={exp.price}
                                    onChange={(e) =>
                                      updateExperience(exp.id, {
                                        price: parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    className="w-full px-3 py-2 text-[13px] border border-bored-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-medium text-bored-gray-400 uppercase tracking-wider mb-1">
                                    Currency
                                  </label>
                                  <select
                                    value={exp.currency}
                                    onChange={(e) =>
                                      updateExperience(exp.id, {
                                        currency: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 text-[13px] border border-bored-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 bg-white"
                                  >
                                    <option value="EUR">EUR</option>
                                    <option value="USD">USD</option>
                                    <option value="GBP">GBP</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-medium text-bored-gray-400 uppercase tracking-wider mb-1">
                                    Duration
                                  </label>
                                  <input
                                    type="text"
                                    value={exp.duration}
                                    onChange={(e) =>
                                      updateExperience(exp.id, {
                                        duration: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 text-[13px] border border-bored-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-medium text-bored-gray-400 uppercase tracking-wider mb-1">
                                  Description
                                </label>
                                <textarea
                                  value={exp.description}
                                  onChange={(e) =>
                                    updateExperience(exp.id, {
                                      description: e.target.value,
                                    })
                                  }
                                  rows={3}
                                  className="w-full px-3 py-2 text-[13px] border border-bored-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 resize-none"
                                />
                              </div>
                              <div className="flex justify-end">
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="px-4 py-1.5 text-[12px] font-medium bg-bored-black text-white rounded-lg hover:bg-bored-gray-800 transition-colors"
                                >
                                  Done editing
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Read mode
                            <div className="space-y-2">
                              <p className="text-[12px] text-bored-gray-500 leading-relaxed">
                                {exp.description}
                              </p>
                              {exp.highlights.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {exp.highlights.map((h, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] px-2 py-0.5 bg-bored-gray-50 border border-bored-gray-100 rounded-md text-bored-gray-500"
                                    >
                                      {h}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {exp.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {exp.tags.map((tag, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] px-1.5 py-0.5 bg-violet-50 text-violet-600 rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── CREATING STAGE ───────────────────────────────────────── */}
          {stage === 'creating' && (
            <div className="p-8 flex flex-col items-center justify-center py-20">
              <Loader2 size={32} className="text-violet-500 animate-spin mb-6" />
              <p className="text-[15px] font-medium text-bored-black mb-2">
                Creating experiences...
              </p>
              <p className="text-[12px] text-bored-gray-400 mb-6">
                {createProgress.done} of {createProgress.total} complete
              </p>
              <div className="w-full max-w-xs">
                <div className="h-1.5 bg-bored-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500 ease-out"
                    style={{
                      width: `${
                        createProgress.total > 0
                          ? (createProgress.done / createProgress.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── DONE STAGE ───────────────────────────────────────────── */}
          {stage === 'done' && (
            <div className="p-8 flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
                <CheckCircle size={28} className="text-emerald-600" />
              </div>
              <h3 className="text-[18px] font-semibold text-bored-black mb-1">
                All done!
              </h3>
              <p className="text-[13px] text-bored-gray-400 mb-2">
                {createdExperiences.length} experience
                {createdExperiences.length !== 1 ? 's' : ''} added to your
                catalog
              </p>
              <p className="text-[12px] text-bored-gray-300 mb-8 max-w-sm text-center">
                You can edit details, add photos, and adjust settings for each
                experience from the catalog view
              </p>

              {/* Quick summary */}
              <div className="w-full max-w-md space-y-1.5 mb-8">
                {createdExperiences.slice(0, 5).map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center gap-3 px-3 py-2 bg-bored-gray-50 rounded-lg"
                  >
                    <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                    <span className="text-[12px] text-bored-black font-medium truncate flex-1">
                      {exp.title}
                    </span>
                    <span className="text-[11px] text-bored-gray-400">
                      {fmtCurrency(exp.currency)}
                      {exp.price}
                    </span>
                  </div>
                ))}
                {createdExperiences.length > 5 && (
                  <p className="text-[11px] text-bored-gray-400 text-center pt-1">
                    + {createdExperiences.length - 5} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {(stage === 'review' || stage === 'done') && (
          <div className="px-8 py-4 border-t border-bored-gray-100 bg-bored-gray-50/50 flex items-center justify-between">
            {stage === 'review' && (
              <>
                <p className="text-[12px] text-bored-gray-400">
                  {selectedCount} of {experiences.length} selected
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleClose}
                    className="px-5 py-2.5 text-[13px] font-medium text-bored-gray-500 hover:text-bored-black transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkCreate}
                    disabled={selectedCount === 0}
                    className="flex items-center gap-2 px-6 py-2.5 bg-bored-black text-white rounded-xl text-[13px] font-medium hover:bg-bored-gray-800 disabled:opacity-30 transition-all shadow-sm"
                  >
                    <Sparkles size={14} />
                    Create {selectedCount} Experience{selectedCount !== 1 ? 's' : ''}
                  </button>
                </div>
              </>
            )}
            {stage === 'done' && (
              <>
                <button
                  onClick={() => {
                    reset();
                    setStage('upload');
                  }}
                  className="flex items-center gap-2 text-[13px] font-medium text-bored-gray-500 hover:text-bored-black transition-colors"
                >
                  <Upload size={14} />
                  Import more
                </button>
                <button
                  onClick={handleClose}
                  className="flex items-center gap-2 px-6 py-2.5 bg-bored-black text-white rounded-xl text-[13px] font-medium hover:bg-bored-gray-800 transition-all shadow-sm"
                >
                  Done
                  <ArrowRight size={14} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
