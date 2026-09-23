import React from 'react';
import { Project, ProjectStatusConfig, Client } from '../../../types';
import ProjectCard from './ProjectCard';
import { EyeIcon } from '../../../constants';
import { PencilIcon, Trash2Icon, ArrowDownIcon } from 'lucide-react';
import { getStatusColor, getStatusClass, getSubStatusText, getDisplayProgress } from '../utils/projectHelpers';

export interface ProjectListViewProps {
    projects: Project[];
    handleOpenDetailModal: (project: Project) => void;
    handleOpenForm: (mode: 'edit', project: Project) => void;
    handleProjectDelete: (projectId: string) => void;
    config: ProjectStatusConfig[];
    clients: Client[];
    handleQuickStatusChange: (projectId: string, newStatus: string, notifyClient: boolean) => Promise<void>;
    handleSendMessage: (project: Project) => void;
    hasMore: boolean;
    isLoadingMore: boolean;
    onLoadMore: () => void;
}

export const ProjectListView: React.FC<ProjectListViewProps> = ({
    projects, handleOpenDetailModal, handleOpenForm, handleProjectDelete,
    config, clients, handleQuickStatusChange, handleSendMessage,
    hasMore, isLoadingMore, onLoadMore
}) => {
    const ProgressBar: React.FC<{ progress: number, status: string, config: ProjectStatusConfig[] }> = ({ progress, status, config }) => (
        <div className="w-full bg-[#F4F6F9] rounded-full h-2 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: getStatusColor(status, config) }}></div>
        </div>
    );

    return (
        <div>
            {/* Mobile cards - Using ProjectCard Component */}
            <div className="md:hidden space-y-3 p-3">
                {projects.map(p => {
                    const client = clients.find(c => c.id === p.clientId);
                    return (
                        <ProjectCard
                            key={p.id}
                            project={p}
                            client={client}
                            projectStatusConfig={config}
                            onStatusChange={(projectId, newStatus) => handleQuickStatusChange(projectId, newStatus, false)}
                            onViewDetails={handleOpenDetailModal}
                            onEdit={(project) => handleOpenForm('edit', project)}
                            onSendMessage={handleSendMessage}
                        />
                    );
                })}
                {projects.length === 0 && <p className="text-center py-8 text-sm text-[#5A6A85]">Tidak ada Acara Pernikahan dalam kategori ini.</p>}
            </div>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto w-full">
                <table className="w-full text-xs lg:text-sm text-left">
                    <thead className="text-xs text-[#5A6A85] uppercase bg-[#F4F6F9]/80 border-b border-[#EAEFF4]">
                        <tr>
                            <th className="px-3 lg:px-4 py-3.5 font-bold tracking-wider text-center w-12">No</th>
                            <th className="px-3 lg:px-6 py-3.5 font-bold tracking-wider">Nama Acara Pernikahan</th>
                            <th className="px-3 lg:px-6 py-3.5 font-bold tracking-wider">Pengantin</th>
                            <th className="px-3 lg:px-6 py-3.5 font-bold tracking-wider">Tanggal</th>
                            <th className="px-3 lg:px-6 py-3.5 font-bold tracking-wider min-w-[140px] lg:min-w-[200px]">Progress</th>
                            <th className="px-3 lg:px-6 py-3.5 font-bold tracking-wider">Tim</th>
                            <th className="px-3 lg:px-6 py-3.5 font-bold tracking-wider text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAEFF4]">
                        {projects.map((p, index) => (
                            <tr key={p.id} className="hover:bg-[#F4F6F9]/50 transition-colors">
                                <td className="px-3 lg:px-4 py-3.5 text-center font-bold text-[#5A6A85]">{index + 1}</td>
                                <td className="px-3 lg:px-6 py-3.5">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-[#2A3547] text-sm">{p.projectName}</p>
                                    </div>
                                    <p className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${getStatusClass(p.status, config)}`}>
                                        {getSubStatusText(p)}
                                    </p>
                                </td>
                                <td className="px-3 lg:px-6 py-3.5 text-[#5A6A85] font-medium">{p.clientName}</td>
                                <td className="px-3 lg:px-6 py-3.5 text-[#5A6A85] font-medium whitespace-nowrap">{new Date(p.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                <td className="px-3 lg:px-6 py-3.5">
                                    <div className="flex items-center gap-2">
                                        <ProgressBar progress={getDisplayProgress(p, config)} status={p.status} config={config} />
                                        <span className="text-xs font-bold text-[#5A6A85] min-w-[32px] text-right">{getDisplayProgress(p, config)}%</span>
                                    </div>
                                </td>
                                <td className="px-3 lg:px-6 py-3.5 text-[#5A6A85] font-medium max-w-[120px] lg:max-w-none truncate">{p.team.map(t => t.name.split(' ')[0]).join(', ') || '-'}</td>
                                <td className="px-3 lg:px-6 py-3.5">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <button onClick={() => handleOpenDetailModal(p)} className="w-8 h-8 rounded-xl bg-[#ECF2FF] hover:bg-[#5D87FF] text-[#5D87FF] hover:text-white flex items-center justify-center transition-all" title="Detail Acara Pernikahan"><EyeIcon className="w-4 h-4 flex-shrink-0" /></button>
                                        <button onClick={() => handleOpenForm('edit', p)} className="w-8 h-8 rounded-xl bg-[#FEF5E5] hover:bg-[#FFAE1F] text-[#FFAE1F] hover:text-white flex items-center justify-center transition-all" title="Edit Acara Pernikahan"><PencilIcon className="w-4 h-4 flex-shrink-0" /></button>
                                        <button onClick={() => handleProjectDelete(p.id)} className="w-8 h-8 rounded-xl bg-[#FDEDE8] hover:bg-[#FA896B] text-[#FA896B] hover:text-white flex items-center justify-center transition-all" title="Hapus Acara Pernikahan"><Trash2Icon className="w-4 h-4 flex-shrink-0" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {hasMore && (
                <div className="mt-6 flex justify-center pb-6">
                    <button
                        onClick={onLoadMore}
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
    );
};

export interface ProjectKanbanViewProps {
    projects: Project[];
    handleOpenDetailModal: (project: Project) => void;
    draggedProjectId: string | null;
    handleDragStart: (e: React.DragEvent<HTMLDivElement>, projectId: string) => void;
    handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDrop: (e: React.DragEvent<HTMLDivElement>, newStatus: string) => void;
    config: ProjectStatusConfig[];
}

export const ProjectKanbanView: React.FC<ProjectKanbanViewProps> = ({
    projects, handleOpenDetailModal, draggedProjectId,
    handleDragStart, handleDragOver, handleDrop, config
}) => {
    const ProgressBar: React.FC<{ progress: number, status: string, config: ProjectStatusConfig[] }> = ({ progress, status, config }) => (
        <div className="w-full bg-[#F4F6F9] rounded-full h-2 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: getStatusColor(status, config) }}></div>
        </div>
    );

    return (
        <div className="flex gap-4 md:gap-5 overflow-x-auto pb-4 overscroll-x-contain scroll-smooth projects-kanban-scroll hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
            {config
                .filter(statusConfig => statusConfig.name !== 'Dibatalkan')
                .map(statusConfig => {
                    const status = statusConfig.name;
                    return (
                        <div
                            key={status}
                            className="w-72 min-w-[280px] md:w-80 flex-shrink-0 bg-[#F4F6F9] rounded-2xl border border-[#EAEFF4] snap-start"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, status)}
                        >
                            <div className="p-3.5 font-bold text-[#2A3547] border-b-2 flex justify-between items-center sticky top-0 bg-[#F4F6F9]/90 backdrop-blur-sm rounded-t-2xl z-10" style={{ borderBottomColor: getStatusColor(status, config) }}>
                                <span className="text-sm">{status}</span>
                                <span className="text-xs font-bold bg-white text-[#5A6A85] px-2.5 py-0.5 rounded-full shadow-xs">{projects.filter(p => p.status === status).length}</span>
                            </div>
                            <div className="p-3 space-y-3 min-h-[200px] h-[calc(100vh-380px)] sm:h-[calc(100vh-420px)] overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                                {projects
                                    .filter(p => p.status === status)
                                    .map(p => (
                                        <div
                                            key={p.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, p.id)}
                                            onClick={() => handleOpenDetailModal(p)}
                                            className={`p-4 bg-white rounded-xl cursor-grab border-l-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-md transition-all ${draggedProjectId === p.id ? 'opacity-50 ring-2 ring-[#5D87FF]' : 'opacity-100'}`}
                                            style={{ borderLeftColor: getStatusColor(p.status, config) }}
                                        >
                                            <p className="font-bold text-sm text-[#2A3547]">{p.projectName}</p>
                                            <p className="text-xs text-[#5A6A85] mt-1">{p.clientName}</p>
                                            <p className="text-xs font-bold text-[#2A3547] mt-1 mb-2">
                                                {getSubStatusText(p)}
                                            </p>
                                            <ProgressBar progress={getDisplayProgress(p, config)} status={p.status} config={config} />
                                            <div className="flex justify-between items-center mt-3 text-xs">
                                                <span className="text-[#5A6A85] font-medium">{new Date(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    );
                })
            }
        </div>
    );
};
