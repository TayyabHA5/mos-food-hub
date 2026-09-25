from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, Body
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import os
import uuid
import json

from .. import database, models, schemas, auth

router = APIRouter(prefix="/restaurants", tags=["restaurants"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static/uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

from datetime import datetime, time

def check_is_open(res) -> bool:
    override = getattr(res, 'status_override', 'auto') or 'auto'
    if override == "force_open":
        return True
    if override == "force_closed":
        return False

    try:
        opening_str = getattr(res, 'opening_time', '11:00') or '11:00'
        closing_str = getattr(res, 'closing_time', '23:00') or '23:00'

        open_h, open_m = map(int, opening_str.split(":"))
        close_h, close_m = map(int, closing_str.split(":"))

        o_time = time(open_h, open_m)
        c_time = time(close_h, close_m)
        now = datetime.now().time()

        if o_time <= c_time:
            return o_time <= now <= c_time
        else:
            return now >= o_time or now <= c_time
    except Exception:
        return True

def get_restaurant_with_ratings(res, db):
    # Calculate average rating and count
    stats = db.query(
        func.avg(models.Rating.rating).label('avg_rating'),
        func.count(models.Rating.id).label('count')
    ).filter(models.Rating.restaurant_id == res.id).first()

    res.average_rating = float(stats.avg_rating) if stats.avg_rating else 0.0
    res.ratings_count = int(stats.count) if stats.count else 0
    res.is_open = check_is_open(res)
    return res

@router.get("/", response_model=List[schemas.Restaurant])
def get_restaurants(db: Session = Depends(get_db)):
    restaurants = db.query(models.Restaurant).all()
    for res in restaurants:
        get_restaurant_with_ratings(res, db)
    return restaurants

@router.get("/{slug}", response_model=schemas.Restaurant)
def get_restaurant_by_slug(slug: str, db: Session = Depends(get_db)):
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.slug == slug).first()
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return get_restaurant_with_ratings(restaurant, db)

@router.post("/", response_model=schemas.Restaurant)
async def create_restaurant(
    name: str = Form(...),
    slug: str = Form(...),
    cuisine: str = Form(...),
    floor: str = Form(...),
    tagline: Optional[str] = Form(None),
    opening_time: Optional[str] = Form("11:00"),
    closing_time: Optional[str] = Form("23:00"),
    status_override: Optional[str] = Form("auto"),
    logo: Optional[UploadFile] = File(None),
    images: List[UploadFile] = File([]),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Super Admin can create restaurants")

    saved_logo_url = None
    if logo:
        logo_extension = os.path.splitext(logo.filename)[1]
        logo_name = f"logo-{uuid.uuid4()}{logo_extension}"
        logo_path = os.path.join(UPLOAD_DIR, logo_name)
        with open(logo_path, "wb") as f:
            f.write(await logo.read())
        saved_logo_url = f"/static/uploads/{logo_name}"

    saved_image_urls = []
    for image in images:
        file_extension = os.path.splitext(image.filename)[1]
        file_name = f"menu-{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        with open(file_path, "wb") as f:
            f.write(await image.read())
        saved_image_urls.append(f"/static/uploads/{file_name}")

    db_restaurant = models.Restaurant(
        name=name,
        slug=slug,
        cuisine=cuisine,
        floor=floor,
        tagline=tagline,
        opening_time=opening_time or "11:00",
        closing_time=closing_time or "23:00",
        status_override=status_override or "auto",
        logo_url=saved_logo_url,
        menu_images=json.dumps(saved_image_urls),
        admin_id=current_user.id
    )

    db.add(db_restaurant)
    db.commit()
    db.refresh(db_restaurant)
    return get_restaurant_with_ratings(db_restaurant, db)

@router.delete("/{restaurant_id}")
def delete_restaurant(
    restaurant_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Super Admin can delete")

    db_restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not db_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    db.delete(db_restaurant)
    db.commit()
    return {"message": "Restaurant deleted successfully"}

@router.put("/{restaurant_id}", response_model=schemas.Restaurant)
async def update_restaurant(
    restaurant_id: int,
    name: Optional[str] = Form(None),
    slug: Optional[str] = Form(None),
    cuisine: Optional[str] = Form(None),
    floor: Optional[str] = Form(None),
    tagline: Optional[str] = Form(None),
    opening_time: Optional[str] = Form(None),
    closing_time: Optional[str] = Form(None),
    status_override: Optional[str] = Form(None),
    logo: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Super Admin can update restaurants")

    db_restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not db_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if name is not None:
        db_restaurant.name = name
    if slug is not None:
        existing_slug = db.query(models.Restaurant).filter(models.Restaurant.slug == slug, models.Restaurant.id != restaurant_id).first()
        if existing_slug:
            raise HTTPException(status_code=400, detail="Slug already in use")
        db_restaurant.slug = slug
    if cuisine is not None:
        db_restaurant.cuisine = cuisine
    if floor is not None:
        db_restaurant.floor = floor
    if tagline is not None:
        db_restaurant.tagline = tagline
    if opening_time is not None:
        db_restaurant.opening_time = opening_time
    if closing_time is not None:
        db_restaurant.closing_time = closing_time
    if status_override is not None:
        db_restaurant.status_override = status_override

    if logo:
        logo_extension = os.path.splitext(logo.filename)[1]
        logo_name = f"logo-{uuid.uuid4()}{logo_extension}"
        logo_path = os.path.join(UPLOAD_DIR, logo_name)
        with open(logo_path, "wb") as f:
            f.write(await logo.read())
        db_restaurant.logo_url = f"/static/uploads/{logo_name}"

    db.commit()
    db.refresh(db_restaurant)
    return get_restaurant_with_ratings(db_restaurant, db)

@router.post("/{restaurant_id}/menu-images", response_model=schemas.Restaurant)
async def add_menu_images(
    restaurant_id: int,
    images: List[UploadFile] = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Super Admin can manage menu images")

    db_restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not db_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    existing_images = []
    if db_restaurant.menu_images:
        try:
            existing_images = json.loads(db_restaurant.menu_images)
        except Exception:
            existing_images = []

    for image in images:
        file_extension = os.path.splitext(image.filename)[1]
        file_name = f"menu-{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        with open(file_path, "wb") as f:
            f.write(await image.read())
        existing_images.append(f"/static/uploads/{file_name}")

    db_restaurant.menu_images = json.dumps(existing_images)
    db.commit()
    db.refresh(db_restaurant)
    return get_restaurant_with_ratings(db_restaurant, db)

@router.delete("/{restaurant_id}/menu-images", response_model=schemas.Restaurant)
def delete_menu_image(
    restaurant_id: int,
    payload: schemas.MenuImageDelete,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Super Admin can manage menu images")

    db_restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not db_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    existing_images = []
    if db_restaurant.menu_images:
        try:
            existing_images = json.loads(db_restaurant.menu_images)
        except Exception:
            existing_images = []

    target_url = payload.image_url
    updated_images = [img for img in existing_images if img != target_url]

    if target_url.startswith("/static/uploads/"):
        filename = os.path.basename(target_url)
        file_path = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass

    db_restaurant.menu_images = json.dumps(updated_images)
    db.commit()
    db.refresh(db_restaurant)
    return get_restaurant_with_ratings(db_restaurant, db)
