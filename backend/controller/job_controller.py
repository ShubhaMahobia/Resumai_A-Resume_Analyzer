from flask import request, jsonify
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.models import db, Job  # Importing Job model
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
    def get(self):
        try:
            job_id = request.args.get('job_id')
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
