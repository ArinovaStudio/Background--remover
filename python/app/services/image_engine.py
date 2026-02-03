from rembg import remove
from PIL import Image, ImageColor
import io

# Smart Resizing
def smart_resize(img: Image.Image, width: int = None, height: int = None) -> Image.Image:
    if not width and not height:
        return img 

    current_w, current_h = img.size

    if width and not height:
        ratio = width / current_w
        height = int(current_h * ratio)
    elif height and not width:
        ratio = height / current_h
        width = int(current_w * ratio)

    return img.resize((width, height), Image.Resampling.LANCZOS)


def process_remove_background(image_bytes: bytes) -> bytes:
    """
    Standard background removal.
    """
    input_image = Image.open(io.BytesIO(image_bytes))
    output_image = remove(input_image, post_process_mask=True)
    
    output_io = io.BytesIO()
    output_image.save(output_io, format="PNG")
    output_io.seek(0)
    
    return output_io.getvalue()


def process_composite(
    foreground_bytes: bytes, 
    bg_file_bytes: bytes = None, 
    bg_color_hex: str = None,
    target_width: int = None,    
    target_height: int = None    
) -> bytes:
    """
    Handles Background Removal + Composite + Resizing.
    """
    fg_image = Image.open(io.BytesIO(foreground_bytes)).convert("RGBA")
    cutout = remove(fg_image, post_process_mask=True)

    # Apply Background
    if bg_file_bytes:
        bg_image = Image.open(io.BytesIO(bg_file_bytes)).convert("RGBA")
        bg_image = bg_image.resize(cutout.size)
        
    elif bg_color_hex:
        try:
            color = ImageColor.getcolor(bg_color_hex, "RGBA")
            bg_image = Image.new("RGBA", cutout.size, color)
        except ValueError:
            bg_image = Image.new("RGBA", cutout.size, (255, 255, 255, 255))
            
    else:
        bg_image = Image.new("RGBA", cutout.se, (0, 0, 0, 0))

    # Paste cutout onto background
    bg_image.paste(cutout, (0, 0), cutout)
    final_image = bg_image

    # Apply Final Resize
    if target_width or target_height:
        final_image = smart_resize(final_image, target_width, target_height)

    output_io = io.BytesIO()
    final_image.save(output_io, format="PNG")
    output_io.seek(0)
    
    return output_io.getvalue()