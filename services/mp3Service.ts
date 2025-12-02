// @ts-ignore
import { ID3Writer } from 'https://esm.sh/browser-id3-writer';
import { Metadata, CoverArt } from '../types';

export const readTags = (file: File): Promise<{ tags: Partial<Metadata>, cover: CoverArt | null }> => {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    const jsmediatags = window.jsmediatags;
    if (!jsmediatags) {
        reject("jsmediatags library not loaded");
        return;
    }

    jsmediatags.read(file, {
      onSuccess: (result: any) => {
        const tags = result.tags;
        
        // Extract lyrics if available (structure varies by version)
        let lyrics = '';
        if (tags.lyrics) {
            if (typeof tags.lyrics === 'string') {
                lyrics = tags.lyrics;
            } else if (tags.lyrics.lyrics) {
                lyrics = tags.lyrics.lyrics;
            }
        }

        const metadata: Partial<Metadata> = {
          title: tags.title,
          artist: tags.artist,
          album: tags.album,
          year: tags.year,
          genre: tags.genre,
          trackNumber: tags.track,
          lyrics: lyrics
        };

        let cover: CoverArt | null = null;
        if (tags.picture) {
          const { data, format } = tags.picture;
          let base64String = "";
          for (let i = 0; i < data.length; i++) {
            base64String += String.fromCharCode(data[i]);
          }
          const base64 = "data:" + format + ";base64," + window.btoa(base64String);
          
          // create blob for file
          const arrayBuffer = new Uint8Array(data).buffer;
          const blob = new Blob([arrayBuffer], { type: format });
          
          cover = {
            url: base64,
            file: blob,
            mimeType: format
          };
        }

        resolve({ tags: metadata, cover });
      },
      onError: (error: any) => {
        // Just resolve with empty if error, so we can fall back to filename
        console.warn("Error reading tags:", error);
        resolve({ tags: {}, cover: null });
      }
    });
  });
};

export const writeTags = async (
  originalFile: File,
  metadata: Metadata,
  coverArt: CoverArt | null
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        try {
          const buffer = reader.result;
          const writer = new ID3Writer(buffer);

          // Text Frames
          if (metadata.title) writer.setFrame('TIT2', metadata.title);
          if (metadata.artist) writer.setFrame('TPE1', [metadata.artist]);
          if (metadata.album) writer.setFrame('TALB', metadata.album);
          if (metadata.genre) writer.setFrame('TCON', [metadata.genre]);
          if (metadata.year) writer.setFrame('TYER', metadata.year);
          if (metadata.trackNumber) writer.setFrame('TRCK', metadata.trackNumber);
          if (metadata.lyrics) {
             writer.setFrame('USLT', {
                 description: '',
                 lyrics: metadata.lyrics,
                 language: 'eng'
             });
          }

          // Cover Art Frame
          const handleWrite = () => {
              writer.addTag();
              const taggedBuffer = writer.getBlob();
              resolve(taggedBuffer);
          };

          if (coverArt && coverArt.file) {
            const imgReader = new FileReader();
            imgReader.onload = () => {
              if (imgReader.result instanceof ArrayBuffer) {
                writer.setFrame('APIC', {
                  type: 3, // Cover (front)
                  data: imgReader.result,
                  description: 'Cover',
                  useUnicodeEncoding: false // Standard compatibility
                });
                handleWrite();
              }
            };
            imgReader.onerror = () => handleWrite(); // Skip image if fail
            imgReader.readAsArrayBuffer(coverArt.file);
          } else {
            handleWrite();
          }

        } catch (e) {
          reject(e);
        }
      } else {
        reject(new Error("Failed to read file buffer"));
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(originalFile);
  });
};

// Helper to convert base64 to Blob for cover art processing
export const base64ToBlob = async (base64Data: string): Promise<Blob> => {
  const res = await fetch(base64Data);
  return await res.blob();
};