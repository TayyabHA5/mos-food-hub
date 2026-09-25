from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import database, models, schemas, auth

router = APIRouter(prefix="/notifications", tags=["notifications"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Notification)
def create_notification(notification: schemas.NotificationCreate, db: Session = Depends(get_db)):
    db_notification = models.Notification(**notification.model_dump())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

@router.get("/active", response_model=List[schemas.Notification])
def get_active_notifications(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # If user is a restaurant admin, only show notifications for their restaurant
    if current_user.role == "admin":
        restaurant = db.query(models.Restaurant).filter(models.Restaurant.admin_id == current_user.id).first()
        if not restaurant:
            return []
        return db.query(models.Notification).filter(
            models.Notification.restaurant_id == restaurant.id,
            models.Notification.status == "pending"
        ).order_by(models.Notification.created_at.desc()).all()

    # Super admin sees all active notifications
    return db.query(models.Notification).filter(
        models.Notification.status == "pending"
    ).order_by(models.Notification.created_at.desc()).all()

@router.put("/{notification_id}/dismiss")
def dismiss_notification(
    notification_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    notification = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    # Check if user has permission (admin of this restaurant or super_admin)
    if current_user.role == "admin":
        restaurant = db.query(models.Restaurant).filter(models.Restaurant.admin_id == current_user.id).first()
        if not restaurant or notification.restaurant_id != restaurant.id:
            raise HTTPException(status_code=403, detail="Not authorized to dismiss this notification")

    notification.status = "dismissed"
    db.commit()
    return {"message": "Notification dismissed"}
