
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import GradientButton from '../components/GradientButton';

interface PersonalizationPageProps {
  lang: Language;
  initialTemplates: any[];
  onUpdateTemplates: (tpls: any[]) => void;
}

type ElementType = 'logo' | 'variable' | 'static' | 'table' | 'divider' | 'checklist' | 'signature_area' | 'fuel_mileage' | 'qr_code';

interface InvoiceElement {
  id: string;
  type: ElementType;
  label: string; 
  content: string; 
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
  backgroundColor: string;
  fontFamily: string;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
  borderRadius: number;
  padding: number;
  borderWidth: number;
  borderColor: string;
  lineHeight: number;
  opacity: number;
  letterSpacing: number;
  zIndex: number;
  boxShadow: string;
  checklistData?: Record<string, boolean>;
}

interface InvoiceTemplate {
  id: string;
  name: string;
  category: 'invoice' | 'devis' | 'contract' | 'checkin' | 'checkout';
  elements: InvoiceElement[];
  canvasWidth: number;
  canvasHeight: number;
}

const PersonalizationPage: React.FC<PersonalizationPageProps> = ({ lang, initialTemplates, onUpdateTemplates }) => {
  const [isDesigning, setIsDesigning] = useState(false);
  const [activeTabSide, setActiveTabSide] = useState<'elements' | 'properties' | 'templates'>('templates');
  const [showPreview, setShowPreview] = useState(false);
  const [templates, setTemplates] = useState<InvoiceTemplate[]>(initialTemplates);
  const [currentTemplate, setCurrentTemplate] = useState<InvoiceTemplate | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const createBaseElement = (type: ElementType, label: string, content: string): InvoiceElement => ({
    id: `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type, label, content,
    x: 50, y: 150, width: type === 'table' || type === 'checklist' || type === 'divider' ? 500 : 200,
    height: type === 'divider' ? 2 : type === 'checklist' ? 180 : 40,
    fontSize: 12, color: '#111827', backgroundColor: 'transparent',
    fontFamily: 'Inter', fontWeight: '400', textAlign: 'left',
    borderRadius: 0, padding: 5, borderWidth: 0, borderColor: '#e5e7eb',
    lineHeight: 1.4, opacity: 1, letterSpacing: 0, zIndex: 10, boxShadow: 'none',
    checklistData: type === 'checklist' ? {
      'Feux & Phares': true, 'Pneus': true, 'Freins': true, 'Essuie-glaces': true, 
      'Rétroviseurs': true, 'Ceintures': true, 'Klaxon': true,
      'Roue de secours': true, 'Cric': true, 'Triangles': true, 'Trousse secours': true, 'Docs véhicule': true
    } : undefined
  });

  const isRtl = lang === 'ar';
  const t = {
    fr: {
      title: 'Studio de Design Documentaire',
      subtitle: 'Créez des contrats, factures et devis qui reflètent votre image de marque.',
      newTemplate: 'Nouveau Design',
      tabs: { elements: 'Blocs', properties: 'Propriétés', templates: 'Modèles' },
      categories: { invoice: 'Facture', devis: 'Devis', contract: 'Contrat', checkin: 'Check-in', checkout: 'Check-out' },
      groups: { typography: 'Texte & Style', appearance: 'Design & Couleurs', layout: 'Structure', checklist: 'Options Inspection' },
      preview: 'Aperçu Impression',
      generate: 'Générer Document'
    },
    ar: {
      title: 'استوديو تصميم الوثائق',
      subtitle: 'صمم عقوداً وفواتير تعكس صورة علامتك التجارية باحترافية.',
      newTemplate: 'تصميم جديد',
      tabs: { elements: 'المكونات', properties: 'الخصائص', templates: 'النماذج' },
      categories: { invoice: 'فاتورة', devis: 'عرض سعر', contract: 'عقد', checkin: 'استلام', checkout: 'تسليم' },
      groups: { typography: 'النصوص والخطوط', appearance: 'التصميم والألوان', layout: 'الهيكل', checklist: 'خيارات المعاينة' },
      preview: 'معاينة الطباعة',
      generate: 'إنشاء الوثيقة'
    }
  }[lang];

  const updateElement = (id: string, updates: Partial<InvoiceElement>) => {
    if (!currentTemplate) return;
    setCurrentTemplate({
      ...currentTemplate,
      elements: currentTemplate.elements.map(el => el.id === id ? { ...el, ...updates } : el)
    });
  };

  const handleElementClick = (e: React.MouseEvent, elId: string) => {
    e.stopPropagation();
    setSelectedElementId(elId);
    setActiveTabSide('properties');
  };

  const onMouseDown = (e: React.MouseEvent, elId: string) => {
    e.stopPropagation();
    setSelectedElementId(elId);
    setDraggedElementId(elId);
    setActiveTabSide('properties');
    const el = currentTemplate?.elements.find(e => e.id === elId);
    if (el) {
      setDragOffset({ x: e.clientX - el.x, y: e.clientY - el.y });
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (draggedElementId && currentTemplate) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      updateElement(draggedElementId, { x: Math.round(newX / 2) * 2, y: Math.round(newY / 2) * 2 });
    }
  };

  const onMouseUp = () => setDraggedElementId(null);
  
  const selectedElement = currentTemplate?.elements.find(el => el.id === selectedElementId);

  const ChecklistBlock = ({ element }: { element: InvoiceElement }) => {
    const isSecurity = element.content === 'security';
    const items = isSecurity 
      ? ['Feux & Phares', 'Pneus', 'Freins', 'Essuie-glaces', 'Rétroviseurs', 'Ceintures', 'Klaxon']
      : ['Roue de secours', 'Cric', 'Triangles', 'Trousse secours', 'Docs véhicule'];

    return (
      <div className="w-full h-full pointer-events-none">
        <h5 className="text-[10px] font-black uppercase mb-3 border-b border-gray-100 pb-1 flex items-center gap-2">
          {isSecurity ? '🛡️ SÉCURITÉ' : '🧰 ÉQUIPEMENT'}
        </h5>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {items.map(it => (
            <div key={it} className="flex justify-between items-center border-b border-gray-50 pb-1">
              <span className="text-[8px] font-bold text-gray-700">{it}</span>
              <span className="text-[9px] font-black text-blue-600">✓</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isDesigning && currentTemplate) {
    return (
      <div className={`min-h-screen bg-gray-100 flex flex-col animate-fade-in ${isRtl ? 'font-arabic' : ''}`} onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-[200] shadow-sm">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsDesigning(false)} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all shadow-inner font-black">←</button>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tighter uppercase leading-none">{currentTemplate.name}</h2>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">{t.categories[currentTemplate.category]}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowPreview(true)} className="px-8 py-3 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all">🖨️ {t.preview}</button>
            <GradientButton onClick={() => { 
               const updated = templates.map(t => t.id === currentTemplate.id ? currentTemplate : t);
               setTemplates(updated);
               onUpdateTemplates(updated);
               setIsDesigning(false); 
            }} className="!px-10 !py-3 shadow-blue-100">💾 Sauvegarder</GradientButton>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Side Panel */}
          <aside className="w-[380px] bg-white border-r border-gray-200 flex flex-col z-[150] shadow-xl">
            <div className="flex p-4 bg-gray-50/50 border-b border-gray-100 gap-2">
               {(['elements', 'properties'] as const).map(tab => (
                 <button key={tab} onClick={() => setActiveTabSide(tab)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTabSide === tab ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'text-gray-400'}`}>{t.tabs[tab]}</button>
               ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
               {activeTabSide === 'elements' && (
                 <div className="space-y-8 animate-fade-in">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-3">Composants de design</h3>
                    <div className="grid grid-cols-2 gap-4">
                       {[
                         { icon: '🏷️', label: 'Texte Statique', type: 'static' },
                         { icon: '⚙️', label: 'Tag Variable', type: 'variable' },
                         { icon: '🖼️', label: 'Logo Agence', type: 'logo' },
                         { icon: '📋', label: 'Tableau Data', type: 'table' },
                         { icon: '🛡️', label: 'Bloc Sécurité', type: 'checklist', content: 'security' },
                         { icon: '🧰', label: 'Bloc Équipement', type: 'checklist', content: 'equipment' },
                         { icon: '⛽', label: 'Km & Carburant', type: 'fuel_mileage' },
                         { icon: '✍️', label: 'Zone Signature', type: 'signature_area' },
                         { icon: '➖', label: 'Séparateur', type: 'divider' },
                         { icon: '🏁', label: 'QR Code', type: 'qr_code' },
                       ].map(btn => (
                         <button key={btn.label} onClick={() => {
                            const newEl = createBaseElement(btn.type as ElementType, btn.label, btn.content || btn.label);
                            setCurrentTemplate({...currentTemplate, elements: [...currentTemplate.elements, newEl]});
                            setSelectedElementId(newEl.id); setActiveTabSide('properties');
                         }} className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-[2.5rem] border-2 border-transparent hover:border-blue-600 hover:bg-white transition-all gap-3 group shadow-sm">
                            <span className="text-3xl group-hover:scale-125 transition-transform duration-500">{btn.icon}</span>
                            <span className="text-[9px] font-black text-gray-900 uppercase tracking-tighter text-center leading-tight">{btn.label}</span>
                         </button>
                       ))}
                    </div>
                 </div>
               )}

               {activeTabSide === 'properties' && (
                 <div className="space-y-10 animate-fade-in">
                    {!selectedElement ? (
                      <div className="py-24 text-center opacity-30 flex flex-col items-center gap-6"><span className="text-7xl">🖌️</span><p className="text-xs font-black uppercase tracking-[0.2em]">Sélectionnez un élément sur la page pour le modifier</p></div>
                    ) : (
                      <div className="space-y-8">
                        <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                           <div className="flex items-center gap-3">
                              <span className="text-xl">🔧</span>
                              <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest">{selectedElement.label}</h3>
                           </div>
                           <button onClick={() => { setCurrentTemplate({...currentTemplate, elements: currentTemplate.elements.filter(e => e.id !== selectedElementId)}); setSelectedElementId(null); }} className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm">🗑️</button>
                        </div>
                        <div className="space-y-10">
                           <section className="space-y-4">
                              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-l-4 border-blue-500 pl-4">{t.groups.typography}</h4>
                              <textarea value={selectedElement.content} onChange={e => updateElement(selectedElement.id, { content: e.target.value })} className="w-full p-5 bg-gray-50 rounded-[1.5rem] text-xs font-bold outline-none border-2 border-transparent focus:bg-white focus:border-blue-500 h-28 resize-none shadow-inner" />
                              <div className="grid grid-cols-2 gap-4">
                                 <div><label className="text-[9px] font-black text-gray-400 uppercase px-2">Taille</label><input type="number" value={selectedElement.fontSize} onChange={e => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })} className="w-full p-4 bg-gray-50 rounded-xl font-black outline-none" /></div>
                                 <div><label className="text-[9px] font-black text-gray-400 uppercase px-2">Graisse</label><select value={selectedElement.fontWeight} onChange={e => updateElement(selectedElement.id, { fontWeight: e.target.value })} className="w-full p-4 bg-gray-50 rounded-xl font-black outline-none"><option value="400">Normal</option><option value="700">Gras</option><option value="900">Noir</option></select></div>
                              </div>
                           </section>
                           <section className="space-y-4">
                              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-l-4 border-indigo-500 pl-4">{t.groups.appearance}</h4>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="relative h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm"><input type="color" value={selectedElement.color} onChange={e => updateElement(selectedElement.id, { color: e.target.value })} className="absolute inset-0 w-full h-full cursor-pointer border-none scale-150" /></div>
                                 <div className="relative h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm"><input type="color" value={selectedElement.backgroundColor === 'transparent' ? '#ffffff' : selectedElement.backgroundColor} onChange={e => updateElement(selectedElement.id, { backgroundColor: e.target.value })} className="absolute inset-0 w-full h-full cursor-pointer border-none scale-150" /></div>
                              </div>
                           </section>
                        </div>
                      </div>
                    )}
                 </div>
               )}
            </div>
          </aside>

          <main className="flex-1 bg-gray-200 overflow-auto p-20 flex justify-center custom-scrollbar">
            <div className="bg-white shadow-[0_50px_150px_-50px_rgba(0,0,0,0.3)] relative" style={{ width: `${currentTemplate.canvasWidth}px`, height: `${currentTemplate.canvasHeight}px` }} onClick={() => setSelectedElementId(null)}>
              <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1.5px,transparent_1.5px)] [background-size:25px_25px] pointer-events-none opacity-40"></div>
              {currentTemplate.elements.map(el => (
                <div 
                  key={el.id} 
                  onMouseDown={(e) => onMouseDown(e, el.id)}
                  onClick={(e) => handleElementClick(e, el.id)}
                  className={`absolute group select-none transition-all ${selectedElementId === el.id ? 'z-[100] ring-4 ring-blue-500/30 border-2 border-blue-500 shadow-2xl scale-[1.01]' : 'hover:ring-2 hover:ring-blue-300/50'}`} 
                  style={{
                    left: `${el.x}px`, top: `${el.y}px`, width: `${el.width}px`, height: el.type === 'divider' ? `${el.height}px` : 'auto',
                    minHeight: `${el.height}px`, fontSize: `${el.fontSize}px`, color: el.color, backgroundColor: el.backgroundColor,
                    fontFamily: el.fontFamily, fontWeight: el.fontWeight as any, textAlign: el.textAlign, borderRadius: `${el.borderRadius}px`,
                    padding: `${el.padding}px`, borderWidth: `${el.borderWidth}px`, borderColor: el.borderColor, opacity: el.opacity,
                    zIndex: el.zIndex, whiteSpace: 'pre-wrap', lineHeight: el.lineHeight
                  }}
                >
                   {el.type === 'logo' && <div className="w-full h-full flex items-center justify-center font-black opacity-30 uppercase">{el.content}</div>}
                   {el.type === 'checklist' && <ChecklistBlock element={el} />}
                   {el.type === 'fuel_mileage' && <div className="w-full h-full p-4 flex justify-between items-center text-[9px] font-black uppercase"><div className="text-center"><p className="opacity-40 text-[7px] mb-1">KM</p><p>--</p></div><div className="w-px h-6 bg-gray-200"></div><div className="text-center"><p className="opacity-40 text-[7px] mb-1">FUEL</p><p>⛽ PLEIN</p></div></div>}
                   {el.type === 'table' && <div className="w-full border-t-2 border-gray-900 mt-4 overflow-hidden"><table className="w-full text-[9px] font-black uppercase"><thead className="bg-gray-50/50"><tr className="border-b"><th className="p-2 text-left">Article</th><th className="p-2 text-center">Qté</th><th className="p-2 text-right">HT</th></tr></thead><tbody className="opacity-40"><tr><td className="p-2 border-b">LOCATION VW GOLF 8</td><td className="p-2 border-b text-center">--</td><td className="p-2 border-b text-right">-- DZ</td></tr></tbody></table></div>}
                   {el.type !== 'logo' && el.type !== 'table' && el.type !== 'checklist' && el.type !== 'fuel_mileage' && el.content}
                </div>
              ))}
            </div>
          </main>
        </div>

        {showPreview && (
          <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xl flex items-center justify-center p-8 animate-fade-in">
             <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
                <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-xl">📄</div>
                      <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Aperçu Impression</h2>
                   </div>
                   <button onClick={() => setShowPreview(false)} className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm hover:text-red-500 transition-all">✕</button>
                </div>
                <div className="flex-1 bg-gray-100 p-16 overflow-y-auto custom-scrollbar flex justify-center">
                   <div className="bg-white shadow-2xl" style={{ width: `${currentTemplate.canvasWidth}px`, height: `${currentTemplate.canvasHeight}px` }}>
                      {currentTemplate.elements.map(el => (
                        <div key={el.id} className="absolute" style={{
                          left: `${el.x}px`, top: `${el.y}px`, width: `${el.width}px`, height: el.type === 'divider' ? `${el.height}px` : 'auto',
                          minHeight: `${el.height}px`, fontSize: `${el.fontSize}px`, color: el.color, backgroundColor: el.backgroundColor,
                          textAlign: el.textAlign, borderRadius: `${el.borderRadius}px`, padding: `${el.padding}px`, borderWidth: `${el.borderWidth}px`,
                          borderColor: el.borderColor, opacity: el.opacity, zIndex: el.zIndex, whiteSpace: 'pre-wrap', lineHeight: el.lineHeight
                        }}>
                           {el.type !== 'logo' && el.type !== 'table' && el.type !== 'checklist' && el.type !== 'fuel_mileage' && el.content}
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-12 animate-fade-in ${isRtl ? 'font-arabic text-right' : ''}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16">
        <div>
          <h1 className="text-6xl font-black text-gray-900 tracking-tighter mb-4">{t.title}</h1>
          <p className="text-gray-400 font-bold text-xl">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {templates.map(tpl => (
          <div key={tpl.id} className="group bg-white rounded-[5rem] shadow-[0_30px_100px_-25px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden hover:shadow-[0_60px_150px_-30px_rgba(59,130,246,0.2)] hover:-translate-y-4 transition-all duration-700 flex flex-col h-full relative">
            <div className="relative h-80 bg-gray-50 flex items-center justify-center border-b border-gray-100 p-12">
               <div className="w-48 h-64 bg-white shadow-2xl rounded-sm transform group-hover:rotate-2 group-hover:scale-110 transition-all duration-1000 flex flex-col p-6 space-y-4 relative">
                  <div className="flex justify-between items-center"><div className="w-10 h-10 bg-blue-500/10 rounded-lg"></div><div className="w-16 h-3 bg-gray-100 rounded-sm"></div></div>
                  <div className="space-y-2"><div className="w-full h-2 bg-gray-50"></div><div className="w-3/4 h-2 bg-gray-50"></div></div>
                  <div className="flex-1 flex flex-col justify-end"><div className="w-full h-8 bg-blue-600/5 rounded-2xl border border-dashed border-blue-200"></div></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-10 transition-opacity"><span className="text-8xl font-black">📄</span></div>
               </div>
               <button onClick={() => { setCurrentTemplate(tpl); setIsDesigning(true); setSelectedElementId(null); }} className="absolute z-10 px-10 py-5 bg-white text-blue-600 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500">🔧 Personnaliser</button>
            </div>
            <div className="p-12 space-y-8 flex-1 flex flex-col">
               <div><h3 className="text-3xl font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">{tpl.name}</h3><p className="text-[10px] font-black text-gray-400 uppercase mt-2 tracking-widest">Type: {t.categories[tpl.category]}</p></div>
               <div className="flex gap-4 mt-auto">
                  <button onClick={() => { setCurrentTemplate(tpl); setShowPreview(true); }} className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-[2rem] font-black uppercase text-[11px] tracking-widest hover:bg-gray-900 hover:text-white transition-all shadow-sm">👁️ Aperçu</button>
                  <button onClick={() => { setCurrentTemplate(tpl); setIsDesigning(true); }} className="flex-[2] py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">✨ Éditer</button>
               </div>
            </div>
          </div>
        ))}
        <button onClick={() => {
          const blankTemplate: InvoiceTemplate = { id: `tpl-blank-${Date.now()}`, name: 'Nouveau Design', category: 'invoice', canvasWidth: 595, canvasHeight: 842, elements: [] };
          setCurrentTemplate(blankTemplate);
          setIsDesigning(true);
          setSelectedElementId(null);
        }} className="group bg-white rounded-[5rem] border-4 border-dashed border-gray-100 p-20 flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50/20 transition-all duration-700 min-h-[400px]">
           <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-6xl group-hover:scale-110 transition-transform shadow-inner mb-8 group-hover:bg-white">➕</div>
           <h3 className="text-2xl font-black text-gray-400 group-hover:text-blue-600 uppercase tracking-widest">{t.newTemplate}</h3>
        </button>
      </div>
    </div>
  );
};

export default PersonalizationPage;
