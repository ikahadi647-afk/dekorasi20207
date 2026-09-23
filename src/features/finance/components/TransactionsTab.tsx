import React from 'react';
import { FinancialPocket, Transaction, TransactionType } from '../../../types';
import { formatCurrency } from '../../../utils/currency';
import { DownloadIcon, PencilIcon, Trash2Icon, ArrowDownIcon } from '../../../constants';

interface CategoryTotals {
    income: { [key: string]: number };
    expense: { [key: string]: number };
}

interface TransactionsTabProps {
    monthlyBudgetPocket?: FinancialPocket;
    onTutupAnggaran: () => void;
    categoryTotals: CategoryTotals;
    categoryFilter: { type: TransactionType | 'all'; category: string };
    setCategoryFilter: (filter: { type: TransactionType | 'all'; category: string }) => void;
    filters: { searchTerm: string; dateFrom: string; dateTo: string };
    handleFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDownloadTransactionsCSV: () => void;
    filteredSummary: { income: number; expense: number; net: number };
    filteredTransactions: Transaction[];
    getTransactionSubDescription: (t: Transaction) => string | null;
    onOpenModal: (type: 'transaction', mode: 'add' | 'edit', data?: any) => void;
    onDeleteTransaction: (id: string) => void;
    hasMore: boolean;
    loadMoreTransactions: () => void;
    isLoadingMore: boolean;
}

