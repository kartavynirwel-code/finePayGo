"""Seed initial data into the database."""
from app.database.session import SessionLocal
from app.models.models import User, TrafficViolation, Vehicle, UserRole, VehicleType
from app.core.security import hash_password


VIOLATIONS = [
    {"name": "Driving without Helmet", "description": "Two-wheeler rider without helmet", "fine_amount": 1000},
    {"name": "Driving without Seatbelt", "description": "Driver or passenger without seatbelt", "fine_amount": 1000},
    {"name": "Red Light Violation", "description": "Jumping a red signal", "fine_amount": 2000},
    {"name": "Over-Speeding", "description": "Driving above the speed limit", "fine_amount": 2000},
    {"name": "Wrong-Side Driving", "description": "Driving on the wrong side of road", "fine_amount": 5000},
    {"name": "Using Mobile while Driving", "description": "Using handheld device while driving", "fine_amount": 1500},
    {"name": "No Valid Insurance", "description": "Vehicle without valid insurance document", "fine_amount": 2000},
    {"name": "Parking Violation", "description": "Parking in a no-parking zone", "fine_amount": 500},
    {"name": "Driving without Valid License", "description": "Driving without a valid driving license", "fine_amount": 5000},
    {"name": "Triple Riding", "description": "More than two persons on a two-wheeler", "fine_amount": 1000},
    {"name": "Drunk Driving", "description": "Driving under influence of alcohol", "fine_amount": 10000},
    {"name": "Tinted Glass Violation", "description": "Using illegal tinted glasses", "fine_amount": 500},
]


def seed_data():
    db = SessionLocal()
    try:
        # Seed violations
        if db.query(TrafficViolation).count() == 0:
            for v in VIOLATIONS:
                db.add(TrafficViolation(**v))
            db.commit()
            print("✅ Seeded traffic violations")

        # Seed admin user
        if not db.query(User).filter(User.email == "admin@finesnap.gov.in").first():
            admin = User(
                name="System Administrator",
                email="admin@finesnap.gov.in",
                password_hash=hash_password("Admin@123"),
                role=UserRole.admin,
            )
            db.add(admin)
            db.commit()
            print("✅ Seeded admin user: admin@finesnap.gov.in / Admin@123")

        # Seed police officer
        if not db.query(User).filter(User.email == "officer@finesnap.gov.in").first():
            officer = User(
                name="Inspector Rajesh Kumar",
                email="officer@finesnap.gov.in",
                password_hash=hash_password("Police@123"),
                role=UserRole.police,
                badge_number="DL-2024-001",
                phone="9876543210",
            )
            db.add(officer)
            db.commit()
            print("✅ Seeded police officer: officer@finesnap.gov.in / Police@123")

        # Seed citizen
        if not db.query(User).filter(User.email == "citizen@example.com").first():
            citizen = User(
                name="Rahul Sharma",
                email="citizen@example.com",
                password_hash=hash_password("Citizen@123"),
                role=UserRole.citizen,
                phone="9123456789",
            )
            db.add(citizen)
            db.commit()

            # Add a vehicle for citizen
            citizen = db.query(User).filter(User.email == "citizen@example.com").first()
            if not db.query(Vehicle).filter(Vehicle.registration_number == "DL01AB1234").first():
                vehicle = Vehicle(
                    registration_number="DL01AB1234",
                    vehicle_type=VehicleType.two_wheeler,
                    owner_name="Rahul Sharma",
                    user_id=citizen.id,
                    make="Honda",
                    model="Activa",
                    color="Blue",
                    year=2022,
                )
                db.add(vehicle)
                db.commit()
            print("✅ Seeded citizen: citizen@example.com / Citizen@123")

    except Exception as e:
        print(f"❌ Seeding error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
