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
                "created_at": job.created_at,
                "is_active": job.is_active,
                "is_deleted": job.is_deleted,
                "job_location": job.job_location,
                "company": job.company,
                "job_type": job.job_type
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

class CandidateDetails(Resource):
    @jwt_required()
    def get(self, resume_id):
        try:
            # Get the current recruiter ID from JWT
            current_recruiter_id = get_jwt_identity()
            
            # Get the resume
            resume = Resume.query.get(resume_id)
            
            if not resume:
                return {"message": "Resume not found"}, 404
                
            # Check if the job belongs to the current recruiter
            job = Job.query.filter_by(id=resume.job_id, recruiter_id=current_recruiter_id).first()
            
            if not job:
                return {"message": "You don't have permission to view this resume"}, 403
            
            # Get user details
            user = User.query.get(resume.user_id)
            
            if not user:
                return {"message": "Candidate not found"}, 404
            
            # Helper function to safely parse JSON
            def safe_parse_json(json_data):
                if isinstance(json_data, dict):
                    return json_data
                if isinstance(json_data, str):
                    try:
                        import json
                        return json.loads(json_data)
                    except:
                        return []
                return []
            
            # Format structured data for frontend display
            skills_data = safe_parse_json(resume.extracted_skills) if resume.extracted_skills else []
            experience_data = safe_parse_json(resume.extracted_experience) if resume.extracted_experience else []
            education_data = safe_parse_json(resume.extracted_education) if resume.extracted_education else []
            projects_data = safe_parse_json(resume.extracted_projects) if resume.extracted_projects else []
            certifications_data = safe_parse_json(resume.extracted_certifications) if resume.extracted_certifications else []
            personal_info = safe_parse_json(resume.personal_info) if resume.personal_info else {}
            
            # Ensure all similarity scores are properly handled
            description_similarity = resume.description_similarity if resume.description_similarity is not None else 0
            skills_similarity = resume.skills_similarity if resume.skills_similarity is not None else 0
            projects_similarity = resume.projects_similarity if resume.projects_similarity is not None else 0
            llm_similarity = resume.llm_similarity if resume.llm_similarity is not None else 0
            overall_similarity = resume.overall_similarity if resume.overall_similarity is not None else 0
            
            # Prepare visualization data for similarity scores
            similarity_scores = {
                "skills_similarity": round(skills_similarity * 100, 2),
                "experience_similarity": round(description_similarity * 100, 2),
                "projects_similarity": round(projects_similarity * 100, 2),
                "llm_similarity": round(llm_similarity * 100, 2),
                "overall_similarity": round(overall_similarity * 100, 2)
            }
            
            print(f"Similarity scores being sent: {similarity_scores}")
            
            return {
                "candidate": {
                    "id": user.id,
                    "name": user.fullName,
                    "email": user.email,
                    "personal_info": personal_info
                },
                "job": {
                    "id": job.id,
                    "title": job.job_title,
                    "description": job.job_description,
                    "required_skills": job.key_skills
                },
                "resume": {
                    "id": resume.id,
                    "skills": skills_data,
                    "experience": experience_data,
                    "education": education_data,
                    "projects": projects_data,
                    "certifications": certifications_data,
                },
                "similarity_scores": similarity_scores,
                "uploaded_at": resume.uploaded_at.strftime("%Y-%m-%d %H:%M:%S") if resume.uploaded_at else None
            }, 200
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {"error": str(e)}, 500
