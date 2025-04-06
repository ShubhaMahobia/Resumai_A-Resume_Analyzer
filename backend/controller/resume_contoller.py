from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import request
import os
import json
import tempfile
from datetime import datetime
import re
import string
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import PyPDF2 as pdf
import google.generativeai as genai

# Import your models
from models.models import db, Resume, AppliedJobs

# Configuration
UPLOAD_FOLDER = "uploads/resumes"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

class ResumeProcessor:
    def __init__(self):
        # Initialize Gemini API
        genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel('gemini-pro')
        self.word_lemmatizer = WordNetLemmatizer()
    
    def process_resume(self, file, user_id, job_id):
        """
        Complete pipeline for resume processing:
        1. Upload and save file
        2. Extract text from PDF
        3. Preprocess the text
        4. Extract entities using Gemini
        5. Save to database
        
        Returns: Dictionary with processing results
        """
        try:
            # Step 1: Save the uploaded file with unique name
            unique_file_name = str(datetime.now().timestamp()).replace(".", "")
            ext = file.filename.split(".")[-1]
            final_filename = f"{unique_file_name}.{ext}"
            file_path = os.path.join(UPLOAD_FOLDER, final_filename)
            file.save(file_path)
            
            # Step 2: Extract text from the resume
            extracted_text = self.extract_text(file_path)
            if extracted_text.startswith("ERROR") or extracted_text == "NO TEXT EXTRACTED!" or extracted_text == "NO FILE UPLOADED":
                return {"error": extracted_text}, 400
            
            # Step 3: Preprocess the extracted text
            processed_text = self.textPreProcessing(extracted_text)
            processed_text_str = " ".join(processed_text)
            
            # Step 4: Extract entities using Gemini
            ner_data = self.extract_entities(processed_text_str)
            
            # Step 5: Save resume data in database
            new_resume = Resume(
                user_id=user_id,
                job_id=job_id,
                file_path=final_filename,
                extracted_text=extracted_text,
                processed_text=processed_text_str,
                extracted_skills=json.dumps(ner_data["skills"]),
                extracted_education=json.dumps(ner_data["education"]),
                extracted_experience=json.dumps(ner_data["experience"]),
                extracted_certifications=json.dumps(ner_data["certifications"])
            )
            db.session.add(new_resume)
            
            # Step 6: Record job application
            # Check if application already exists
            existing_application = AppliedJobs.query.filter_by(
                user_id=user_id, job_id=job_id
            ).first()
            
            if not existing_application:
                new_application = AppliedJobs(
                    user_id=user_id,
                    job_id=job_id,
                    resume_filename=final_filename
                )
                db.session.add(new_application)
            
            db.session.commit()
            
            return {
                "message": "Resume processed successfully",
                "resume_id": new_resume.id,
                "application_status": "applied",
                "extracted_data": ner_data,
                "resume_path": final_filename
            }, 201
            
        except Exception as e:
            db.session.rollback()
            return {"error": f"Error processing resume: {str(e)}"}, 500
    
    def extract_text(self, file_path):
        """Extract text from PDF file"""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = pdf.PdfReader(file)
                
                if pdf_reader.is_encrypted:
                    return "FILE IS ENCRYPTED! Unable to extract text."
    
                extracted_text = []
                for page in pdf_reader.pages:
                    text = page.extract_text()
                    if text:  
                        extracted_text.append(text)
    
                if not extracted_text:
                    return "NO TEXT EXTRACTED! The PDF might contain only images."
                
                extracted_final = "\n".join(extracted_text).strip()
    
                return extracted_final 
    
        except Exception as e:
            return f"ERROR READING PDF: {str(e)}"
    
    def textPreProcessing(self, extracted_text):
        """Preprocess extracted text"""
        if not extracted_text: 
            return []

        preProcessedText = extracted_text.lower()  # Convert to lowercase

        # Remove bullet points and special symbols
        preProcessedText = re.sub(r"[•●▪︎▶]", " ", preProcessedText)

        # Remove punctuation
        preProcessedText = preProcessedText.translate(str.maketrans('', '', string.punctuation))

        # Remove non-ASCII characters
        preProcessedText = re.sub(r'[^\x00-\x7F]+', ' ', preProcessedText)

        # Remove extra spaces
        preProcessedText = re.sub(r'\s+', ' ', preProcessedText).strip()

        # Removing stop words
        stop_words = set(stopwords.words('english'))
        filtered_text = " ".join([word for word in preProcessedText.split() if word not in stop_words])
        
        # Tokenization 
        tokens = word_tokenize(filtered_text)

        # Lemmatization
        lemmatized_tokens = [self.word_lemmatizer.lemmatize(token) for token in tokens]

        return lemmatized_tokens
    
    def extract_entities(self, text):
        """Extract entities using Gemini AI"""
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

