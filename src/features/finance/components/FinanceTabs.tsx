import React, { useState } from 'react';
import {
    FileTextIcon, ClipboardListIcon, CreditCardIcon, TrendingUpIcon,
    BarChart2Icon, DollarSignIcon, ChevronDownIcon
} from '../../../constants';

interface FinanceTabsProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    showVisualSummary: boolean;
    setShowVisualSummary: (show: boolean) => void;
}

export const FinanceTabs: React.FC<FinanceTabsProps> = ({
    activeTab,
    setActiveTab,
    showVisualSummary,
    setShowVisualSummary
}) => {
    const [showReports, setShowReports] = useState(false);

    const operasionalTabs = [
        { id: 'transactions', label: 'Transaksi', icon: FileTextIcon },
        { id: 'pockets', label: 'Kantong', icon: ClipboardListIcon },
        { id: 'cards', label: 'Kartu', icon: CreditCardIcon },
        { id: 'cashflow', label: 'Arus Kas', icon: TrendingUpIcon },
    ];

    const reportTabs = [
        { id: 'laporan', label: 'Laporan Umum', icon: BarChart2Icon },
        { id: 'laporanKartu', label: 'Laporan Kartu', icon: CreditCardIcon },
        { id: 'labaAcara Pernikahan', label: 'Laba Acara', icon: DollarSignIcon },
    ];

    const TabButton = ({ tab, isActive }: { tab: any, isActive: boolean }) => (
        <button
            onClick={() => {
                setActiveTab(tab.id);
                setShowReports(false);
            }}
            className={`
                shrink-0 inline-flex items-center gap-2
                px-4 py-2.5 rounded-xl font-bold text-sm
                transition-all duration-200
                ${isActive
                    ? 'bg-[#5D87FF] text-white shadow-md'
                    : 'text-[#5A6A85] hover:bg-[#F4F6F9]'
                }
            `}
        >
            <tab.icon className="w-4 h-4" />
            {tab.label}
        </button>
    );

    return (
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-[#EAEFF4] shadow-sm">
            {/* Operasional */}
            {operasionalTabs.map(tab => (
                <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} />
            ))}

            {/* Reports Dropdown */}
            <div className="relative">
                <button
                    onClick={() => setShowReports(!showReports)}
                    className={`
                        inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm
                        ${reportTabs.some(t => t.id === activeTab) ? 'bg-[#5D87FF] text-white' : 'text-[#5A6A85] hover:bg-[#F4F6F9]'}
                    `}
                >
                    <BarChart2Icon className="w-4 h-4" />
                    Laporan
                    <ChevronDownIcon className="w-3 h-3" />
                </button>
                
                {showReports && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-[#EAEFF4] rounded-xl shadow-xl z-50 p-2 space-y-1">
                        {reportTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setShowReports(false); }}
                                className="w-full text-left px-3 py-2 text-sm font-semibold text-[#5A6A85] hover:bg-[#F4F6F9] rounded-lg"
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1" />

            {/* Graph Toggle */}
            <button
                onClick={() => setShowVisualSummary(!showVisualSummary)}
                className={`
                    px-4 py-2.5 rounded-xl font-bold text-sm border transition-all
                    ${showVisualSummary ? 'bg-[#ECFDF5] border-[#13DEB9] text-[#13DEB9]' : 'border-[#EAEFF4] text-[#5A6A85]'}
                `}
            >
                {showVisualSummary ? 'Tutup Grafik' : 'Grafik'}
            </button>
        </div>
    );
};
