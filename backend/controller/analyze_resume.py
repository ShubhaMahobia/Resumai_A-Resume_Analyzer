from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.models import db, Job, Resume
from flask import request
import json
import google.generativeai as genai
import os
from controller.resume_contoller import ResumeController
class GeminiResumeExtractor:
    def __init__(self):
        # Initialize Gemini API
        genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel('gemini-pro')
    
    def extract_entities(self, text):
        # Construct a prompt that instructs Gemini to extract specific information
        prompt = f"""
        Extract the following information from this resume:
        1. Skills: List all technical and soft skills mentioned
        2. Education: Extract educational institutions, degrees, fields of study, and years
        3. Experience: Extract work history including company names, job titles, durations, and responsibilities
        4. Certifications: List all professional certifications mentioned
        
        Format your response as a JSON object with these four categories as keys.
        
        Resume text:
        {text}
        """
        
        try:
            response = self.model.generate_content(prompt)
            
            # Parse the response - assuming Gemini returns properly formatted JSON
            # If it doesn't, we'll need to process the text response
            try:
                # Try to extract JSON from the response
                response_text = response.text
                # Check if response is wrapped in markdown code blocks
                if "```json" in response_text:
                    json_content = response_text.split("```json")[1].split("```")[0].strip()
                elif "```" in response_text:
                    json_content = response_text.split("```")[1].strip()
                else:
                    json_content = response_text
                
                extracted_data = json.loads(json_content)
                
                # Ensure all expected keys exist
                expected_keys = ["skills", "education", "experience", "certifications"]
                for key in expected_keys:
                    if key not in extracted_data:
                        extracted_data[key] = []
                
                return extracted_data
            
            except json.JSONDecodeError:
                # Fallback in case Gemini doesn't return proper JSON
                # Simple extraction logic
                lines = response.text.split('\n')
                extracted_data = {
                    "skills": [],
                    "education": [],
                    "experience": [],
                    "certifications": []
                }
                
                current_section = None
                for line in lines:
                    line = line.strip()
                    if "Skills:" in line:
                        current_section = "skills"
                    elif "Education:" in line:
                        current_section = "education"
                    elif "Experience:" in line:
                        current_section = "experience"
                    elif "Certifications:" in line:
                        current_section = "certifications"
                    elif current_section and line:
                        extracted_data[current_section].append(line)
                
                return extracted_data
        
        except Exception as e:
            print(f"Error in Gemini API call: {str(e)}")
            # Return empty data if API call fails
            return {
                "skills": [],
                "education": [],
                "experience": [],
                "certifications": []
            }
        

class ResumeResource(Resource):
    @jwt_required()
    def post(self, job_id=None):
        user_id = get_jwt_identity()
        
        # Check if a file was uploaded
        if 'resume' not in request.files:
            return {"message": "No resume file provided"}, 400
        
        uploaded_file = request.files["resume"]
        if uploaded_file.filename == '':
            return {"message": "No file selected"}, 400
        
        # Save the file temporarily
        import tempfile
        import os
        
        temp_dir = tempfile.gettempdir()
        file_path = os.path.join(temp_dir, uploaded_file.filename)
        uploaded_file.save(file_path)
        
        try:
            # Process the resume
            resume_controller = ResumeController()
            gemini_extractor = GeminiResumeExtractor()
            
            # Extract text from the file
            extracted_text = resume_controller.extract_text(file_path)
            
            # Preprocess the text
            processed_text = resume_controller.textPreProcessing(extracted_text)
            
            # Use Gemini to extract entities
            ner_data = gemini_extractor.extract_entities(" ".join(processed_text))
            
            # Save data to database
            new_resume = Resume(
                user_id=user_id,
                job_id=job_id,
                file_path=uploaded_file.filename,
                extracted_text=extracted_text,
                processed_text=" ".join(processed_text),
                extracted_skills=json.dumps(ner_data["skills"]),
                extracted_education=json.dumps(ner_data["education"]),
                extracted_experience=json.dumps(ner_data["experience"]),
                extracted_certifications=json.dumps(ner_data["certifications"])
            )
            
            db.session.add(new_resume)
            db.session.commit()
            
            return {
                "message": "Resume processed successfully",
                "resume_id": new_resume.id,
                "extracted_data": ner_data
            }, 201
            
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error processing resume: {str(e)}"}, 500
        
        finally:
            # Clean up the temporary file
            if os.path.exists(file_path):
                os.remove(file_path)
