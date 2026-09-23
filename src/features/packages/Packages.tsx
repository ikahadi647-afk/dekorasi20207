import React, { useState, useEffect, useMemo } from 'react';
import {
    Package,
    AddOn,
    Project,
    Profile,
    NavigationAction,
    REGIONS,
    Region,
    PhysicalItem,
    DurationOption,
} from '../../types';
import { 
    createPackage, 
    updatePackage, 
    deletePackage,
} from '../../services/packages';
import {
    createAddOn,
    updateAddOn,
    deleteAddOn,
} from '../../services/addOns';

import { PackageCard } from './components/PackageCard';
import { PackageTable } from './components/PackageTable';
import { PackageModal } from './components/PackageModal';
import { AddOnSection } from './components/AddOnSection';
import { DuplicatePackageModal } from './components/DuplicatePackageModal';
import { SharePackageModal } from './components/SharePackageModal';
import { PackageGuideModal } from './components/PackageGuideModal';

import { 
    Package as PackageIcon, 
    Plus, 
    Share2, 
    HelpCircle, 
    Search, 
    LayoutGrid, 
    List, 
    Sparkles, 
    Tag, 
    Filter, 
    Layers, 
    DollarSign 
} from 'lucide-react';

export interface PackagesProps {
    packages: Package[];
    setPackages: React.Dispatch<React.SetStateAction<Package[]>>;
    addOns: AddOn[];
    setAddOns: React.Dispatch<React.SetStateAction<AddOn[]>>;
    projects: Project[];
    profile: Profile;
    showNotification: (message: string) => void;
    initialAction: NavigationAction | null;
    setInitialAction: (action: NavigationAction | null) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        minimumFractionDigits: 0 
    }).format(amount);
};

const emptyPackageForm = {
    name: '',
    price: '',
    category: '',
    region: '' as '' | Region,
    processingTime: '',
    photographers: '',
    videographers: '',
    physicalItems: [{ name: '', price: '' }],
    digitalItems: [''],
    coverImage: '',
    durationOptions: [
        { label: '4 Jam', price: '', default: true },
        { label: '8 Jam', price: '', default: false },
        { label: 'Full Day', price: '', default: false }
    ],
};

const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });

const titleCase = (s: string) =>
    s ? s.replace(/\b\w/g, c => c.toUpperCase()) : '';

