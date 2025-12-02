import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import CoverArtEditor from './components/CoverArtEditor';
import { Metadata, CoverArt, AppStatus } from './types';
import { INITIAL_METADATA, COMMON_GENRES } from './constants';
import { writeTags, readTags } from './services/mp3Service';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<Metadata>(INITIAL_METADATA);
  const [coverArt, setCoverArt] = useState<CoverArt | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [statusMessage, setStatusMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    const processFile = async () => {
      if (!file || status !== AppStatus.IDLE) return;
      
      setStatus(AppStatus.PROCESSING);
      setStatusMessage('Reading file metadata...');

      const cleanName = file.name.replace(/\.mp3$/i, '');
      const parts = cleanName.split(' - ');
      let initialData: Metadata = { ...INITIAL_METADATA };
      
      if (parts.length >= 2) {
          initialData.artist = parts[0].trim();
          initialData.title = parts[1].trim();
      } else {
          initialData.title = cleanName;
      }

      try {
          const { tags, cover } = await readTags(file);
          
          setMetadata({
              ...initialData,
              ...tags,
              title: tags.title || initialData.title,
              artist: tags.artist || initialData.artist,
              album: tags.album || '',
              year: tags.year || '',
              genre: tags.genre || '',
              trackNumber: tags.trackNumber || '',
              lyrics: tags.lyrics || ''
          });

          if (cover) {
              setCoverArt(cover);
          }
      } catch (e) {
          console.warn("Tag reading failed, using filename defaults", e);
          setMetadata(initialData);
      }
      
      setStatus(AppStatus.READY);
    };

    processFile();
  }, [file, status]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMetadata(prev => ({ ...prev, [name]: value }));
  };

  const handleProcessAndDownload = async () => {
    if (!file) return;
    setStatus(AppStatus.PROCESSING);
    setStatusMessage('Applying tags...');

    try {
        const taggedBlob = await writeTags(file, metadata, coverArt);
        const url = URL.createObjectURL(taggedBlob);
        setDownloadUrl(url);
        setStatus(AppStatus.READY);
        setStatusMessage('Ready for download!');
    } catch (e) {
        console.error(e);
        setStatusMessage('Error writing tags.');
        setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setFile(null);
    setMetadata(INITIAL_METADATA);
    setCoverArt(null);
    setStatus(AppStatus.IDLE);
    setDownloadUrl(null);
    setStatusMessage('');
  };

  // Background gradient element
  const Background = () => (
    <div className="fixed inset-0 -z-10 bg-slate-950 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-900/20 rounded-full blur-[120px]"></div>
    </div>
  );

  if (!file) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-slate-100 relative">
        <Background />
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-block p-3 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6 shadow-2xl">
             <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
            MP3 Metadata Editor
          </h1>
          <p className="text-slate-500 text-lg font-light max-w-md mx-auto">
            Professional MP3 metadata editing. <br/>Clean, fast, and local.
          </p>
        </div>
        <FileUpload onFileSelect={setFile} />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <Background />
      
      {/* Header */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={handleReset}>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-blue-500/50 transition-colors">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-blue-100">Blazt's Mp3 Meta Editing</span>
        </div>
        <button 
            onClick={handleReset}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
        >
            New Project
        </button>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Cover Art & File Info */}
        <div className="lg:col-span-4 space-y-6">
           <CoverArtEditor 
              coverArt={coverArt} 
              setCoverArt={setCoverArt} 
           />
           
           <div className="bg-slate-900/40 backdrop-blur-md rounded-xl p-5 border border-white/5">
             <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">File Information</h3>
             <div className="space-y-3">
                <div>
                    <span className="text-xs text-slate-500 block">Filename</span>
                    <p className="text-slate-200 truncate font-mono text-sm" title={file.name}>{file.name}</p>
                </div>
                <div>
                    <span className="text-xs text-slate-500 block">Size</span>
                    <p className="text-slate-200 text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <div>
                    <span className="text-xs text-slate-500 block">Type</span>
                    <p className="text-slate-200 text-sm uppercase">MP3 Audio</p>
                </div>
             </div>
           </div>
        </div>

        {/* Right Column: Metadata Form */}
        <div className="lg:col-span-8">
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl border border-white/5 ring-1 ring-white/5">
                
                {/* Main Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400 ml-1">Title</label>
                        <input 
                            type="text" 
                            name="title"
                            value={metadata.title} 
                            onChange={handleInputChange}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                            placeholder="Song Title"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400 ml-1">Artist</label>
                        <input 
                            type="text" 
                            name="artist"
                            value={metadata.artist} 
                            onChange={handleInputChange}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                            placeholder="Artist Name"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400 ml-1">Album</label>
                        <input 
                            type="text" 
                            name="album"
                            value={metadata.album} 
                            onChange={handleInputChange}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                            placeholder="Album Name"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-400 ml-1">Year</label>
                            <input 
                                type="text" 
                                name="year"
                                value={metadata.year} 
                                onChange={handleInputChange}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                                placeholder="Year"
                            />
                        </div>
                         <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-400 ml-1">Track No.</label>
                            <input 
                                type="text" 
                                name="trackNumber"
                                value={metadata.trackNumber} 
                                onChange={handleInputChange}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                                placeholder="#"
                            />
                        </div>
                    </div>
                     <div className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-medium text-slate-400 ml-1">Genre</label>
                        <div className="relative">
                            <input 
                                list="genres" 
                                type="text"
                                name="genre"
                                value={metadata.genre}
                                onChange={handleInputChange}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                                placeholder="Select or type genre"
                            />
                            <datalist id="genres">
                                {COMMON_GENRES.map(g => <option key={g} value={g} />)}
                            </datalist>
                        </div>
                    </div>
                </div>

                {/* Lyrics */}
                <div className="space-y-1.5 mb-8">
                    <label className="text-xs font-medium text-slate-400 ml-1">Lyrics</label>
                    <textarea 
                        name="lyrics"
                        value={metadata.lyrics} 
                        onChange={handleInputChange}
                        className="w-full h-40 bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all resize-none font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-700"
                        placeholder="Paste lyrics here..."
                    />
                </div>

                {/* Action Bar */}
                <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-blue-400 text-sm font-medium h-6">
                        {status === AppStatus.PROCESSING && (
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                {statusMessage}
                            </span>
                        )}
                        {status === AppStatus.READY && downloadUrl && (
                            <span className="text-sky-400 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Ready to download
                            </span>
                        )}
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        {downloadUrl ? (
                             <a 
                                href={downloadUrl} 
                                download={`${metadata.artist || 'Artist'} - ${metadata.title || 'Title'}.mp3`}
                                className="flex-1 md:flex-none bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-all shadow-lg shadow-sky-900/20 text-center flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                Download MP3
                            </a>
                        ) : (
                             <button 
                                onClick={handleProcessAndDownload}
                                disabled={status === AppStatus.PROCESSING}
                                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-8 rounded-lg transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === AppStatus.PROCESSING ? 'Processing...' : 'Save & Encode'}
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default App;