from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import database, models, schemas

router = APIRouter(prefix="/ratings", tags=["ratings"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Rating)
def create_rating(rating: schemas.RatingCreate, db: Session = Depends(get_db)):
    # Validate rating range
    if rating.rating < 1 or rating.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    db_rating = models.Rating(**rating.model_dump())
    db.add(db_rating)
    db.commit()
    db.refresh(db_rating)
    return db_rating

@router.get("/{restaurant_id}", response_model=List[schemas.Rating])
def get_restaurant_ratings(restaurant_id: int, db: Session = Depends(get_db)):
    return db.query(models.Rating).filter(models.Rating.restaurant_id == restaurant_id).order_by(models.Rating.created_at.desc()).all()
