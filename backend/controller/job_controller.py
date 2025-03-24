from flask import request, jsonify
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.models import db, Job  # Importing Job model

class PostJob(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()
        current_recruiter_id = get_jwt_identity()

        job_title = data.get('job_title')
        job_desc = data.get('job_desc')
        key_skills = data.get('key_skills')

        if not job_title or not job_desc or not key_skills:
            return {"message": "Missing required fields"}, 400

        new_job = Job(
            job_title=job_title,
            job_description=job_desc,
            key_skills=key_skills,
            recruiter_id=current_recruiter_id
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
                    "key_skills": job.key_skills,
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