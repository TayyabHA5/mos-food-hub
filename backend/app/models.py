from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from .database import Base

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=UserRole.SUPER_ADMIN)

    # Relationships
    restaurants = relationship("Restaurant", back_populates="admin")

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    cuisine = Column(String, nullable=False)
    floor = Column(String, nullable=False)
    tagline = Column(String)
    logo_url = Column(String)
    menu_images = Column(Text) # JSON string of image URLs
    opening_time = Column(String, default="11:00")
    closing_time = Column(String, default="23:00")
    status_override = Column(String, default="auto") # "auto", "force_open", "force_closed"

    admin_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    admin = relationship("User", back_populates="restaurants")
    notifications = relationship("Notification", back_populates="restaurant")
    ratings = relationship("Rating", back_populates="restaurant", cascade="all, delete-orphan")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    status = Column(String, default="pending") # pending, dismissed
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="notifications")

class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    user_name = Column(String, default="Anonymous")
    rating = Column(Integer, nullable=False) # 1-5
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="ratings")
