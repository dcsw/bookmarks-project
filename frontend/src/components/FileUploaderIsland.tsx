import { createSignal, createEffect } from "solid-js";
import Grid from "./Grid.astro";

export default function FileUploaderIsland() {
  const [file, setFile] = createSignal<File | null>(null);
  const [status, setStatus] = createSignal<string>('No file selected.');
  const [fileContents, setFileContents] = createSignal<string | null>(null);
  const [fileMetaData, setFileMetaData] = createSignal<{ name?: string; size?: number; type?: string } | null>(null);
  const [bookmarks, setBookmarks] = createSignal<any[]>([]);

  // Log fileMetaData whenever it changes
  createEffect(() => {
    const meta = fileMetaData();
    if (meta) {
      console.log('File metadata:', meta);
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
      console.error('Error reading file:', reader.error);
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
      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setBookmarks(data.bookmarks || []);
      setStatus(`Upload successful! ${data.bookmarks?.length ?? 0} bookmarks received.`);
    } catch (error) {
      console.error('Upload error:', error);
      setStatus(`Upload failed: ${error}`);
    }
  }

  return (
    <div>
      <input type="file" accept=".html" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <p>{status()}</p>
      <Grid items={bookmarks()} />
    </div>
  );
}
