import { createSignal } from 'solid-js';

export default function FileUploaderIsland() {
  const [file, setFile] = createSignal<File | null>(null);
  const [status, setStatus] = createSignal<string>('No file selected, xxx');
  const [fileContents, setFileContents] = createSignal<string | null>(null);

  function nop() {
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
      setStatus(`Selected: ${selectedFile.name}`);
      nop();
    } else {
      setFile(null);
      setStatus('No file selected, dork');
    }
  }

  function handleUpload() {
    if (!file()) {
      setStatus('Please select a file first.');
      return;
    }
    setStatus(`Uploading ${file()!.name}...`);
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
