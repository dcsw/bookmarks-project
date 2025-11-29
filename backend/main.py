from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
import logging

app = FastAPI()

logging.basicConfig(level=logging.INFO)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Endpoint to receive a file via multipart/form-data.
    """
    try:
        # Read the uploaded file into bytes
        file_bytes = await file.read()
    except Exception as e:
        logging.error(f"Failed to read uploaded file: {e}")
        raise HTTPException(status_code=400, detail="Invalid file upload")

    # Log the received file name and size
    logging.info(f"Received file upload: {file.filename} ({len(file_bytes)} bytes)")

    # Here you could add logic to store the file, process it, etc.
    # For now, we just acknowledge receipt.

    return JSONResponse(content={"status": "success", "received_bytes": len(file_bytes)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=True,
    )
