from app.database import SessionLocal, Base, engine
from app import models
import bcrypt

def get_direct_password_hash(password: str) -> str:
    # Direct hash using bcrypt to avoid passlib version compatibility bugs in Python 3.14
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def create_initial_admin():
    # Make sure tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if admin already exists
        existing_user = db.query(models.User).filter(models.User.username == "admin").first()
        if existing_user:
            print("\n============ ADMIN USER INFO ============")
            print("Admin user already exists!")
            print("Username: admin")
            print("Password: adminpassword123")
            print("=========================================\n")
            return

        # Create new admin user with direct bcrypt hash
        hashed_pwd = get_direct_password_hash("adminpassword123")
        admin_user = models.User(
            username="admin",
            hashed_password=hashed_pwd,
            role="super_admin"
        )

        db.add(admin_user)
        db.commit()
        print("\n🎉 SUCCESS: Initial Super Admin User Created Successfully!")
        print("============ LOGIN CREDENTIALS ============")
        print("Username: admin")
        print("Password: adminpassword123")
        print("===========================================\n")

    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_initial_admin()
