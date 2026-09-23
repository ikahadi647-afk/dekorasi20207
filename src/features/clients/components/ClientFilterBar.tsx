import React from 'react';
import { XIcon, DownloadIcon } from '../../../constants';
import { PaymentStatus } from '../../../types';

interface ClientFilterBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    monthFilter: string;
    setMonthFilter: (month: string) => void;
    dateFrom: string;
    setDateFrom: (date: string) => void;
    dateTo: string;
    setDateTo: (date: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    onDownloadCSV: () => void;
}

export const ClientFilterBar: React.FC<ClientFilterBarProps> = ({
    searchTerm,
    setSearchTerm,
    monthFilter,
    setMonthFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    statusFilter,
    setStatusFilter,
    onDownloadCSV,
}) => {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-[0_9px_17.5px_rgba(0,0,0,0.05)] border border-[#EAEFF4] flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 md:gap-4 mobile-filter-section">
            <div className="flex flex-col sm:flex-row w-full gap-2 sm:gap-3">
                <div className="flex-grow w-full relative">
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full rounded-xl border border-[#EAEFF4] bg-[#F4F6F9] focus:bg-white focus:border-[#5D87FF] p-3 text-sm text-[#2A3547] placeholder-[#5A6A85] outline-none transition-all"
                        placeholder="Cari pengantin..."
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                        <input
                            type="month"
                            value={monthFilter}
                            onChange={e => setMonthFilter(e.target.value)}
                            className="rounded-xl border border-[#EAEFF4] bg-[#F4F6F9] focus:bg-white focus:border-[#5D87FF] p-3 text-sm text-[#2A3547] w-full outline-none transition-all"
                            title="Filter per Bulan"
                        />
                        {monthFilter && (
                            <button
                                onClick={() => setMonthFilter('')}
                                className="p-3 text-[#FA896B] hover:bg-[#FDEDE8] rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                                title="Hapus filter bulan"
                            >
                                <XIcon className="w-5 h-5 flex-shrink-0" />
                            </button>
                        )}
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="rounded-xl border border-[#EAEFF4] bg-[#F4F6F9] focus:bg-white focus:border-[#5D87FF] p-3 text-sm text-[#2A3547] w-full sm:w-40 outline-none transition-all"
                    >
                        <option value="Semua Status">Semua Status</option>
                        {Object.values(PaymentStatus).map(s => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={onDownloadCSV}
                        className="bg-[#ECF2FF] hover:bg-[#d8e6ff] text-[#5D87FF] font-semibold p-3 rounded-xl inline-flex items-center justify-center gap-2 w-full sm:w-auto text-sm transition-colors flex-shrink-0"
                        title="Unduh data pengantin"
                    >
                        <DownloadIcon className="w-5 h-5 flex-shrink-0" />
                        <span className="sm:hidden">Unduh</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientFilterBar;
