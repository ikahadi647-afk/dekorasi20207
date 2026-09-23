import React from 'react';
import { Project, Profile, Package, Client, PaymentStatus, PhysicalItem } from '../../../types';

interface InvoiceDocumentProps {
  project: Project;
  profile: Profile;
  packages: Package[];
  client?: Client;
  id?: string;
}

const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  project,
  profile,
  packages = [],
  client,
  id = "invoice-document"
}) => {
  const safeProfile = profile || ({} as Partial<Profile>);
  const safePackages = packages || [];
  // Helper to format currency (Indonesian Rupiah)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper to format date (Indonesian style)
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Tanpa Tanggal';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  const subtotal = project.totalCost + (project.discountAmount || 0);
  const addOnsTotal = (project.addOns || []).reduce((acc, curr) => acc + (curr.price || 0), 0);
  const customCostsTotal = (project.customCosts || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const packagePrice = Math.max(0, subtotal - addOnsTotal - (Number(project.transportCost) || 0) - customCostsTotal);

  // Find the package description
  const mainPackage = safePackages.find(p => p.id === project.packageId || p.name === project.packageName);
  let displayDigitalItems: string[] = [];
  let displayPhysicalItems: PhysicalItem[] = [];
  if (mainPackage) {
    const selectedOption = mainPackage.durationOptions?.find(opt => opt.label === project.durationSelection);

    // Try to get from selected option first
    if (selectedOption) {
      if (selectedOption.digitalItems && selectedOption.digitalItems.length > 0) {
        displayDigitalItems = selectedOption.digitalItems;
      }
      if (selectedOption.physicalItems && selectedOption.physicalItems.length > 0) {
        displayPhysicalItems = selectedOption.physicalItems;
      }
    }

    // Fallback to main package digital items
    if (displayDigitalItems.length === 0 && mainPackage.digitalItems && mainPackage.digitalItems.length > 0) {
      displayDigitalItems = mainPackage.digitalItems;
    }

    // Fallback to main package physical items
    if (displayPhysicalItems.length === 0 && mainPackage.physicalItems && mainPackage.physicalItems.length > 0) {
      displayPhysicalItems = mainPackage.physicalItems;
    }
  }

  return (
    <div id={id} className="invoice-container bg-white rounded-none border border-slate-200 shadow-xl overflow-visible print:shadow-none print:border-none print:bg-white print:rounded-none mx-auto w-full min-w-[600px] font-sans text-slate-900">
      {/* Professional Header Section */}
      <div className="invoice-header avoid-break p-6 border-b-4 border-brand-accent bg-slate-50 print:bg-white print:p-0 print:pt-4 print:pb-4">
        <div className="flex flex-row justify-between items-start gap-4">
          <div className="flex flex-col gap-2 flex-1">
            {safeProfile.logoBase64 ? (
              <img
                src={safeProfile.logoBase64}
                alt={safeProfile.companyName || 'Logo'}
                className="invoice-logo max-h-16 sm:max-h-20 object-contain self-start"
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-accent flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{safeProfile.companyName?.charAt(0) || 'V'}</span>
                </div>
                <h1 className="text-xl font-bold text-slate-800">{safeProfile.companyName || 'Vendor'}</h1>
              </div>
            )}
            <div className="text-[11px] leading-relaxed text-slate-500 max-w-[280px] print:text-black">
              <p className="font-bold text-slate-700 print:text-black">{safeProfile.companyName}</p>
              <p>{safeProfile.address}</p>
              <p>{safeProfile.phone} • {safeProfile.email}</p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end shrink-0">
            <h2 className="text-3xl font-black text-brand-accent tracking-tighter mb-1.5">INVOICE</h2>
            <div className="bg-slate-200 px-3 py-1 rounded-sm text-[11px] font-bold text-slate-700 mb-2 print:bg-white print:border print:border-slate-300">
              ID: #INV-{project.id.slice(-8).toUpperCase()}
            </div>
            <div className="text-[11px] text-slate-500 text-right space-y-0.5 print:text-black">
              <p>Diterbitkan: <span className="font-bold text-slate-700 print:text-black">{formatDate(project.date)}</span></p>
              <p>Status: <span className={`font-bold ${project.paymentStatus === PaymentStatus.LUNAS ? 'text-green-600' : 'text-orange-600'} print:text-black uppercase`}>{project.paymentStatus}</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5 print:p-0 print:pt-4">
        {/* Billing Grid */}
        <div className="invoice-section avoid-break grid grid-cols-2 gap-6 border-b border-slate-100 pb-4 print:border-slate-200">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 print:text-slate-500">Tagihan Untuk</h4>
            <div className="space-y-1">
              <p className="text-base font-bold text-slate-800 print:text-black">{project.clientName}</p>
              {client && (
                <div className="text-[11px] text-slate-600 print:text-black space-y-0.5">
                  <p>{client.phone}</p>
                  <p>{client.email}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 print:text-slate-500">Detail Layanan</h4>
            <div className="space-y-1">
              <p className="text-base font-bold text-slate-800 print:text-black">{project.projectName}</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-600 print:text-black">
                <p><span className="text-slate-400 font-medium">Lokasi:</span> {project.location}</p>
                <p><span className="text-slate-400 font-medium">Tipe:</span> {project.projectType}</p>
                {project.address && <p className="col-span-2"><span className="text-slate-400 font-medium">Alamat:</span> {project.address}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Item Table */}
        <div className="invoice-table-wrapper mb-6">
          <table className="invoice-table-tight w-full text-left">
            <colgroup>
              <col style={{ width: '8%' }} />
              <col style={{ width: '70%' }} />
              <col style={{ width: '22%' }} />
            </colgroup>
            <thead>
              <tr className="bg-slate-100 border-b border-black print:bg-slate-50">
                <th className="px-3 py-2 text-center text-[10px] font-black text-black uppercase tracking-widest border-r border-black">No</th>
                <th className="px-3 py-2 text-[10px] font-black text-black uppercase tracking-widest border-r border-black">Deskripsi Produk / Layanan</th>
                <th className="px-3 py-2 text-right text-[10px] font-black text-black uppercase tracking-widest">Total Harga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black print:divide-black text-[12px]">
              <tr className="align-top bg-white">
                <td className="px-3 py-2 text-center text-slate-800 font-medium border-r border-black">1</td>
                <td className="px-3 py-2 border-r border-black">
                  <div className="flex flex-col">
                    <p className="font-bold text-slate-800 text-[13px] print:text-black">{project.packageName}</p>
                    {displayDigitalItems.length > 0 ? (
                      <div className="mt-1 space-y-0.5">
                        {displayDigitalItems.map((item, idx) => (
                          <p key={idx} className="text-[10px] text-slate-500 leading-tight flex items-start gap-1">
                            <span className="shrink-0">•</span>
                            <span>{item}</span>
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 mt-0.5 italic">Package utama layanan profesional</p>
                    )}

                    {displayPhysicalItems.length > 0 && (
                      <div className="mt-1.5 pt-1.5 border-t border-slate-200 space-y-0.5">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Vendor (Allpackage):</p>
                        {displayPhysicalItems.map((item, idx) => (
                          <p key={idx} className="text-[10px] text-slate-500 leading-tight flex items-start gap-1">
                            <span className="shrink-0">•</span>
                            <span>{item.name}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-right font-bold text-slate-800 text-[12px] whitespace-nowrap print:text-black">{formatCurrency(packagePrice)}</td>
              </tr>
              {project.addOns?.map((addon, idx) => (
                <tr key={addon.id} className="align-top bg-white">
                  <td className="px-3 py-2 text-center text-slate-800 font-medium border-r border-black">{2 + idx}</td>
                  <td className="px-3 py-2 border-r border-black">
                    <div className="flex flex-col">
                      <p className="font-medium text-slate-800 text-[12px] print:text-black">{addon.name}</p>
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">Add-on Item</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-slate-800 text-[12px] whitespace-nowrap print:text-black">{formatCurrency(addon.price)}</td>
                </tr>
              ))}
              {project.transportCost && Number(project.transportCost) > 0 && (
                <tr className="align-top bg-white">
                  <td className="px-3 py-2 text-center text-slate-800 font-medium border-r border-black">{(project.addOns?.length || 0) + 2}</td>
                  <td className="px-3 py-2 border-r border-black">
                    <div className="flex flex-col">
                      <p className="font-medium text-slate-800 text-[12px] print:text-black">Biaya Transport</p>
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">Logistik & Operasional</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-slate-800 text-[12px] whitespace-nowrap print:text-black">{formatCurrency(Number(project.transportCost))}</td>
                </tr>
              )}
              {project.customCosts?.map((cost, idx) => {
                const transportOffset = (project.transportCost && Number(project.transportCost) > 0) ? 1 : 0;
                const rowNo = 2 + (project.addOns?.length || 0) + transportOffset + idx;
                return (
                  <tr key={cost.id} className="align-top bg-white">
                    <td className="px-3 py-2 text-center text-slate-800 font-medium border-r border-black">{rowNo}</td>
                    <td className="px-3 py-2 border-r border-black">
                      <div className="flex flex-col">
                        <p className="font-medium text-slate-800 text-[12px] print:text-black">{cost.description}</p>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-slate-800 text-[12px] whitespace-nowrap print:text-black">{formatCurrency(cost.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="invoice-totals avoid-break flex flex-row justify-between items-start gap-4 border-t border-slate-100 pt-4 print:border-slate-200">
          <div className="flex-1">
            <div className="bg-slate-50 p-3.5 rounded border border-slate-100 print:bg-white print:border-slate-200">
              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Informasi Pembayaran</h5>
              <p className="text-[12px] font-bold text-slate-800 mb-1 print:text-black">{safeProfile.bankAccount}</p>
              <p className="text-[10px] text-slate-500 leading-relaxed print:text-black">Silakan kirimkan bukti transfer melalui Whatsapp atau Portal Client setelah melakukan pembayaran.</p>
            </div>
            <div className="mt-2.5 text-[9.5px] text-slate-400 italic leading-relaxed print:text-slate-500 whitespace-pre-line">
              &quot;{safeProfile.termsAndConditions || 'Terima kasih telah mempercayai layanan kami. Kepuasan Anda adalah prioritas kami.'}&quot;
            </div>
          </div>

          <div className="w-[280px] shrink-0 space-y-1.5">
            <div className="flex justify-between text-[12px] text-slate-600 px-2 print:text-black">
              <span>Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            {project.discountAmount ? (
              <div className="flex justify-between text-[12px] text-red-600 px-2 font-medium">
                <span>Diskon</span>
                <span>-{formatCurrency(project.discountAmount)}</span>
              </div>
            ) : null}
            <div className="h-px bg-slate-200 my-1" />
            <div className="flex justify-between px-2.5 py-1.5 bg-slate-100 rounded print:bg-white print:border print:border-slate-200">
              <span className="text-[11px] font-black text-slate-600 uppercase print:text-black">Grand Total</span>
              <span className="text-lg font-black text-brand-accent print:text-black tracking-tight">{formatCurrency(project.totalCost)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-green-600 px-2 pt-0.5 font-bold">
              <span>Sudah Dibayar</span>
              <span>{formatCurrency(project.amountPaid || 0)}</span>
            </div>
            <div className="flex justify-between px-2.5 py-1.5 border-2 border-brand-accent/20 rounded-md mt-1 bg-brand-accent/5 print:bg-white print:border-slate-800">
              <span className="text-[11px] font-black text-brand-accent uppercase print:text-black">Sisa Tagihan</span>
              <span className="text-base font-black text-brand-accent print:text-black tracking-tight">{formatCurrency(project.totalCost - (project.amountPaid || 0))}</span>
            </div>
          </div>
        </div>

        {/* Footer / Signatures */}
        <div className="invoice-signature-section avoid-break grid grid-cols-3 gap-6 pt-4 border-t border-slate-100 print:border-slate-200">
          <div className="col-span-2 flex items-end justify-center pb-2">
            <p className="text-[9px] text-slate-400 text-center uppercase tracking-widest font-black">Dicetak Otomatis oleh Sistem Portofolio Weddfin</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hormat Kami,</p>
            <div className="h-14 flex items-center justify-center">
              {safeProfile.signatureBase64 ? (
                <img src={safeProfile.signatureBase64} alt="Tanda Tangan" className="max-h-full object-contain grayscale" />
              ) : (
                <div className="h-px w-24 bg-slate-200 mx-auto mt-6 print:bg-slate-300" />
              )}
            </div>
            <p className="text-[12px] font-bold text-slate-800 mt-1.5 print:text-black underline underline-offset-4 decoration-slate-300">{safeProfile.authorizedSigner}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5 tracking-tighter">{safeProfile.companyName}</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        /* Explicitly style and protect the invoice document from outside index.css pollution */
        #${id}, .invoice-container {
          width: 100% !important;
          max-width: 800px;
          box-sizing: border-box !important;
          background-color: #ffffff !important;
          color: #0f172a !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
          -webkit-font-smoothing: antialiased !important;
          overflow: visible !important;
        }
        .force-desktop,
        .html2pdf__container #${id},
        .html2pdf__container .invoice-container {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          margin: 0 !important;
          box-shadow: none !important;
          border-left: none !important;
          border-right: none !important;
          overflow: visible !important;
        }
        #${id} *, .invoice-container * {
          box-sizing: border-box !important;
        }
        #${id} .invoice-table-wrapper, .invoice-container .invoice-table-wrapper {
          page-break-inside: auto !important;
          break-inside: auto !important;
          overflow: visible !important;
          border: none !important;
        }
        #${id} table, .invoice-container table {
          border-collapse: collapse !important;
          border: 1.5px solid #000000 !important;
          width: 100% !important;
          table-layout: fixed !important;
          background-color: #ffffff !important;
          page-break-inside: auto !important;
          break-inside: auto !important;
        }
        #${id} thead, .invoice-container thead {
          display: table-header-group !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        #${id} thead tr, .invoice-container thead tr {
          background-color: #f8fafc !important;
          border-bottom: 1.5px solid #000000 !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        #${id} thead th, .invoice-container thead th {
          background-color: #f8fafc !important;
          border: 1px solid #000000 !important;
          border-top: none !important;
          padding: 7px 10px !important;
          font-size: 10px !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          color: #000000 !important;
        }
        #${id} tbody, .invoice-container tbody {
          page-break-inside: auto !important;
          break-inside: auto !important;
        }
        #${id} tbody tr, .invoice-container tbody tr {
          background-color: #ffffff !important;
          border-bottom: 1px solid #000000 !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        #${id} tbody tr:nth-child(even), .invoice-container tbody tr:nth-child(even) {
          background-color: #ffffff !important;
        }
        #${id} {
          width: 100% !important;
          max-width: 800px;
          box-sizing: border-box !important;
          background-color: #ffffff !important;
        }
        .force-desktop,
        .html2pdf__container #${id} {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          margin: 0 !important;
          box-shadow: none !important;
        }
        #${id} tbody td, .invoice-container tbody td {
          border: 1px solid #000000 !important;
          padding: 6px 10px !important;
          background-color: #ffffff !important;
          vertical-align: top !important;
          color: #000000 !important;
        }
        #${id} p, .invoice-container p {
          margin: 0 !important;
          line-height: 1.4 !important;
        }
        .avoid-break {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .html2pdf-pad-row td {
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
          background: transparent !important;
        }

        @media print {
          @page {
            margin: 6mm 8mm !important;
            size: A4 portrait;
          }
          body * { 
            visibility: hidden !important; 
          }
          #${id}, #${id} * { 
            visibility: visible !important; 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #${id} {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}} />
    </div>
  );
};

export default InvoiceDocument;
