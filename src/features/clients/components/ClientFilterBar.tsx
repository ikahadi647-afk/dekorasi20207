import React from 'react';
import { XIcon, DownloadIcon } from '../../../constants';
import { PaymentStatus, ClientStatus } from '../../../types';

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
    const hasActiveFilters = searchTerm || monthFilter || dateFrom || dateTo || statusFilter !== 'Semua Status';
    
    const clearAllFilters = () => {
        setSearchTerm('');
        setMonthFilter('');
        setDateFrom('');
        setDateTo('');
        setStatusFilter('Semua Status');
    };

    return (
        <div className="bg-white p-4 rounded-2xl shadow-[0_9px_17.5px_rgba(0,0,0,0.05)] border border-[#EAEFF4]">
            <div className="flex items-center gap-2 flex-wrap">
                {/* Search Box */}
                <div className="relative flex-1 min-w-[200px]">
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full rounded-xl border border-[#EAEFF4] bg-[#F4F6F9] focus:bg-white focus:border-[#5D87FF] p-2.5 pr-9 text-sm text-[#2A3547] placeholder-[#5A6A85] outline-none transition-all"
                        placeholder="Cari nama, email, HP..."
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#FA896B] hover:text-[#e67458] transition-colors"
                            title="Hapus pencarian"
                        >
                            <XIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Month Filter */}
                <input
                    type="month"
                    value={monthFilter}
                    onChange={e => setMonthFilter(e.target.value)}
                    className="rounded-xl border border-[#EAEFF4] bg-[#F4F6F9] focus:bg-white focus:border-[#5D87FF] p-2.5 text-sm text-[#2A3547] outline-none transition-all w-[160px]"
                    title="Filter per Bulan"
                />

                {/* Date From */}
                <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="rounded-xl border border-[#EAEFF4] bg-[#F4F6F9] focus:bg-white focus:border-[#5D87FF] p-2.5 text-sm text-[#2A3547] outline-none transition-all w-[150px]"
                    title="Dari Tanggal"
                />

                {/* Separator */}
                {(dateFrom || dateTo) && <span className="text-[#5A6A85] text-sm font-medium">→</span>}

                {/* Date To */}
                <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="rounded-xl border border-[#EAEFF4] bg-[#F4F6F9] focus:bg-white focus:border-[#5D87FF] p-2.5 text-sm text-[#2A3547] outline-none transition-all w-[150px]"
                    title="Sampai Tanggal"
                />

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-[#EAEFF4] bg-[#F4F6F9] focus:bg-white focus:border-[#5D87FF] p-2.5 text-sm text-[#2A3547] outline-none transition-all w-[180px]"
                >
                    <option value="Semua Status">Semua Status</option>
                    <optgroup label="Status Pengantin">
                        {Object.values(ClientStatus).map(s => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </optgroup>
                    <optgroup label="Status Pembayaran">
                        {Object.values(PaymentStatus).map(s => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </optgroup>
                </select>

                {/* Spacer untuk push buttons ke kanan */}
                <div className="flex-1 min-w-[20px]"></div>

                {/* Clear All Filters Button */}
                {hasActiveFilters && (
                    <button
                        onClick={clearAllFilters}
                        className="bg-[#FDEDE8] hover:bg-[#FA896B] text-[#FA896B] hover:text-white font-semibold px-3 py-2.5 rounded-xl inline-flex items-center justify-center gap-1.5 text-sm transition-all whitespace-nowrap"
                        title="Hapus semua filter"
                    >
                        <XIcon className="w-4 h-4" />
                        <span>Reset</span>
                    </button>
                )}

                {/* Download CSV Button */}
                <button
                    onClick={onDownloadCSV}
                    className="bg-[#ECF2FF] hover:bg-[#d8e6ff] text-[#5D87FF] font-semibold px-3 py-2.5 rounded-xl inline-flex items-center justify-center gap-1.5 text-sm transition-colors whitespace-nowrap"
                    title="Unduh data pengantin"
                >
                    <DownloadIcon className="w-4 h-4" />
                    <span>Unduh</span>
                </button>
            </div>
        </div>
    );
};

export default ClientFilterBar;
