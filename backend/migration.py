from flask import Flask
from models.models import db
from config import ApplicationConfig
import sqlalchemy as sa
from sqlalchemy import text

app = Flask(__name__)
app.config.from_object(ApplicationConfig)
db.init_app(app)

def add_llm_similarity_column():
    """Add llm_similarity column to the resumes table"""
    with app.app_context():
        # Check if the column already exists
        inspector = sa.inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('resumes')]
        
        if 'llm_similarity' not in columns:
            print("Adding llm_similarity column to resumes table...")
            # Add the new column
            with db.engine.connect() as conn:
                conn.execute(text("ALTER TABLE resumes ADD COLUMN llm_similarity FLOAT"))
                conn.commit()
            print("Column added successfully.")
        else:
            print("Column llm_similarity already exists. Skipping.")

if __name__ == "__main__":
    add_llm_similarity_column() 