import React, { ChangeEvent, useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          if (file.type === "audio/mpeg") {
            onFileSelect(file);
          }
      }
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <label 
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ease-out overflow-hidden
        ${isDragOver 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/30'}`}
      >
        <div className="absolute inset-0 backdrop-blur-sm -z-10"></div>
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            <div className={`p-4 rounded-full mb-4 transition-all duration-300 ${isDragOver ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                </svg>
            </div>
          <p className="mb-2 text-xl text-slate-200 font-semibold tracking-tight">Drop your MP3 here</p>
          <p className="text-sm text-slate-500">or click to browse your files</p>
        </div>
        <input 
          type="file" 
          accept="audio/mpeg"
          className="hidden" 
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};

export default FileUpload;