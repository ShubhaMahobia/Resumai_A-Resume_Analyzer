from flask import request, jsonify
from flask_restful import Resource
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.models import db, User, Resume, AppliedJobs
from controller.resume_contoller import ResumeProcessor
from datetime import datetime
from utils.email_utils import send_welcome_email
import PyPDF2
import tempfile
import os
UPLOAD_FOLDER = "uploads"
bcrypt = Bcrypt()

class UserRegistration(Resource):
    def post(self):
        data = request.get_json()
        fullName = data.get('fullName')
        password = data.get('password')
        email = data.get('email')
        role = data.get('role')

        if not fullName or not password or not email:
            return {'Message': 'Fill all the details'}, 400
        if User.query.filter_by(email=email).first():
            return {'Message': 'User already exists with this email.'}, 400

        hash_pw = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(
            fullName=fullName, 
            email=email, 
            password=hash_pw,
            role=role,
            email_verified=True  # All users are verified by default now
        )
        
        # Add user to database
        db.session.add(new_user)
        db.session.commit()
        
        # Send welcome email for candidates only
        if role == 0:  # Candidate
            try:
                # Send welcome email
                send_welcome_email(new_user)
                print(f"Welcome email sent to: {email}")
                
                return {
                    'Message': 'User created successfully. Welcome email has been sent.',
                }, 201
            except Exception as e:
                print(f"Error sending welcome email: {str(e)}")
                # Return success even if email fails
                return {
                    'Message': 'User created successfully.',
                }, 201
        else:
            # For recruiters
            return {'Message': 'User created Successfully'}, 201

class UserLogin(Resource):
    def post(self):
        data = request.get_json()
        password = data.get('password')
        email = data.get('email')

        if not email or not password:
            return {'Message': 'Fill all the details'}, 400

        user_exist = User.query.filter_by(email=email).first()

        if not user_exist:
            return {'Message': 'Invalid Credentials'}, 401

        if user_exist and bcrypt.check_password_hash(user_exist.password, password):
            access_token = create_access_token(identity=user_exist.id)
            return {'access_token': access_token,
                    'Role': user_exist.role}, 200

        return {'Message': 'Invalid Credentials'}, 401

class UserProfile(Resource):
    @jwt_required()
    def get(self):
        current_user_id = get_jwt_identity()
        return {'Message': f'Current User ID: {current_user_id}'}, 200

class ResumeUploadResource(Resource):
    @jwt_required()
    def post(self):
        if "resume" not in request.files:
            return {"error": "No file uploaded"}, 400

        file = request.files["resume"]
        job_id = request.form.get("job_id")

        if not job_id:
            return {"error": "Job ID is required"}, 400

        current_user_id = get_jwt_identity()

        try:
            # Save uploaded file to a temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                temp_file.write(file.read())
                temp_path = temp_file.name

            # Extract text from the temporary PDF
            text = ""
            with open(temp_path, "rb") as pdf_file:
                reader = PyPDF2.PdfReader(pdf_file)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text

            # Cleanup temp file
            os.remove(temp_path)
            
            # Process resume through the pipeline and get the results
            result = ResumeProcessor.process_resume(extracted_text=text,user_id=current_user_id,job_id=job_id)
            
            # Check if processing returned an error message
            if isinstance(result, dict) and result.get("Message", "").startswith("Error"):
                 return {"error": result.get("Message", "Unknown processing error")}, 500
            
            return {
                "message": "Resume uploaded and processed successfully",
                "match_details": result # Return the detailed match results
            }, 200

        except Exception as e:
            return {"error": f"Error processing resume: {str(e)}"}, 500

class FetchAppliedJobs(Resource):
    @jwt_required()
    def get(self):
        try:
            # Get the current user ID from JWT
            current_user_id = get_jwt_identity()
            print(f"[DEBUG] Fetching applied jobs for User ID: {current_user_id}")

            # Query applied jobs for the user
            applied_jobs = AppliedJobs.query.filter_by(user_id=current_user_id).all()

            if not applied_jobs:
                print(f"[DEBUG] No applied jobs found for User {current_user_id}")
                return {"message": "No applied jobs found"}, 404

            # Formatting response
            job_list = []
            for job in applied_jobs:
                job_info = {
                    "job_id": job.job_id,
                    "applied_at": job.applied_at.strftime("%Y-%m-%d %H:%M:%S")  # Formatting timestamp
                }
                job_list.append(job_info)

            print(f"[DEBUG] Found {len(job_list)} applied jobs for User {current_user_id}")
            return {"applied_jobs": job_list}, 200

        except Exception as e:
            print(f"[ERROR] Exception Occurred: {str(e)}")  # Debugging error message
            return {"error": str(e)}, 500