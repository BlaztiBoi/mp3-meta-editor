import React, { ChangeEvent } from 'react';
import { CoverArt } from '../types';

interface CoverArtEditorProps {
  coverArt: CoverArt | null;
  setCoverArt: (art: CoverArt | null) => void;
}

const CoverArtEditor: React.FC<CoverArtEditorProps> = ({ coverArt, setCoverArt }) => {
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setCoverArt({
        url,
        file,
        mimeType: file.type
      });
    }
  };

  const handleClear = () => {
    setCoverArt(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-end">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Artwork</h3>
        {coverArt && (
          <button 
            onClick={handleClear}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Remove
          </button>
        )}
      </div>
      
      <div className="relative group w-full aspect-square bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-800 shadow-xl transition-all hover:border-blue-500/30 hover:shadow-blue-500/10">
        {coverArt ? (
          <>
            <img 
              src={coverArt.url} 
              alt="Album Cover" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                 <label className="cursor-pointer bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full font-medium hover:bg-white/20 transition-all transform translate-y-2 group-hover:translate-y-0 duration-300">
                    Change Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
            </div>
          </>
        ) : (
          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800/50 transition-colors group">
             <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
             </div>
             <span className="text-slate-500 text-sm font-medium">Upload Cover</span>
             <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        )}
      </div>
      <p className="text-xs text-slate-600 text-center">Supported: JPEG, PNG</p>
    </div>
  );
};

export default CoverArtEditor;