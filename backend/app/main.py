from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import bcrypt

from .database import Base, engine, SessionLocal
from . import models
from .routers import restaurants, notifications, auth_router, ratings
# Ensure default admin user exists
def init_admin():
    db = SessionLocal()
    try:
        existing_user = db.query(models.User).filter(models.User.username == "admin").first()
        if not existing_user:
            salt = bcrypt.gensalt()
            hashed_pwd = bcrypt.hashpw("adminpassword123".encode('utf-8'), salt).decode('utf-8')
            admin_user = models.User(
                username="admin",
                hashed_password=hashed_pwd,
                role="super_admin"
            )
            db.add(admin_user)
            db.commit()
    except Exception as e:
        print("Init admin error:", e)
    finally:
        db.close()

init_admin()

app = FastAPI(title="MOS Food Hub API")

# Allow CORS for all origins (both HTTP and HTTPS e.g. Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://mos-food-hub.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static directory exists
static_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if not os.path.exists(static_path):
    os.makedirs(static_path)

# Serve uploaded files
app.mount("/static", StaticFiles(directory=static_path), name="static")

app.include_router(auth_router.router)
app.include_router(restaurants.router)
app.include_router(notifications.router)
app.include_router(ratings.router)


@app.get("/")
def read_root():
    return {"message": "MOS Food Hub API is running"}
