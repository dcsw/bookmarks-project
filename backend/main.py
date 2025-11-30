from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging

app = FastAPI()

# Configure CORS to allow all origins (adjust as needed for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],          # Allows all HTTP methods
    allow_headers=["*"],          # Allows all headers
)

logging.basicConfig(level=logging.INFO)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Endpoint to receive a file via multipart/form-data.
    """
    try:
        # Read the uploaded file into bytes
        file_bytes = await file.read()
        # Decode bytes into a string (assuming UTF-8 encoding)
        file_text = file_bytes.decode("utf-8")
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
