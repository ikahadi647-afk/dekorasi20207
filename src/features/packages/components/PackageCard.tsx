import React, { useState } from 'react';
import { Package, DurationOption } from '../../../types';
import { 
    Users, 
    Pencil, 
    Copy, 
    Trash2, 
    Camera, 
    Check, 
    Clock, 
    Box, 
    Share2, 
    MapPin, 
    Tag 
} from 'lucide-react';

interface PackageCardProps {
    pkg: Package;
    onEdit: (pkg: Package) => void;
    onDuplicate: (pkg: Package) => void;
    onDelete: (pkgId: string) => void;
    onShare?: (pkg: Package) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        minimumFractionDigits: 0 
    }).format(amount);
};

export const PackageCard: React.FC<PackageCardProps> = ({
    pkg,
    onEdit,
    onDuplicate,
    onDelete,
    onShare,
}) => {
    // Interactive selected duration option (if duration options exist)
    const [selectedDurationIdx, setSelectedDurationIdx] = useState<number>(() => {
        if (pkg.durationOptions && pkg.durationOptions.length > 0) {
            const defIdx = pkg.durationOptions.findIndex(o => o.default);
            return defIdx !== -1 ? defIdx : 0;
        }
        return -1;
    });

    const activeOption: DurationOption | null = 
        pkg.durationOptions && pkg.durationOptions.length > 0 && selectedDurationIdx >= 0
            ? pkg.durationOptions[selectedDurationIdx] || pkg.durationOptions[0]
            : null;

    const currentPrice = activeOption ? activeOption.price : pkg.price;
    const currentTeam = activeOption?.photographers || pkg.photographers;
    const currentDigitalItems = (activeOption?.digitalItems && activeOption.digitalItems.length > 0)
        ? activeOption.digitalItems
        : pkg.digitalItems || [];
    const currentPhysicalItems = (activeOption?.physicalItems && activeOption.physicalItems.length > 0)
        ? activeOption.physicalItems
        : pkg.physicalItems || [];

    return (
        <div className="bg-white rounded-2xl border border-[#EAEFF4] shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] hover:border-[#5D87FF]/30 transition-all duration-300 flex flex-col overflow-hidden group">
            {/* ── Cover Image Header ── */}
            <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                {pkg.coverImage ? (
                    <img 
                        src={pkg.coverImage} 
                        alt={pkg.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        loading="lazy" 
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 bg-[#F4F6F9]">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/90 border border-[#EAEFF4] flex items-center justify-center shadow-sm text-[#5A6A85]">
                            <Camera className="w-6 h-6 sm:w-7 sm:h-7 opacity-50" />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-medium text-[#5A6A85]/70">Tanpa Foto Sampul</span>
                    </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/30" />

                {/* Badges on Cover */}
                <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-3 sm:left-3 sm:right-3 flex items-center justify-between gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 shadow-sm">
                        <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#49BEFF] flex-shrink-0" />
                        <span className="truncate max-w-[120px]">{pkg.category || 'Umum'}</span>
                    </span>

                    {pkg.region && (
                        <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-white/95 text-[#2A3547] backdrop-blur-md shadow-sm uppercase tracking-wider">
                            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#5D87FF] flex-shrink-0" />
                            <span>{pkg.region}</span>
                        </span>
                    )}
                </div>

                {/* Price display pinned on bottom-left of cover */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 flex items-end justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] uppercase font-semibold tracking-wider text-white/80">Investasi</p>
                        <p className="text-lg sm:text-xl font-bold text-white drop-shadow-sm leading-tight truncate">
                            {formatCurrency(currentPrice)}
                        </p>
                    </div>
                    {pkg.durationOptions && pkg.durationOptions.length > 1 && (
                        <span className="text-[9px] sm:text-[10px] font-medium bg-black/40 text-white/90 px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/10 flex items-center gap-1 flex-shrink-0">
                            <Clock className="w-3 h-3 text-white/80" />
                            <span>{pkg.durationOptions.length} durasi</span>
                        </span>
                    )}
                </div>
            </div>

            {/* ── Card Content ── */}
            <div className="p-3.5 sm:p-5 flex-1 flex flex-col gap-2.5 sm:gap-3.5">
                {/* Package Name & Team Info */}
                <div>
                    <h3 className="font-bold text-sm sm:text-base text-[#2A3547] leading-snug group-hover:text-[#5D87FF] transition-colors">
                        {pkg.name}
                    </h3>
                    {currentTeam && (
                        <p className="text-[11px] sm:text-xs text-[#5A6A85] mt-1 sm:mt-1.5 flex items-center gap-1.5 font-medium">
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#5D87FF] flex-shrink-0" />
                            <span className="truncate">{currentTeam}</span>
                        </p>
                    )}
                </div>

                {/* Duration Options Interactive Selector (if available) */}
                {pkg.durationOptions && pkg.durationOptions.length > 0 && (
                    <div className="bg-[#F4F6F9]/80 rounded-xl p-2 sm:p-2.5 border border-[#EAEFF4]">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#5A6A85] flex items-center gap-1">
                                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#5D87FF] flex-shrink-0" />
                                <span>Pilihan Durasi</span>
                            </span>
                            {activeOption && (
                                <span className="text-[11px] font-bold text-[#5D87FF]">
                                    {formatCurrency(activeOption.price)}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-1 sm:gap-1.5">
                            {pkg.durationOptions.map((opt, idx) => {
                                const isSelected = idx === selectedDurationIdx;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setSelectedDurationIdx(idx)}
                                        className={`px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 min-h-[30px] sm:min-h-[32px] touch-manipulation cursor-pointer ${
                                            isSelected
                                                ? 'bg-[#5D87FF] text-white shadow-xs'
                                                : 'bg-white text-[#5A6A85] hover:text-[#2A3547] border border-[#EAEFF4]'
                                        }`}
                                    >
                                        <span>{opt.label || `Opsi ${idx + 1}`}</span>
                                        {opt.default && !isSelected && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#13DEB9]" title="Default" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Deliverables / Digital Items */}
                {currentDigitalItems.length > 0 && (
                    <div className="space-y-1 sm:space-y-1.5">
                        <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#5A6A85]">
                            Yang Didapatkan
                        </p>
                        <ul className="space-y-1">
                            {currentDigitalItems.slice(0, 4).map((item, idx) => (
                                <li key={idx} className="text-xs text-[#2A3547] flex items-start gap-1.5 sm:gap-2">
                                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#13DEB9] mt-0.5 flex-shrink-0 stroke-[2.5]" />
                                    <span className="line-clamp-1">{item}</span>
                                </li>
                            ))}
                            {currentDigitalItems.length > 4 && (
                                <li className="text-[11px] font-medium text-[#5D87FF] pl-5 sm:pl-6">
                                    +{currentDigitalItems.length - 4} item lainnya
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                {/* Physical / Vendor Items */}
                {currentPhysicalItems.length > 0 && (
                    <div className="pt-0.5">
                        <div className="flex flex-wrap gap-1.5">
                            {currentPhysicalItems.map((item, idx) => (
                                <span 
                                    key={idx} 
                                    className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-[#F4F6F9] border border-[#EAEFF4] text-[#5A6A85]"
                                >
                                    <Box className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#5D87FF] flex-shrink-0" />
                                    <span>{typeof item === 'string' ? item : item.name}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Action Buttons Footer ── */}
                <div className="pt-2.5 sm:pt-3 border-t border-[#EAEFF4] mt-auto flex items-center gap-1.5 sm:gap-2">
                    <button
                        type="button"
                        onClick={() => onEdit(pkg)}
                        className="flex-1 min-h-[38px] sm:min-h-[40px] py-2 px-3 rounded-xl bg-[#ECF2FF] hover:bg-[#5D87FF] text-[#5D87FF] hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 group/btn cursor-pointer shadow-xs touch-manipulation"
                    >
                        <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover/btn:scale-110 flex-shrink-0" />
                        <span>Edit Paket</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onDuplicate(pkg)}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F4F6F9] hover:bg-[#ECF2FF] text-[#5A6A85] hover:text-[#5D87FF] border border-[#EAEFF4] transition-all cursor-pointer flex items-center justify-center flex-shrink-0 touch-manipulation"
                        title="Duplikasi ke Wilayah Lain"
                        aria-label="Duplikasi ke Wilayah Lain"
                    >
                        <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>

                    {onShare && (
                        <button
                            type="button"
                            onClick={() => onShare(pkg)}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F4F6F9] hover:bg-[#ECF2FF] text-[#5A6A85] hover:text-[#5D87FF] border border-[#EAEFF4] transition-all cursor-pointer flex items-center justify-center flex-shrink-0 touch-manipulation"
                            title="Bagikan Tautan Paket"
                            aria-label="Bagikan Tautan Paket"
                        >
                            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => onDelete(pkg.id)}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F4F6F9] hover:bg-rose-50 text-[#5A6A85] hover:text-rose-600 border border-[#EAEFF4] hover:border-rose-200 transition-all cursor-pointer flex items-center justify-center flex-shrink-0 touch-manipulation"
                        title="Hapus Paket"
                        aria-label="Hapus Paket"
                    >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
