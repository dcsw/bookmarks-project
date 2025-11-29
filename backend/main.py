from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import base64
import logging

app = FastAPI()

logging.basicConfig(level=logging.INFO)

class FileMeta(BaseModel):
    name: str
    size: int
    type: str

class FileUploadRequest(BaseModel):
    meta: FileMeta
    content: str  # base64 encoded file content

@app.post("/upload")
async def upload_file(request: FileUploadRequest):
    """
    Endpoint to receive file metadata and base64 encoded file contents.
    """
    try:
        # Decode the base64 content to bytes
        file_bytes = base64.b64decode(request.content)
    except Exception as e:
        logging.error(f"Failed to decode base64 content: {e}")
        raise HTTPException(status_code=400, detail="Invalid base64 content")

    # Log the received metadata and size of decoded content
    logging.info(f"Received file upload: {request.meta.name} ({request.meta.size} bytes, type: {request.meta.type})")
    logging.info(f"Decoded content size: {len(file_bytes)} bytes")

    # Here you could add logic to store the file, process it, etc.
    # For now, we just acknowledge receipt.

    return {"status": "success", "received_bytes": len(file_bytes)}
