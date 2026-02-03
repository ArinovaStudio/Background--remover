from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
from app.services.image_engine import process_remove_background, process_composite

router = APIRouter()

@router.post("/remove-bg")
async def remove_background_endpoint(file: UploadFile = File(...)):
    """
     Just remove background. 
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type")

    try:
        image_data = await file.read()
        processed_image = process_remove_background(image_data)
        
        return Response(content=processed_image, media_type="image/png")
        
    except Exception:
        raise HTTPException(status_code=500, detail="Processing failed")

@router.post("/process")
async def process_composition_endpoint(
    file: UploadFile = File(...), 
    bg_file: UploadFile = File(None), # Mockup/Custom BG
    bg_color: str = Form(None), # Hex Color
    width: int = Form(None), # Resize Width
    height: int = Form(None) # Resize Height
):
    """
    Handles Mockups, Colors, and Resizing.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type")

    try:
        fg_bytes = await file.read()
        bg_bytes = await bg_file.read() if bg_file else None

        final_image = process_composite(
            foreground_bytes=fg_bytes,
            bg_file_bytes=bg_bytes,
            bg_color_hex=bg_color,
            target_width=width,
            target_height=height
        )

        return Response(content=final_image, media_type="image/png")

    except Exception:
        raise HTTPException(status_code=500, detail="Processing failed")