from flask import request, jsonify
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.models import db, Job, AppliedJobs, User, Resume  # Importing Job model and related models
from datetime import datetime

class PostJob(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()
        current_recruiter_id = get_jwt_identity()
        
        required_fields = ['job_title', 'job_desc', 'key_skills', 'job_type', 'job_location', 'company']
        missing_fields = [field for field in required_fields if not data.get(field)]

        if missing_fields:
            return {
                "message": "Missing required fieldsaa",
                "missing_fields": missing_fields
            }, 400

        new_job = Job(
            job_title=data['job_title'],
            job_description=data['job_desc'],
            key_skills=data['key_skills'],
            job_type=data['job_type'],
            job_location=data['job_location'],
            company=data['company'],
            recruiter_id=current_recruiter_id,
            created_at=datetime.utcnow(),
            is_active=True,
            is_deleted=False
        )
        
        db.session.add(new_job)
        db.session.commit()

        return {
            "message": "Job posted successfully",
            "job_id": new_job.id
        }, 201


    

class GetAllJobs(Resource):
    @jwt_required()
    def get(self):
        try:
            jobs = Job.query.all()
            job_list = [
                {
                    "id": job.id,
                    "job_title": job.job_title,
                    "job_description": job.job_description,
                    "company": job.company,
                    "job_location": job.job_location,
                    "key_skills": job.key_skills,
                    "is_active": job.is_active,
                    "recruiter_id": job.recruiter_id,
                    "created_at": job.created_at
                }
                for job in jobs
            ]
            return jsonify({"success": True, "jobs": job_list})

        except Exception as e:
            return jsonify({"success": False, "message": str(e)})
        
class GetJobById(Resource):
    @jwt_required()
    def get(self, job_id):
        try:
            job = Job.query.get(job_id)

            if not job:
                return jsonify({"success": False, "message": "Job not found"}), 404

            job_details = {
                "id": job.id,
                "job_title": job.job_title,
                "job_description": job.job_description,
                "key_skills": job.key_skills,
                "recruiter_id": job.recruiter_id,
                "created_at": job.created_at
            }
            return jsonify({"success": True, "job": job_details})

        except Exception as e:
            return jsonify({"success": False, "message": str(e)}), 500
        
class GetMyJobs(Resource):
    @jwt_required()
    def get(self):
        current_recruiter_id = get_jwt_identity()  # Get recruiter ID from JWT

        jobs = Job.query.filter_by(recruiter_id=current_recruiter_id, is_deleted=False).all()

        if not jobs:
            return {"message": "No jobs found for this recruiter"}, 404

        job_list = [
            {
                "job_id": job.id,
                "job_title": job.job_title,
                "job_description": job.job_description,
                "key_skills": job.key_skills,
                "job_type": job.job_type,
                "job_location": job.job_location,
                "company": job.company,
                "created_at": job.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "is_active": job.is_active
            }
            for job in jobs
        ]

        return {
            "message": "Jobs fetched successfully",
            "jobs": job_list
        }, 200

class GetJobCandidates(Resource):
    @jwt_required()
    def get(self, job_id):
        try:
            # Get the current recruiter ID from JWT
            current_recruiter_id = get_jwt_identity()
            
            # Check if the job belongs to the current recruiter
            job = Job.query.filter_by(id=job_id, recruiter_id=current_recruiter_id).first()
            
            if not job:
                return {"message": "Job not found or you don't have permission to view candidates"}, 404
            
            # Query all applications for this job
            applications = AppliedJobs.query.filter_by(job_id=job_id).all()
            
            if not applications:
                return {
                    "job_id": job_id,
                    "job_title": job.job_title,
                    "candidates_count": 0,
                    "candidates": []
                }, 200
            
            # Prepare candidate data
            candidates = []
            for app in applications:
                # Get user details
                user = User.query.get(app.user_id)
                # Get resume details
                resume = Resume.query.get(app.resume_id)
                
                if user and resume:
                    candidate_info = {
                        "application_id": app.id,
                        "candidate_id": user.id,
                        "candidate_name": user.fullName,
                        "candidate_email": user.email,
                        "application_date": app.applied_at.strftime("%Y-%m-%d %H:%M:%S"),
                        "match_score": float(app.match_score) if app.match_score else None,
                        "status": app.status,
                        "resume_id": resume.id,
                        "skills": resume.extracted_skills
                    }
                    candidates.append(candidate_info)
            
            return {
                "job_id": job_id,
                "job_title": job.job_title,
                "candidates_count": len(candidates),
                "candidates": candidates
            }, 200
            
        except Exception as e:
            return {"error": str(e)}, 500
