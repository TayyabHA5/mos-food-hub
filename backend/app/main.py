from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .database import Base, engine
from .routers import restaurants, notifications, auth_router, ratings

# Create tables in SQLite database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MOS Food Hub API")

# Robust CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="http://.*",
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
