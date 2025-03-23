from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from uuid import uuid4

# Initialize SQLAlchemy
db = SQLAlchemy()

def get_uuid():
    return uuid4().hex

# ---------------------------- USER MODEL ---------------------------- #
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    email = db.Column(db.String(345), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)
    fullName = db.Column(db.String(40), nullable=False)
    role = db.Column(db.Integer, nullable=False)  # Candidate = 0, Recruiter = 1
    profile_completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False)

    # Relationship
    jobs = db.relationship('Job', backref='recruiter', lazy=True)
    resumes = db.relationship('Resume', backref='user', lazy=True)

# ---------------------------- JOB MODEL ---------------------------- #
class Job(db.Model):
    __tablename__ = "jobs"
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    job_title = db.Column(db.String(100), nullable=False)
    job_description = db.Column(db.Text, nullable=False)
    key_skills = db.Column(db.Text, nullable=False)
    recruiter_id = db.Column(db.String(32), db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    is_deleted = db.Column(db.Boolean, default=False)

    # Relationship
    resumes = db.relationship('Resume', backref='job', lazy=True)

# ---------------------------- RESUME MODEL ---------------------------- #
class Resume(db.Model):
    __tablename__ = "resumes"
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    user_id = db.Column(db.String(32), db.ForeignKey('users.id'), nullable=False)
    job_id = db.Column(db.String(32), db.ForeignKey('jobs.id'), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    extracted_text = db.Column(db.Text, nullable=True)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    match_score = db.Column(db.Numeric(5, 2), nullable=True)  # Decimal(5,2) for precision
    status = db.Column(db.String(20), default='Pending')  # Pending, Reviewed, Shortlisted
    is_deleted = db.Column(db.Boolean, default=False)
