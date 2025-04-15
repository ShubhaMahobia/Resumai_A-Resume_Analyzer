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
    job_type = db.Column(db.String(100), nullable = False)
    job_location = db.Column(db.String(100), nullable = False)
    company = db.Column(db.String(100), nullable = False)
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
    
    # Raw & Preprocessed text
    extracted_text = db.Column(db.Text, nullable=True)
    processed_text = db.Column(db.Text, nullable=True)

    # Structured Information
    personal_info = db.Column(db.JSON, nullable=True)  # { name, email, github, linkedin, other_links }
    extracted_skills = db.Column(db.JSON, nullable=True)  # [ "Python", "Flask" ]
    extracted_experience = db.Column(db.JSON, nullable=True)  # [{ company, tenure, roles_and_responsibilities }]
    extracted_projects = db.Column(db.JSON, nullable=True)  # [{ skills_used, description }]
    extracted_certifications = db.Column(db.JSON, nullable=True)  # [{ name, offered_by }]
    extracted_education = db.Column(db.JSON, nullable=True)  # Optional, if still used
    
    # Similarity scores with job
    description_similarity = db.Column(db.Float, nullable=True)  # Experience vs job description similarity
    skills_similarity = db.Column(db.Float, nullable=True)  # Skills vs job skills similarity
    projects_similarity = db.Column(db.Float, nullable=True)  # Projects vs job skills similarity
    overall_similarity = db.Column(db.Float, nullable=True)  # Overall weighted similarity score
    
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False)


class AppliedJobs(db.Model):
    __tablename__ = "applied_jobs"

    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    user_id = db.Column(db.String(32), db.ForeignKey('users.id'), nullable=False, index=True) # The applicant (Candidate)
    job_id = db.Column(db.String(32), db.ForeignKey('jobs.id'), nullable=False, index=True) # The job applied for
    resume_id = db.Column(db.String(32), db.ForeignKey('resumes.id'), nullable=False) # The specific resume used for this application
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)
    match_score = db.Column(db.Numeric(5, 2), nullable=True, index=True) # The calculated similarity score!
    status = db.Column(db.String(20), default='Pending', nullable=False, index=True) # e.g., Pending, Reviewed, Shortlisted, Rejected
    # is_deleted could be added if applications can be withdrawn/deleted

    # Relationships
    applicant = db.relationship('User', backref=db.backref('applications', lazy=True))
    job = db.relationship('Job', backref=db.backref('applications', lazy=True))
    resume_used = db.relationship('Resume', backref=db.backref('applications', lazy=True))

    # Unique constraint: A user can apply to a specific job only once.
    __table_args__ = (db.UniqueConstraint('user_id', 'job_id', name='unique_user_job_application'),)
