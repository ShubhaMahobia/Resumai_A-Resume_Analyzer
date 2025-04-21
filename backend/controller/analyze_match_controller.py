from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import PyPDF2
import tempfile
import json
import re
import string
import nltk

# Ensure NLTK resources are available
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

from models.models import db, Job
# Import all the necessary functions directly
from controller.resume_contoller import (
    extract_resume, 
    format_experience, 
    format_skills, 
    format_projects,
    generate_vector_embedding,
    calculate_similarity,
    extract_keywords,
    exact_keyword_match_score,
    extract_years_experience_required,
    compare_years_experience,
    assess_llm_similarity
)

class AnalyzeResumeMatch(Resource):
    @jwt_required()
    def post(self):
        """
        API to analyze a resume against a job without saving the application.
        This endpoint receives a resume file and job_id, processes the resume,
        and returns match scores without saving anything to the database.
        """
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
            
            # Process resume using the existing processor but skip database saving
            # We're reusing the process_resume method but with a modified version that doesn't save to the database
            match_results = self.analyze_resume_without_saving(text, job_id)
            
            if isinstance(match_results, dict) and match_results.get("Message", "").startswith("Error"):
                return {"error": match_results.get("Message", "Unknown processing error")}, 500
            
            return {
                "message": "Resume analyzed successfully",
                "match_details": match_results
            }, 200

        except Exception as e:
            import traceback
            traceback.print_exc()
            return {"error": f"Error analyzing resume: {str(e)}"}, 500

    def analyze_resume_without_saving(self, extracted_text, job_id):
        """
        Modified version of ResumeProcessor.process_resume that doesn't save to the database.
        This function processes the resume and returns match results only.
        """
        # Get the existing process_resume function code but remove database operations
        if not extracted_text:
            return {"Message": "Error: No text extracted from resume"}

        try:
            # Extract job details based on job_id
            job = Job.query.filter_by(id=job_id).first()
            if not job:
                return {"Message": "Error: Job not found"}

            # Use the existing functions to process the resume text
            
            # Preprocess text - manually since it's part of the main process_resume function
            preProcessedText = extracted_text.lower()  # Convert to lowercase
            # Remove bullet points and special symbols
            preProcessedText = re.sub(r"[•●▪︎▶]", " ", preProcessedText)
            # Remove punctuation
            preProcessedText = preProcessedText.translate(str.maketrans('', '', string.punctuation))
            # Remove non-ASCII characters
            preProcessedText = re.sub(r'[^\x00-\x7F]+', ' ', preProcessedText)
            # Remove extra spaces
            preProcessedText = re.sub(r'\s+', ' ', preProcessedText).strip()
            
            # Extract structured data using the extracted function
            structured_data = extract_resume(preProcessedText)
            
            if isinstance(structured_data, str):
                try:
                    structured_data = json.loads(structured_data)
                except json.JSONDecodeError:
                    # Extract JSON from the text if it's embedded in markdown or text
                    match = re.search(r'{.*}', structured_data, re.DOTALL)
                    if match:
                        try:
                            structured_data = json.loads(match.group(0))
                        except:
                            return {"Message": "Error: Failed to parse structured data"}
                            
            # Get job details
            job_description = job.job_description
            key_skills = job.key_skills
            
            # Calculate similarity scores using the imported functions directly
            # Format texts for embedding
            formatted_experience = format_experience(structured_data.get('experience', []))
            formatted_skills = format_skills(structured_data.get('skills', []))
            formatted_projects = format_projects(structured_data.get('projects', []))
            
            # Generate vector embeddings
            experience_vector = generate_vector_embedding(formatted_experience)
            skills_vector = generate_vector_embedding(formatted_skills)
            projects_vector = generate_vector_embedding(formatted_projects)
            job_description_vector = generate_vector_embedding(job_description)
            key_skills_vector = generate_vector_embedding(key_skills)
            
            # Calculate semantic similarities
            resume_description_similarity = calculate_similarity(experience_vector, job_description_vector)
            resume_skills_similarity = calculate_similarity(skills_vector, key_skills_vector)
            resume_projects_similarity = calculate_similarity(projects_vector, key_skills_vector)
            
            # Extract keywords
            resume_skill_keywords = structured_data.get('skills', [])
            job_skill_keywords = [k.strip() for k in key_skills.split(',') if k.strip()] if isinstance(key_skills, str) else []
            
            experience_keywords = extract_keywords(formatted_experience)
            job_description_keywords = extract_keywords(job_description)
            
            # Calculate keyword match scores
            skill_keyword_match = exact_keyword_match_score(resume_skill_keywords, job_skill_keywords)
            experience_keyword_match = exact_keyword_match_score(experience_keywords, job_description_keywords)
            
            # Years of experience matching
            required_years = extract_years_experience_required(job_description)
            resume_total_exp_str = structured_data.get('total_years_of_experience')
            experience_years_match_score = compare_years_experience(resume_total_exp_str, required_years)
            
            # LLM-based similarity assessment
            llm_similarity_score = assess_llm_similarity(structured_data, job_description, key_skills)
            
            # Combined scoring with weights
            semantic_weight = 0.3
            keyword_weight = 0.35
            experience_years_weight = 0.1
            llm_weight = 0.25
            
            # Component weights
            experience_desc_weight = 0.4
            skills_weight = 0.6
            
            # Calculate semantic score component
            semantic_score = (
                resume_description_similarity * experience_desc_weight +
                resume_skills_similarity * skills_weight
            )
            
            # Calculate keyword score component
            keyword_score = (
                skill_keyword_match * skills_weight +
                experience_keyword_match * experience_desc_weight
            )
            
            # Calculate final score
            final_similarity = (
                semantic_score * semantic_weight +
                keyword_score * keyword_weight +
                experience_years_match_score * experience_years_weight +
                llm_similarity_score * llm_weight
            )
            
            # Format results to return
            match_details = {
                "match_score": final_similarity * 100,  # Convert to percentage
                "skills_match": resume_skills_similarity * 100,  # Convert to percentage
                "domain_match_level": self.get_domain_match_level(final_similarity),
                "key_matching_skills": self.find_matching_skills(resume_skill_keywords, job_skill_keywords)
            }
            
            return match_details
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {"Message": f"Error processing resume: {str(e)}"}
            
    @staticmethod        
    def get_domain_match_level(similarity_score):
        """Determine domain match level based on similarity score."""
        if similarity_score >= 0.85:
            return "Excellent"
        elif similarity_score >= 0.75:
            return "Strong"
        elif similarity_score >= 0.6:
            return "Good"
        elif similarity_score >= 0.45:
            return "Moderate"
        else:
            return "Low"
    
    @staticmethod
    def find_matching_skills(resume_skills, job_skills):
        """Find matching skills between resume and job requirements."""
        if not resume_skills or not job_skills:
            return []
            
        # Convert to lowercase for case-insensitive comparison
        resume_skills_lower = [skill.lower() for skill in resume_skills]
        job_skills_lower = [skill.lower() for skill in job_skills]
        
        matching_skills = []
        for idx, skill in enumerate(resume_skills):
            if resume_skills_lower[idx] in job_skills_lower:
                matching_skills.append(skill)
                
        return matching_skills[:5]  # Return top 5 matching skills 