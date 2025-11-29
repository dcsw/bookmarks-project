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

  async function handleUpload() {
    if (!file()) {
      setStatus('Please select a file first.');
      return;
    }
    setStatus(`Uploading ${file()!.name}...`);
    readUploadedFileContents();

    // Prepare form data for upload
    const formData = new FormData();
    formData.append('file', file()!);

    try {
      // Use absolute URL to hit the FastAPI backend running on port 8000
      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('Upload response:', result);
      setStatus(`Upload complete: ${file()!.name}`);
    } catch (error) {
      console.error('Upload error:', error);
      setStatus(`Upload failed: ${error}`);
    }
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