const CategoryButton: React.FC<{
    type: TransactionType;
    categoryName: string;
    amount: number;
    isActive: boolean;
    onClick: () => void;
}> = ({ type, categoryName, amount, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex justify-between items-center text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            isActive ? 'bg-[#ECF2FF] text-[#5D87FF] font-bold' : 'text-[#2A3547] hover:bg-[#F4F6F9]'
        }`}
    >
        <span className="truncate">{categoryName}</span>
        <span
            className={`font-bold text-xs ${
                amount > 0
                    ? type === TransactionType.INCOME
                        ? 'text-[#13DEB9]'
                        : 'text-[#FA896B]'
                    : 'text-[#5A6A85]'
            }`}
        >
            {new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(amount)}
        </span>
    </button>
);

const TransactionsTab: React.FC<TransactionsTabProps> = ({
    monthlyBudgetPocket,
    onTutupAnggaran,
    categoryTotals,
    categoryFilter,
    setCategoryFilter,
    filters,
    handleFilterChange,
    handleDownloadTransactionsCSV,
    filteredSummary,
    filteredTransactions,
    getTransactionSubDescription,
    onOpenModal,
    onDeleteTransaction,
    hasMore,
    loadMoreTransactions,
    isLoadingMore
}) => {
    const allIncomeTotal: number = Object.keys(categoryTotals.income).reduce(
        (sum: number, key: string) => sum + categoryTotals.income[key],
        0
    );
    const allExpenseTotal: number = Object.keys(categoryTotals.expense).reduce(
        (sum: number, key: string) => sum + categoryTotals.expense[key],
        0
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
            {/* Left Column: Category Filters & Budget */}
            <div className="lg:col-span-1 space-y-4">
                {monthlyBudgetPocket && (
                    <div className="bg-white p-5 rounded-2xl shadow-[0_9px_17.5px_rgba(0,0,0,0.05)] border border-[#EAEFF4]">
                        <h4 className="font-bold text-sm text-[#2A3547] mb-2">{monthlyBudgetPocket.name}</h4>
                        <p className="text-2xl font-bold text-[#5D87FF]">{formatCurrency(monthlyBudgetPocket.amount)}</p>
                        <p className="text-xs text-[#5A6A85] font-medium mt-1">
                            dari {formatCurrency(monthlyBudgetPocket.goalAmount || 0)}
                        </p>
                        <button onClick={onTutupAnggaran} className="w-full mt-3 bg-[#ECF2FF] hover:bg-[#d8e6ff] text-[#5D87FF] font-bold rounded-xl py-2 text-xs transition-all">
                            Tutup & Simpan Sisa
                        </button>
                    </div>
                )}
                <div className="bg-white p-4 rounded-2xl shadow-[0_9px_17.5px_rgba(0,0,0,0.05)] border border-[#EAEFF4]">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#5A6A85] mb-2 px-2">Pemasukan</h4>
                    <div className="space-y-1">
                        <CategoryButton
                            type={TransactionType.INCOME}
                            categoryName="Semua"
                            amount={allIncomeTotal}
                            isActive={categoryFilter.type === TransactionType.INCOME && categoryFilter.category === 'Semua'}
                            onClick={() => setCategoryFilter({ type: TransactionType.INCOME, category: 'Semua' })}
                        />
                        {Object.entries(categoryTotals.income).map(([name, amount]: [string, number]) => (
                            <CategoryButton
                                key={name}
                                type={TransactionType.INCOME}
                                categoryName={name}
                                amount={amount}
                                isActive={categoryFilter.type === TransactionType.INCOME && categoryFilter.category === name}
                                onClick={() => setCategoryFilter({ type: TransactionType.INCOME, category: name })}
                            />
                        ))}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-[0_9px_17.5px_rgba(0,0,0,0.05)] border border-[#EAEFF4]">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#5A6A85] mb-2 px-2">Pengeluaran</h4>
                    <div className="space-y-1">
                        <CategoryButton
                            type={TransactionType.EXPENSE}
                            categoryName="Semua"
                            amount={allExpenseTotal}
                            isActive={categoryFilter.type === TransactionType.EXPENSE && categoryFilter.category === 'Semua'}
                            onClick={() => setCategoryFilter({ type: TransactionType.EXPENSE, category: 'Semua' })}
                        />
                        {Object.entries(categoryTotals.expense).map(([name, amount]: [string, number]) => (
                            <CategoryButton
                                key={name}
                                type={TransactionType.EXPENSE}
                                categoryName={name}
                                amount={amount}
                                isActive={categoryFilter.type === TransactionType.EXPENSE && categoryFilter.category === name}
                                onClick={() => setCategoryFilter({ type: TransactionType.EXPENSE, category: name })}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Main Content */}
            <div className="lg:col-span-3 bg-white p-4 sm:p-6 rounded-2xl shadow-[0_9px_17.5px_rgba(0,0,0,0.05)] border border-[#EAEFF4]">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4 items-end">
                    <input
                        name="searchTerm"
                        value={filters.searchTerm}
                        onChange={handleFilterChange}
                        placeholder="Cari deskripsi, kategori..."
                        className="bg-white border border-[#EAEFF4] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#2A3547] placeholder:text-[#5A6A85]/60 focus:outline-none focus:border-[#5D87FF] transition-all sm:col-span-2 md:col-span-1"
                    />
                    <input
                        name="dateFrom"
                        value={filters.dateFrom}
                        onChange={handleFilterChange}
                        type="date"
                        className="bg-white border border-[#EAEFF4] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#2A3547] focus:outline-none focus:border-[#5D87FF] transition-all"
                        title="Dari Tanggal"
                    />
                    <input
                        name="dateTo"
                        value={filters.dateTo}
                        onChange={handleFilterChange}
                        type="date"
                        className="bg-white border border-[#EAEFF4] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#2A3547] focus:outline-none focus:border-[#5D87FF] transition-all"
                        title="Sampai Tanggal"
                    />
                    <div className="non-printable flex md:justify-end sm:col-span-2 md:col-span-1">
                        <button
                            onClick={handleDownloadTransactionsCSV}
                            className="bg-[#ECF2FF] hover:bg-[#d8e6ff] text-[#5D87FF] font-bold rounded-xl inline-flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 text-xs sm:text-sm transition-all"
                        >
                            <DownloadIcon className="w-4 h-4 flex-shrink-0" /> Unduh CSV
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 p-4 bg-[#F4F6F9] rounded-xl border border-[#EAEFF4]">
                    <div>
                        <p className="text-xs font-semibold text-[#5A6A85]">Pemasukan</p>
                        <p className="text-base sm:text-lg font-bold text-[#13DEB9]">{formatCurrency(filteredSummary.income)}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-[#5A6A85]">Pengeluaran</p>
                        <p className="text-base sm:text-lg font-bold text-[#FA896B]">{formatCurrency(filteredSummary.expense)}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-[#5A6A85]">Laba/Rugi Bersih</p>
                        <p className={`text-base sm:text-lg font-bold ${filteredSummary.net >= 0 ? 'text-[#13DEB9]' : 'text-[#FA896B]'}`}>{formatCurrency(filteredSummary.net)}</p>
                    </div>
                </div>
                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                    {filteredTransactions.map(t => {
                        const subDescription = getTransactionSubDescription(t);
                        return (
                            <div key={t.id} className="rounded-xl bg-white border border-[#EAEFF4] p-4 shadow-xs">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-bold text-[#2A3547] text-sm leading-tight">{t.description}</p>
                                        {subDescription && <p className="text-xs text-[#5A6A85] font-medium mt-0.5">{subDescription}</p>}
                                        <p className="text-[11px] text-[#5A6A85] mt-1">
                                            {new Date(t.date).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p
                                            className={`text-sm font-bold ${
                                                t.type === TransactionType.INCOME ? 'text-[#13DEB9]' : 'text-[#FA896B]'
                                            }`}
                                        >
                                            {formatCurrency(t.amount)}
                                        </p>
                                        <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#F4F6F9] text-[#5A6A85]">
                                            {t.category || '-'}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-[#EAEFF4] flex items-center justify-end gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onOpenModal('transaction', 'edit', t); }}
                                        className="bg-[#FEF5E5] hover:bg-[#FFAE1F] text-[#FFAE1F] hover:text-white font-bold rounded-xl text-xs px-3 py-1.5 flex items-center gap-1 transition-all"
                                        title="Edit Transaksi"
                                        aria-label={`Edit transaksi ${t.description}`}
                                    >
                                        <PencilIcon className="w-3.5 h-3.5 flex-shrink-0" /> Edit
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) onDeleteTransaction(t.id); }}
                                        className="bg-[#FDEDE8] hover:bg-[#FA896B] text-[#FA896B] hover:text-white font-bold rounded-xl text-xs px-3 py-1.5 flex items-center gap-1 transition-all"
                                        title="Hapus Transaksi"
                                        aria-label={`Hapus transaksi ${t.description}`}
                                    >
                                        <Trash2Icon className="w-3.5 h-3.5 flex-shrink-0" /> Hapus
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {filteredTransactions.length === 0 && (
                        <p className="text-center py-10 text-[#5A6A85] text-sm">Tidak ada transaksi yang cocok.</p>
                    )}
                </div>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-xs lg:text-sm">
                        <thead className="text-xs text-[#5A6A85] uppercase bg-[#F4F6F9]/80 border-b border-[#EAEFF4]">
                            <tr>
                                <th className="p-3 font-bold text-center w-12">No</th>
                                <th className="p-3 font-bold text-left">Tanggal</th>
                                <th className="p-3 font-bold text-left">Deskripsi</th>
                                <th className="p-3 font-bold text-left">Kategori</th>
                                <th className="p-3 font-bold text-right">Jumlah</th>
                                <th className="p-3 font-bold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EAEFF4]">
                            {filteredTransactions.map((t, index) => {
                                const subDescription = getTransactionSubDescription(t);
                                return (
                                    <tr key={t.id} className="hover:bg-[#F4F6F9]/50 transition-colors">
                                        <td className="p-3 text-center text-[#5A6A85] font-bold">{index + 1}</td>
                                        <td className="p-3 text-[#5A6A85] font-medium whitespace-nowrap">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                                        <td className="p-3">
                                            <p className="font-bold text-[#2A3547]">{t.description}</p>
                                            {subDescription && <p className="text-xs text-[#5A6A85] font-medium">{subDescription}</p>}
                                        </td>
                                        <td className="p-3">
                                            <span className="px-2.5 py-0.5 text-xs font-bold bg-[#F4F6F9] text-[#5A6A85] rounded-full">
                                                {t.category}
                                            </span>
                                        </td>
                                        <td
                                            className={`p-3 text-right font-bold ${
                                                t.type === TransactionType.INCOME ? 'text-[#13DEB9]' : 'text-[#FA896B]'
                                            }`}
                                        >
                                            {formatCurrency(t.amount)}
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onOpenModal('transaction', 'edit', t); }}
                                                    className="w-8 h-8 rounded-xl bg-[#FEF5E5] hover:bg-[#FFAE1F] text-[#FFAE1F] hover:text-white flex items-center justify-center transition-all"
                                                    title="Edit Transaksi"
                                                >
                                                    <PencilIcon className="w-4 h-4 flex-shrink-0" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) onDeleteTransaction(t.id); }}
                                                    className="w-8 h-8 rounded-xl bg-[#FDEDE8] hover:bg-[#FA896B] text-[#FA896B] hover:text-white flex items-center justify-center transition-all"
                                                    title="Hapus Transaksi"
                                                >
                                                    <Trash2Icon className="w-4 h-4 flex-shrink-0" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredTransactions.length === 0 && (
                        <p className="text-center py-10 text-[#5A6A85] text-sm">Tidak ada transaksi yang cocok.</p>
                    )}
                </div>

                {hasMore && filteredTransactions.length >= 10 && (
                    <div className="mt-6 flex justify-center pb-2">
                        <button
                            onClick={loadMoreTransactions}
                            disabled={isLoadingMore}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ECF2FF] hover:bg-[#d8e6ff] text-[#5D87FF] font-bold text-xs sm:text-sm transition-all disabled:opacity-50"
                        >
                            {isLoadingMore ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-[#5D87FF] border-t-transparent rounded-full animate-spin"></div>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <ArrowDownIcon className="w-4 h-4" />
                                    Muat Lebih Banyak
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionsTab;
