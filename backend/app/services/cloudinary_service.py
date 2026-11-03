import cloudinary
import cloudinary.uploader
import io
from app.core.config import settings

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


def upload_image(content: bytes, filename: str) -> str:
    """Upload image to Cloudinary and return URL."""
    if not settings.CLOUDINARY_CLOUD_NAME:
        # Return placeholder if not configured
        return f"https://placehold.co/800x600?text=Evidence+Image"

    try:
        result = cloudinary.uploader.upload(
            io.BytesIO(content),
            folder="finesnap/evidence",
            resource_type="image",
            format="jpg",
            transformation=[{"width": 1200, "crop": "limit"}],
        )
        return result["secure_url"]
    except Exception as e:
        raise Exception(f"Image upload failed: {str(e)}")
