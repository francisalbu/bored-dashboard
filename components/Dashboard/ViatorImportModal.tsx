import React, { useState } from 'react';
import {
  X,
  Loader2,
  Globe,
  Star,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ImageIcon,
} from 'lucide-react';
import {
  importViatorProduct,
  ViatorImportResult,
} from '../../lib/viatorService';
import {
  createExperience,
  ExperienceRow,
} from '../../lib/experienceService';

interface ViatorImportModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (created: ExperienceRow) => void;
  operatorId: number;
}

type Stage = 'input' | 'loading' | 'preview' | 'saving' | 'done' | 'error';

export const ViatorImportModal: React.FC<ViatorImportModalProps> = ({
  open,
  onClose,
  onComplete,
  operatorId,
}) => {
  const [stage, setStage] = useState<Stage>('input');
  const [urlInput, setUrlInput] = useState('');
  const [importResult, setImportResult] = useState<ViatorImportResult | null>(null);
  const [createdExperience, setCreatedExperience] = useState<ExperienceRow | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!open) return null;

  const handleReset = () => {
    setStage('input');
    setUrlInput('');
    setImportResult(null);
    setCreatedExperience(null);
    setErrorMessage('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFetch = async () => {
    if (!urlInput.trim()) return;
    setStage('loading');
    setErrorMessage('');

    try {
      const result = await importViatorProduct(urlInput, operatorId);
      setImportResult(result);
      setStage('preview');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch Viator product');
      setStage('error');
    }
  };

  const handleImport = async () => {
    if (!importResult) return;
    setStage('saving');

    try {
      const result = await createExperience(importResult.experience);
      if (result.success && result.data) {
        setCreatedExperience(result.data);
        setStage('done');
        onComplete(result.data);
      } else {
        throw new Error(result.error || 'Failed to save experience');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save experience');
      setStage('error');
    }
  };

  const fmtCurrency = (c: string) =>
    c === 'EUR' ? '€' : c === 'USD' ? '$' : c === 'GBP' ? '£' : c;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bored-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Globe size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-bored-black">
                Import from Viator
              </h2>
              <p className="text-[12px] text-bored-gray-400">
                Paste a Viator URL or product code
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-bored-gray-50 transition-colors"
          >
            <X size={18} className="text-bored-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* ── Input Stage ── */}
          {stage === 'input' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-bored-black mb-2">
                  Viator URL or Product Code
                </label>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                  placeholder="https://www.viator.com/tours/Lisbon/... or 156455P1"
                  className="w-full px-4 py-3 rounded-xl border border-bored-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 placeholder:text-bored-gray-300 transition-all"
                  autoFocus
                />
              </div>

              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <p className="text-[12px] text-orange-700 leading-relaxed">
                  <strong>Tip:</strong> Copy the URL of any experience from{' '}
                  <a href="https://www.viator.com" target="_blank" rel="noreferrer" className="underline">
                    viator.com
                  </a>{' '}
                  and paste it here. We'll automatically import all the details, images, and pricing.
                </p>
              </div>
            </div>
          )}

          {/* ── Loading Stage ── */}
          {stage === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-5 animate-pulse">
                <Globe size={28} className="text-white" />
              </div>
              <Loader2 size={24} className="text-orange-500 animate-spin mb-3" />
              <p className="text-sm font-medium text-bored-black">
                Fetching from Viator...
              </p>
              <p className="text-[12px] text-bored-gray-400 mt-1">
                Getting product details and pricing
              </p>
            </div>
          )}

          {/* ── Preview Stage ── */}
          {stage === 'preview' && importResult && (
            <div className="space-y-5">
              {/* Product preview card */}
              <div className="rounded-2xl overflow-hidden border border-bored-gray-100 shadow-sm">
                {/* Cover image */}
                {importResult.experience.image_url ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={importResult.experience.image_url}
                      alt={importResult.experience.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[11px] font-semibold text-orange-600 shadow-sm">
                        Viator
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-[12px] font-semibold text-white">
                        {importResult.product.reviews.combinedAverageRating.toFixed(1)}
                      </span>
                      <span className="text-[11px] text-white/70">
                        ({importResult.product.reviews.totalReviews.toLocaleString()})
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-36 bg-bored-gray-50 flex items-center justify-center">
                    <ImageIcon size={32} className="text-bored-gray-200" />
                  </div>
                )}

                {/* Details */}
                <div className="p-4 space-y-3">
                  <h3 className="text-[15px] font-semibold text-bored-black leading-snug">
                    {importResult.experience.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-[12px] text-bored-gray-500">
                    {importResult.experience.duration && (
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-bored-gray-400" />
                        {importResult.experience.duration}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-bored-gray-400" />
                      {importResult.experience.city || 'Lisbon'}
                    </span>
                    {importResult.experience.max_group_size && (
                      <span className="flex items-center gap-1">
                        <Users size={13} className="text-bored-gray-400" />
                        Max {importResult.experience.max_group_size}
                      </span>
                    )}
                  </div>

                  <p className="text-[13px] text-bored-gray-500 leading-relaxed line-clamp-3">
                    {importResult.experience.short_description}
                  </p>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-2 border-t border-bored-gray-100">
                    <div>
                      <span className="text-lg font-bold text-bored-black">
                        {fmtCurrency(importResult.currency)}
                        {importResult.price.toFixed(0)}
                      </span>
                      <span className="text-[12px] text-bored-gray-400 ml-1">
                        / person
                      </span>
                    </div>
                    <span className="text-[12px] text-bored-gray-400">
                      by {importResult.product.supplier?.name || 'Viator'}
                    </span>
                  </div>

                  {/* Gallery preview */}
                  {(importResult.experience.images?.length || 0) > 1 && (
                    <div className="flex gap-2 pt-2">
                      {importResult.experience.images!.slice(0, 5).map((url, i) => (
                        <div
                          key={i}
                          className="w-14 h-14 rounded-lg overflow-hidden border border-bored-gray-100 flex-shrink-0"
                        >
                          <img
                            src={url}
                            alt={`Photo ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {(importResult.experience.images!.length) > 5 && (
                        <div className="w-14 h-14 rounded-lg bg-bored-gray-50 flex items-center justify-center border border-bored-gray-100 flex-shrink-0">
                          <span className="text-[11px] font-medium text-bored-gray-400">
                            +{importResult.experience.images!.length - 5}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Included */}
                  {(importResult.experience.included?.length || 0) > 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] font-semibold text-bored-gray-400 uppercase tracking-wider mb-1.5">
                        Included
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {importResult.experience.included!.slice(0, 4).map((item, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-[11px] font-medium"
                          >
                            {item.length > 40 ? item.substring(0, 37) + '...' : item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Viator link */}
              {importResult.directProductUrl && (
                <a
                  href={importResult.directProductUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-[12px] text-orange-600 hover:text-orange-700 transition-colors"
                >
                  <ExternalLink size={13} />
                  View on Viator
                </a>
              )}
            </div>
          )}

          {/* ── Saving Stage ── */}
          {stage === 'saving' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={28} className="text-orange-500 animate-spin mb-4" />
              <p className="text-sm font-medium text-bored-black">
                Adding to your catalog...
              </p>
            </div>
          )}

          {/* ── Done Stage ── */}
          {stage === 'done' && createdExperience && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-base font-semibold text-bored-black mb-1">
                Experience imported!
              </h3>
              <p className="text-[13px] text-bored-gray-400 text-center max-w-sm mb-2">
                <strong>{createdExperience.title}</strong> has been added to your catalog and is now live in the main feed.
              </p>
            </div>
          )}

          {/* ── Error Stage ── */}
          {stage === 'error' && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h3 className="text-base font-semibold text-bored-black mb-1">
                Import failed
              </h3>
              <p className="text-[13px] text-bored-gray-400 text-center max-w-sm">
                {errorMessage}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-bored-gray-100 px-6 py-4 flex justify-end gap-2.5">
          {stage === 'input' && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl text-sm text-bored-gray-500 hover:bg-bored-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFetch}
                disabled={!urlInput.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-medium hover:from-orange-600 hover:to-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <Globe size={15} />
                Fetch from Viator
              </button>
            </>
          )}

          {stage === 'preview' && (
            <>
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl text-sm text-bored-gray-500 hover:bg-bored-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all shadow-sm"
              >
                <CheckCircle size={15} />
                Import to Catalog
              </button>
            </>
          )}

          {(stage === 'done' || stage === 'error') && (
            <>
              {stage === 'error' && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl text-sm text-bored-gray-500 hover:bg-bored-gray-50 transition-colors"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={handleClose}
                className="px-5 py-2.5 bg-bored-black text-white rounded-xl text-sm font-medium hover:bg-bored-gray-800 transition-colors"
              >
                {stage === 'done' ? 'Done' : 'Close'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