export const Packages: React.FC<PackagesProps> = ({
    packages,
    setPackages,
    addOns,
    setAddOns,
    projects,
    profile,
    showNotification,
    initialAction,
    setInitialAction,
}) => {
    // ── Main UI States ──
    const [mainTab, setMainTab] = useState<'packages' | 'addons'>('packages');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [searchTerm, setSearchTerm] = useState('');
    const [regionFilter, setRegionFilter] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');

    // ── Modal States ──
    const [packageEditMode, setPackageEditMode] = useState<string | null>(null);
    const [packageFormData, setPackageFormData] = useState<any>(emptyPackageForm);
    const [copySourcePkg, setCopySourcePkg] = useState<Package | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

    // Initial action handler (e.g. redirected from dashboard with "add" action)
    useEffect(() => {
        if (initialAction?.type === 'add') {
            setPackageEditMode('new');
            setPackageFormData(emptyPackageForm);
            setInitialAction(null);
        }
    }, [initialAction, setInitialAction]);

    // Available Regions calculation
    const existingRegions = useMemo(() => {
        const set = new Set<string>();
        for (const p of packages) {
            if (p.region && String(p.region).trim() !== '') set.add(String(p.region));
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [packages]);

    const unionRegions = useMemo(() => {
        const baseValues = REGIONS.map(r => r.value.toLowerCase());
        const extra = existingRegions.filter(er => !baseValues.includes(er.toLowerCase()));
        return [
            ...REGIONS.map(r => ({ value: r.value, label: r.label })),
            ...extra.map(er => ({ value: er, label: titleCase(er) })),
        ];
    }, [existingRegions]);

    // Categories list
    const availableCategories = useMemo(() => {
        const cats = new Set<string>(profile.packageCategories || []);
        packages.forEach(p => {
            if (p.category) cats.add(p.category);
        });
        return Array.from(cats).filter(Boolean).sort();
    }, [packages, profile.packageCategories]);

    // Filtered Packages
    const filteredPackages = useMemo(() => {
        return packages.filter(pkg => {
            const matchesSearch = 
                pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (pkg.category && pkg.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (pkg.photographers && pkg.photographers.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (pkg.digitalItems && pkg.digitalItems.some(d => d.toLowerCase().includes(searchTerm.toLowerCase())));

            const matchesRegion = !regionFilter || (pkg.region && pkg.region.toLowerCase() === regionFilter.toLowerCase());
            const matchesCategory = !categoryFilter || pkg.category === categoryFilter;

            return matchesSearch && matchesRegion && matchesCategory;
        });
    }, [packages, searchTerm, regionFilter, categoryFilter]);

    // Grouping by Category for Cards view
    const packagesByCategory = useMemo(() => {
        const grouped: Record<string, Package[]> = {};
        filteredPackages.forEach(pkg => {
            const cat = pkg.category || 'Tanpa Kategori';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(pkg);
        });
        return grouped;
    }, [filteredPackages]);

    // Stat / KPI Calculations
    const stats = useMemo(() => {
        const allPrices = filteredPackages.flatMap(p => 
            p.durationOptions && p.durationOptions.length > 0 
                ? p.durationOptions.map(o => o.price) 
                : [p.price]
        ).filter(price => price > 0);

        const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
        const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;

        return {
            totalPackages: filteredPackages.length,
            totalAddOns: addOns.length,
            totalCategories: Object.keys(packagesByCategory).length,
            minPrice,
            maxPrice,
        };
    }, [filteredPackages, addOns, packagesByCategory]);

    // ── Package CRUD Handlers ──
    const handleOpenCreatePackage = () => {
        setPackageEditMode('new');
        setPackageFormData({
            ...emptyPackageForm,
            category: availableCategories[0] || '',
            region: regionFilter || '',
        });
    };

    const handleOpenEditPackage = (pkg: Package) => {
        setPackageEditMode(pkg.id);
        setPackageFormData({
            name: pkg.name,
            price: pkg.price.toString(),
            category: pkg.category,
            region: (pkg.region || '') as any,
            processingTime: '',
            photographers: pkg.photographers && pkg.videographers
                ? `${pkg.photographers} & ${pkg.videographers}`
                : (pkg.photographers || pkg.videographers || ''),
            videographers: '',
            physicalItems: pkg.physicalItems && pkg.physicalItems.length > 0 
                ? pkg.physicalItems.map(item => ({ ...item, price: item.price.toString() })) 
                : [{ name: '', price: '' }],
            digitalItems: pkg.digitalItems && pkg.digitalItems.length > 0 ? pkg.digitalItems : [''],
            coverImage: pkg.coverImage || '',
            durationOptions: pkg.durationOptions && pkg.durationOptions.length > 0
                ? pkg.durationOptions.map(o => ({
                    label: o.label,
                    price: o.price.toString(),
                    default: o.default,
                    photographers: o.photographers || '',
                    digitalItems: o.digitalItems && o.digitalItems.length > 0 ? o.digitalItems : [''],
                    physicalItems: o.physicalItems && o.physicalItems.length > 0 
                        ? o.physicalItems.map((p: PhysicalItem) => ({ ...p, price: p.price })) 
                        : [{ name: '', price: 0 }],
                }))
                : [
                    { label: '4 Jam', price: '', default: true },
                    { label: '8 Jam', price: '', default: false },
                    { label: 'Full Day', price: '', default: false }
                ],
        });
    };

    const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                alert('Ukuran file foto tidak boleh melebihi 2MB.');
                e.target.value = '';
                return;
            }
            if (!file.type.match('image.*')) {
                alert('Hanya format file gambar yang diperbolehkan.');
                e.target.value = '';
                return;
            }
            try {
                const base64 = await toBase64(file);
                setPackageFormData((prev: any) => ({ ...prev, coverImage: base64 }));
            } catch (err) {
                console.error(err);
                alert('Gagal mengunggah gambar. Silakan coba lagi.');
            }
        }
    };

    const handleSubmitPackage = async (e: React.FormEvent) => {
        e.preventDefault();
        const hasValidDurationOptions = Array.isArray(packageFormData.durationOptions) && 
            packageFormData.durationOptions.some((o: any) => String(o.label || '').trim() !== '' && String(o.price || '') !== '');

        if (!packageFormData.name.trim()) {
            alert('Nama Paket wajib diisi.');
            return;
        }

        if (!hasValidDurationOptions && !packageFormData.price) {
            alert('Silakan isi Harga Paket atau tambahkan Opsi Durasi & Harga.');
            return;
        }

        const defaultOption = hasValidDurationOptions 
            ? (packageFormData.durationOptions.find((o: any) => o.default) || packageFormData.durationOptions[0]) 
            : null;
        const computedBasePrice = defaultOption ? Number(defaultOption.price || 0) : Number(packageFormData.price || 0);

        const packageData: Omit<Package, 'id'> = {
            name: packageFormData.name.trim(),
            price: computedBasePrice,
            category: packageFormData.category,
            region: packageFormData.region ? String(packageFormData.region).trim().toLowerCase() : undefined,
            processingTime: '',
            photographers: packageFormData.photographers?.trim() || undefined,
            videographers: '',
            physicalItems: packageFormData.physicalItems
                .filter((item: any) => typeof item.name === 'string' && item.name.trim() !== '')
                .map((item: any) => ({ name: item.name.trim(), price: Number(item.price || 0) })),
            digitalItems: packageFormData.digitalItems.filter((item: string) => typeof item === 'string' && item.trim() !== ''),
            coverImage: packageFormData.coverImage || undefined,
            durationOptions: hasValidDurationOptions
                ? packageFormData.durationOptions
                    .filter((opt: any) => String(opt.label || '').trim() !== '' && Number(opt.price) >= 0)
                    .map((opt: any): DurationOption => ({
                        label: String(opt.label).trim(),
                        price: Number(opt.price),
                        default: !!opt.default,
                        photographers: opt.photographers?.trim() || undefined,
                    }))
                : undefined,
        };

        try {
            if (packageEditMode !== 'new' && packageEditMode) {
                const updated = await updatePackage(packageEditMode, packageData);
                setPackages(prev => prev.map(p => p.id === packageEditMode ? updated : p));
                showNotification('Paket layanan berhasil diperbarui.');
            } else {
                const created = await createPackage(packageData as any);
                setPackages(prev => [...prev, created]);
                showNotification('Paket layanan baru berhasil ditambahkan.');
            }
            setPackageEditMode(null);
            setPackageFormData(emptyPackageForm);
        } catch (err: any) {
            console.error('[Packages.save] error:', err);
            alert(`Gagal menyimpan paket ke database. ${err?.message || 'Silakan coba lagi.'}`);
        }
    };

    const handleDeletePackage = async (pkgId: string) => {
        const isPackageInUse = projects.some(p => p.packageId === pkgId);
        if (isPackageInUse) {
            alert('Paket ini tidak dapat dihapus karena masih digunakan pada satu atau lebih data Acara Pernikahan.');
            return;
        }

        if (!window.confirm('Apakah Anda yakin ingin menghapus paket layanan ini?')) return;

        try {
            await deletePackage(pkgId);
            setPackages(prev => prev.filter(p => p.id !== pkgId));
            showNotification('Paket layanan berhasil dihapus.');
        } catch (err) {
            console.error(err);
            alert('Gagal menghapus paket di database. Silakan coba lagi.');
        }
    };

    const handleDuplicatePackage = async (targetRegion: string) => {
        if (!copySourcePkg) return;
        const { id, ...rest } = copySourcePkg;
        const newPkg: Omit<Package, 'id'> = {
            ...rest,
            name: `${copySourcePkg.name} (${titleCase(targetRegion)})`,
            region: targetRegion as any,
        };
        const created = await createPackage(newPkg as any);
        setPackages(prev => [...prev, created]);
        showNotification(`Paket berhasil diduplikasi ke wilayah ${titleCase(targetRegion)}.`);
    };

    const handleShareSinglePackage = async (pkg: Package) => {
        const baseUrl = `${window.location.origin}${window.location.pathname}#/public-booking`;
        const shareUrl = pkg.region 
            ? `${baseUrl}?region=${encodeURIComponent(pkg.region)}&package=${encodeURIComponent(pkg.id)}`
            : `${baseUrl}?package=${encodeURIComponent(pkg.id)}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${pkg.name} - Weddfin`,
                    text: `Lihat paket ${pkg.name} dari Weddfin`,
                    url: shareUrl,
                });
                showNotification(`Paket "${pkg.name}" berhasil dibagikan!`);
                return;
            } catch (err: any) {
                if (err?.name === 'AbortError') return;
            }
        }

        if (navigator.clipboard?.writeText) {
            try {
                await navigator.clipboard.writeText(shareUrl);
                showNotification(`Tautan paket "${pkg.name}" berhasil disalin ke clipboard!`);
                return;
            } catch {
                // fallback to modal
            }
        }

        setIsShareModalOpen(true);
    };

    // ── Add-On CRUD Handlers ──
    const handleSaveAddOn = async (addOnData: { id?: string; name: string; price: number; region?: string }) => {
        if (addOnData.id) {
            const updated = await updateAddOn(addOnData.id, {
                name: addOnData.name,
                price: addOnData.price,
                region: addOnData.region,
            });
            setAddOns(prev => prev.map(a => a.id === addOnData.id ? updated : a));
            showNotification('Add-on berhasil diperbarui.');
        } else {
            const created = await createAddOn({
                name: addOnData.name,
                price: addOnData.price,
                region: addOnData.region,
            } as any);
            setAddOns(prev => [...prev, created]);
            showNotification('Add-on baru berhasil ditambahkan.');
        }
    };

    const handleDeleteAddOn = async (addOnId: string) => {
        const isAddOnInUse = projects.some(p => p.addOns && p.addOns.some(a => a.id === addOnId));
        if (isAddOnInUse) {
            alert('Add-on ini tidak dapat dihapus karena sedang dipilih pada salah satu Acara Pernikahan.');
            return;
        }

        if (!window.confirm('Hapus layanan add-on ini?')) return;

        try {
            await deleteAddOn(addOnId);
            setAddOns(prev => prev.filter(p => p.id !== addOnId));
            showNotification('Add-on berhasil dihapus.');
        } catch (err) {
            console.error(err);
            alert('Gagal menghapus add-on di database.');
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12">
            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row w-full items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#2A3547] tracking-tight flex items-center gap-2">
                        <PackageIcon className="w-5 h-5 text-[#5D87FF] flex-shrink-0" />
                        <span>Katalog Paket & Layanan</span>
                    </h2>
                    <p className="text-[11px] sm:text-xs text-[#5A6A85] mt-0.5 line-clamp-2 sm:line-clamp-none">
                        Kelola paket dokumentasi, opsi durasi dinamis, add-on, dan portofolio penawaran harga klien
                    </p>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => setIsGuideModalOpen(true)}
                        className="py-2 sm:py-2 px-3 rounded-xl border border-[#EAEFF4] bg-white hover:bg-[#F4F6F9] text-[#5A6A85] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 min-h-[38px] touch-manipulation cursor-pointer"
                        title="Lihat Panduan Pengelolaan Paket"
                    >
                        <HelpCircle className="w-4 h-4 text-[#5A6A85]" />
                        <span className="hidden xs:inline sm:inline">Panduan</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsShareModalOpen(true)}
                        className="py-2 sm:py-2 px-3 rounded-xl border border-[#EAEFF4] bg-white hover:bg-[#F4F6F9] text-[#5A6A85] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 min-h-[38px] touch-manipulation cursor-pointer"
                        title="Bagikan Tautan Booking & Katalog"
                    >
                        <Share2 className="w-4 h-4 text-[#5D87FF]" />
                        <span>Bagikan</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleOpenCreatePackage}
                        className="flex-1 sm:flex-initial bg-[#5D87FF] hover:bg-[#4871e3] text-white font-bold px-3.5 sm:px-4 py-2 rounded-xl shadow-[0_4px_12px_rgba(93,135,255,0.25)] inline-flex items-center justify-center gap-1.5 sm:gap-2 text-xs transition-all min-h-[38px] touch-manipulation cursor-pointer"
                    >
                        <Plus className="w-4 h-4 flex-shrink-0" />
                        <span>Tambah Paket</span>
                    </button>
                </div>
            </div>

            {/* ── KPI Stat Highlights ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {/* Total Packages */}
                <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#EAEFF4] flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#5D87FF]/10 text-[#5D87FF] flex items-center justify-center flex-shrink-0">
                        <PackageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] sm:text-xs font-semibold text-[#5A6A85] truncate">Paket Aktif</p>
                        <p className="text-lg sm:text-2xl font-bold text-[#2A3547] mt-0.5 leading-none">
                            {stats.totalPackages}
                        </p>
                    </div>
                </div>

                {/* Total Add-Ons */}
                <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#EAEFF4] flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#13DEB9]/10 text-[#13DEB9] flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] sm:text-xs font-semibold text-[#5A6A85] truncate">Layanan Add-On</p>
                        <p className="text-lg sm:text-2xl font-bold text-[#2A3547] mt-0.5 leading-none">
                            {stats.totalAddOns}
                        </p>
                    </div>
                </div>

                {/* Active Categories */}
                <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#EAEFF4] flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#FFAE1F]/10 text-[#FFAE1F] flex items-center justify-center flex-shrink-0">
                        <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] sm:text-xs font-semibold text-[#5A6A85] truncate">Kategori Layanan</p>
                        <p className="text-lg sm:text-2xl font-bold text-[#2A3547] mt-0.5 leading-none">
                            {stats.totalCategories}
                        </p>
                    </div>
                </div>

                {/* Price Range */}
                <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#EAEFF4] flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#FA896B]/10 text-[#FA896B] flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] sm:text-xs font-semibold text-[#5A6A85] truncate">Rentang Harga</p>
                        <p className="text-xs sm:text-sm font-bold text-[#2A3547] mt-1 truncate" title={stats.minPrice > 0 ? `${formatCurrency(stats.minPrice)} – ${formatCurrency(stats.maxPrice)}` : '—'}>
                            {stats.minPrice > 0
                                ? `${new Intl.NumberFormat('id-ID', { notation: 'compact', style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats.minPrice)} – ${new Intl.NumberFormat('id-ID', { notation: 'compact', style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats.maxPrice)}`
                                : '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Main View Tabs & Filter Bar ── */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#EAEFF4] space-y-3 sm:space-y-4">
                {/* Tab Switcher: Paket Layanan vs Add-On Layanan */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#EAEFF4] pb-3 sm:pb-4">
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F4F6F9] rounded-xl sm:flex sm:bg-transparent sm:p-0 sm:gap-2">
                        <button
                            type="button"
                            onClick={() => setMainTab('packages')}
                            className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                                mainTab === 'packages'
                                    ? 'bg-[#5D87FF] text-white shadow-xs'
                                    : 'text-[#5A6A85] hover:text-[#2A3547] sm:bg-[#F4F6F9]'
                            }`}
                        >
                            <PackageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>Paket Layanan</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                mainTab === 'packages' ? 'bg-white/20 text-white' : 'bg-white text-[#5A6A85]'
                            }`}>
                                {packages.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setMainTab('addons')}
                            className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                                mainTab === 'addons'
                                    ? 'bg-[#5D87FF] text-white shadow-xs'
                                    : 'text-[#5A6A85] hover:text-[#2A3547] sm:bg-[#F4F6F9]'
                            }`}
                        >
                            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>Add-On & Ekstra</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                mainTab === 'addons' ? 'bg-white/20 text-white' : 'bg-white text-[#5A6A85]'
                            }`}>
                                {addOns.length}
                            </span>
                        </button>
                    </div>

                    {/* View Switcher (Only visible for Packages tab) */}
                    {mainTab === 'packages' && (
                        <div className="flex items-center gap-1 self-end sm:self-auto bg-[#F4F6F9] p-1 rounded-xl border border-[#EAEFF4]">
                            <button
                                type="button"
                                onClick={() => setViewMode('cards')}
                                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all touch-manipulation cursor-pointer ${
                                    viewMode === 'cards'
                                        ? 'bg-white text-[#5D87FF] shadow-xs'
                                        : 'text-[#5A6A85] hover:text-[#2A3547]'
                                }`}
                                title="Tampilan Kartu"
                            >
                                <LayoutGrid className="w-4 h-4" />
                                <span className="text-xs">Kartu</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all touch-manipulation cursor-pointer ${
                                    viewMode === 'table'
                                        ? 'bg-white text-[#5D87FF] shadow-xs'
                                        : 'text-[#5A6A85] hover:text-[#2A3547]'
                                }`}
                                title="Tampilan Tabel"
                            >
                                <List className="w-4 h-4" />
                                <span className="text-xs">Tabel</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Sub-Filters for Packages tab */}
                {mainTab === 'packages' && (
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3 pt-0.5">
                        {/* Search Input */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="w-4 h-4 text-[#5A6A85] absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Cari paket (nama, kategori, tim)..."
                                className="w-full pl-9 pr-3.5 py-2 sm:py-2.5 rounded-xl border border-[#EAEFF4] bg-[#F4F6F9] focus:bg-white focus:border-[#5D87FF] text-xs sm:text-sm text-[#2A3547] placeholder-[#5A6A85] outline-none transition-all"
                            />
                        </div>

                        {/* Filter by Category & Region */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            {/* Category selector */}
                            <select
                                value={categoryFilter}
                                onChange={e => setCategoryFilter(e.target.value)}
                                className="py-2 sm:py-2.5 px-3 rounded-xl border border-[#EAEFF4] bg-[#F4F6F9] focus:bg-white focus:border-[#5D87FF] text-xs font-semibold text-[#2A3547] outline-none cursor-pointer transition-all"
                            >
                                <option value="">Semua Kategori</option>
                                {availableCategories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>

                            {/* Region selector pills with smooth horizontal swipe */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none -mx-1 px-1">
                                <button
                                    type="button"
                                    onClick={() => setRegionFilter('')}
                                    className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border flex-shrink-0 touch-manipulation cursor-pointer ${
                                        regionFilter === ''
                                            ? 'bg-[#5D87FF] text-white border-[#5D87FF] shadow-xs'
                                            : 'bg-white border-[#EAEFF4] text-[#5A6A85] hover:bg-[#F4F6F9]'
                                    }`}
                                >
                                    Semua Wilayah
                                </button>
                                {unionRegions.map(r => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => setRegionFilter(r.value)}
                                        className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border flex-shrink-0 touch-manipulation cursor-pointer ${
                                            regionFilter === r.value
                                                ? 'bg-[#5D87FF] text-white border-[#5D87FF] shadow-xs'
                                                : 'bg-white border-[#EAEFF4] text-[#5A6A85] hover:bg-[#F4F6F9]'
                                        }`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Content View ── */}
            {mainTab === 'packages' ? (
                viewMode === 'cards' ? (
                    // Cards Grid View (Categorized or Direct)
                    <div className="space-y-6 sm:space-y-8">
                        {filteredPackages.length === 0 ? (
                            <div className="py-12 sm:py-16 text-center bg-white rounded-2xl border border-[#EAEFF4] p-6 sm:p-8">
                                <div className="w-12 h-12 rounded-2xl bg-[#5D87FF]/10 text-[#5D87FF] flex items-center justify-center mx-auto mb-3">
                                    <PackageIcon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-base text-[#2A3547]">Tidak ada paket ditemukan</h3>
                                <p className="text-xs text-[#5A6A85] mt-1 max-w-sm mx-auto">
                                    {searchTerm || regionFilter || categoryFilter
                                        ? 'Coba sesuaikan kata kunci pencarian atau filter wilayah/kategori Anda.'
                                        : 'Mulai dengan menambahkan paket penawaran wedding pertama Anda.'}
                                </p>
                                <button
                                    type="button"
                                    onClick={handleOpenCreatePackage}
                                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5D87FF] text-white text-xs font-semibold shadow-sm hover:bg-[#4871e3] touch-manipulation cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Tambah Paket Pertama</span>
                                </button>
                            </div>
                        ) : categoryFilter ? (
                            // When single category is filtered, show a clean 3-col grid
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
                                {filteredPackages.map(pkg => (
                                    <PackageCard
                                        key={pkg.id}
                                        pkg={pkg}
                                        onEdit={handleOpenEditPackage}
                                        onDuplicate={setCopySourcePkg}
                                        onShare={handleShareSinglePackage}
                                        onDelete={handleDeletePackage}
                                    />
                                ))}
                            </div>
                        ) : (
                            // Grouped by Category
                            Object.entries(packagesByCategory).map(([catName, catPackages]) => (
                                <div key={catName} className="space-y-3 sm:space-y-4">
                                    <div className="flex items-center justify-between pb-2 border-b border-[#EAEFF4]">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#5D87FF]" />
                                            <h3 className="font-bold text-sm sm:text-base text-[#2A3547]">
                                                {catName}
                                            </h3>
                                            <span className="px-2 py-0.5 rounded-full bg-[#F4F6F9] border border-[#EAEFF4] text-[#5A6A85] text-[10px] sm:text-xs font-semibold">
                                                {catPackages.length} paket
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
                                        {catPackages.map(pkg => (
                                            <PackageCard
                                                key={pkg.id}
                                                pkg={pkg}
                                                onEdit={handleOpenEditPackage}
                                                onDuplicate={setCopySourcePkg}
                                                onShare={handleShareSinglePackage}
                                                onDelete={handleDeletePackage}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    // Table View
                    <PackageTable
                        packages={filteredPackages}
                        onEdit={handleOpenEditPackage}
                        onDuplicate={setCopySourcePkg}
                        onDelete={handleDeletePackage}
                    />
                )
            ) : (
                // Add-Ons Tab View
                <AddOnSection
                    addOns={addOns}
                    regionFilter={regionFilter}
                    unionRegions={unionRegions}
                    onSaveAddOn={handleSaveAddOn}
                    onDeleteAddOn={handleDeleteAddOn}
                />
            )}

            {/* ── Package Edit/Add Modal ── */}
            {packageEditMode && (
                <PackageModal
                    isOpen={true}
                    onClose={() => {
                        setPackageEditMode(null);
                        setPackageFormData(emptyPackageForm);
                    }}
                    formData={packageFormData}
                    setFormData={setPackageFormData}
                    editMode={packageEditMode}
                    packageCategories={availableCategories}
                    unionRegions={unionRegions}
                    existingRegions={existingRegions}
                    onSubmit={handleSubmitPackage}
                    onCoverImageUpload={handleCoverImageUpload}
                />
            )}

            {/* ── Duplicate Modal ── */}
            {copySourcePkg && (
                <DuplicatePackageModal
                    packageToCopy={copySourcePkg}
                    onClose={() => setCopySourcePkg(null)}
                    unionRegions={unionRegions}
                    onDuplicate={handleDuplicatePackage}
                />
            )}

            {/* ── Share Modal ── */}
            <SharePackageModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                unionRegions={unionRegions}
            />

            {/* ── Guide Modal ── */}
            <PackageGuideModal
                isOpen={isGuideModalOpen}
                onClose={() => setIsGuideModalOpen(false)}
            />
        </div>
    );
};

export default Packages;
