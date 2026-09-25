from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    username: str
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Rating Schemas
class RatingBase(BaseModel):
    restaurant_id: int
    user_name: Optional[str] = "Anonymous"
    rating: int
    comment: Optional[str] = None

class RatingCreate(RatingBase):
    pass

class Rating(RatingBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Restaurant Schemas
class RestaurantBase(BaseModel):
    name: str
    slug: str
    cuisine: str
    floor: str
    tagline: Optional[str] = None
    logo_url: Optional[str] = None
    menu_images: Optional[str] = None # JSON string of image URLs
    opening_time: Optional[str] = "11:00"
    closing_time: Optional[str] = "23:00"
    status_override: Optional[str] = "auto"

class RestaurantCreate(RestaurantBase):
    admin_id: Optional[int] = None

class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    cuisine: Optional[str] = None
    floor: Optional[str] = None
    tagline: Optional[str] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    status_override: Optional[str] = None

class MenuImageDelete(BaseModel):
    image_url: str

class Restaurant(RestaurantBase):
    id: int
    admin_id: Optional[int] = None
    average_rating: float = 0.0
    ratings_count: int = 0
    is_open: bool = True
    model_config = ConfigDict(from_attributes=True)

# Notification Schemas
class NotificationBase(BaseModel):
    restaurant_id: int
    title: str
    message: str
    status: Optional[str] = "pending"

class NotificationCreate(NotificationBase):
    pass

class Notification(NotificationBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
