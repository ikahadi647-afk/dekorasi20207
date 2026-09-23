import React from 'react';
import { PencilIcon, Trash2Icon } from '../../../constants';

interface CategoryManagerProps {
    title: string;
    categories: string[];
    inputValue: string;
    onInputChange: (value: string) => void;
    onAddOrUpdate: () => void;
    onEdit: (value: string) => void;
    onDelete: (value: string) => void;
    editingValue: string | null;
    onCancelEdit: () => void;
    placeholder: string;
    suggestedDefaults?: string[];
    onAddSuggested?: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ 
    title, categories, inputValue, onInputChange, onAddOrUpdate, onEdit, onDelete, 
    editingValue, onCancelEdit, placeholder, suggestedDefaults, onAddSuggested 
}) => {

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onAddOrUpdate();
        }
    };

    const renderCategoryItem = (category: string) => (
        <div key={category} className="flex items-center justify-between p-3 bg-[#F4F6F9] rounded-xl">
            <span className="text-xs md:text-sm text-[#2A3547] truncate flex-1 mr-2">{category}</span>
            <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
                <button type="button" onClick={() => onEdit(category)} className="p-1.5 text-[#5A6A85] hover:text-[#5D87FF] hover:bg-white rounded-full transition-colors" title="Edit"><PencilIcon className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                <button type="button" onClick={() => onDelete(category)} className="p-1.5 text-[#5A6A85] hover:text-[#FA896B] hover:bg-white rounded-full transition-colors" title="Hapus"><Trash2Icon className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
            </div>
        </div>
    );

    return (
        <div className="bg-white p-4 rounded-2xl border border-[#EAEFF4] shadow-sm">
            <h3 className="text-sm md:text-lg font-black text-[#2A3547] border-b border-[#EAEFF4] pb-3 mb-4">{title}</h3>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <div className="input-group flex-grow !mt-0">
                    <input
                        type="text"
                        id={`input-${title.replace(/\\s/g, '')}`}
                        value={inputValue}
                        onChange={e => onInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder=" "
                        className="input-field"
                    />
                    <label htmlFor={`input-${title.replace(/\\s/g, '')}`} className="input-label">{placeholder}</label>
                </div>
                <div className="flex gap-2">
                    <button onClick={onAddOrUpdate} className="bg-[#5D87FF] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#4a6edb] transition-colors">{editingValue ? 'Update' : 'Tambah'}</button>
                    {editingValue && <button onClick={onCancelEdit} className="bg-[#F4F6F9] text-[#5A6A85] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#e2e8f0] transition-colors">Batal</button>}
                </div>
            </div>
            {suggestedDefaults?.length && onAddSuggested && (
                <div className="mb-4">
                    <button type="button" onClick={onAddSuggested} className="text-xs md:text-sm text-[#5D87FF] font-medium hover:underline">
                        + Tambah dari saran default
                    </button>
                </div>
            )}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {categories && categories.length > 0 ? categories.map(cat => renderCategoryItem(cat)) : (
                    <div className="text-center text-[#5A6A85] text-xs py-4 italic">
                        Belum ada {title.toLowerCase()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryManager;
