# database/init_db.py
# Run this script to create all database tables
# Usage: python -m database.init_db

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import Base, engine

def init_database():
    """Creates all tables defined in the models."""
    print("🌱 Creating WellMind database tables...")
    
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        print("\nTables created:")
        for table in Base.metadata.tables.keys():
            print(f"  - {table}")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        print("\nMake sure:")
        print("  1. PostgreSQL is running")
        print("  2. Your DATABASE_URL in .env is correct")
        print("  3. The 'wellmind' database exists")
        raise

if __name__ == "__main__":
    init_database()
