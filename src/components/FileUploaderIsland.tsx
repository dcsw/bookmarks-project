import { createSignal, createEffect } from 'solid-js';

export default function FileUploaderIsland() {
  const [file, setFile] = createSignal<File | null>(null);
  const [status, setStatus] = createSignal<string>('No file selected, xxx');
  const [fileContents, setFileContents] = createSignal<string | null>(null);
  const [fileMetaData, setFileMetaData] = createSignal<{ name?: string; size?: number; type?: string } | null>(null);

  // Log fileMetaData whenever it changes
  createEffect(() => {
    const meta = fileMetaData();
    if (meta) {
      console.log('fileMetaData changed:', meta);
    } else {
      console.log('fileMetaData cleared');
    }
  });

  function readUploadedFileContents() {
    const currentFile = file();
    if (!currentFile) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFileContents(result);
      console.log(result);
    };
    reader.onerror = () => {
      console.error('Error reading file');
    };
    reader.readAsText(currentFile);
  }

  function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const selectedFile = target.files[0];
      setFile(selectedFile);
      setFileMetaData({
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
      });
      setStatus(`Selected: ${selectedFile.name}`);
    } else {
      setFile(null);
      setFileMetaData(null);
      setStatus('No file selected, dork');
    }
  }

  function handleUpload() {
    if (!file()) {
      setStatus('Please select a file first.');
      return;
    }
    setStatus(`Uploading ${file()!.name}...`);
    readUploadedFileContents();
    setTimeout(() => {
      setStatus(`Upload complete: ${file()!.name}`);
    }, 1000);
  }

  return (
    <>
      <div class="file-uploader">
        <input type="file" accept="*/*" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
        <p>{status()}</p>
      </div>
      <style>{`
        .file-uploader {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-width: 300px;
        }
        .file-uploader input {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </>
  );
}
