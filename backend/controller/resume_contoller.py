from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
import google.generativeai as genai
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
import numpy as np

# Import your models
from models.models import db, Resume, AppliedJobs, Job

# Initialize Lemmatizer
lemmatizer = WordNetLemmatizer()

# Configure the Gemini client
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel("gemini-1.5-flash")

# Configuration
UPLOAD_FOLDER = "uploads/resumes"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

class ResumeProcessor:

    def process_resume(extracted_text,user_id,job_id):
        """
        This is the function which will do all the processing from resume text to score similarity between JD and Resume

        Input - Resume Text
        Output - Score Similarity and Database Saving
        """
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

        structured_data = extract_resume(preProcessedText)
        
        # Parse the JSON string to a Python dictionary if it's in string format
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
                        print("Failed to parse JSON from the response")
                        structured_data = {"error": "Failed to parse structured data"}
        
        # Check for errors in structured_data
        if isinstance(structured_data, dict) and structured_data.get("error"):
            print(f"Error in structured data: {structured_data.get('error')}")
            return {
                "Message": f"Error processing resume: {structured_data.get('error')}"
            }
            
        # Extract job details based on job_id
        job = Job.query.filter_by(id=job_id).first()

        # Extract job description and key skills
        job_description = job.job_description
        key_skills = job.key_skills

        # --- VECTOR SIMILARITY (SEMANTIC) ---
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
        
        # --- KEYWORD MATCHING (EXACT) ---
        # Extract keywords using improved function
        resume_skill_keywords = structured_data.get('skills', [])
        job_skill_keywords = [k.strip() for k in key_skills.split(',') if k.strip()] if isinstance(key_skills, str) else []
        
        experience_keywords = extract_keywords(formatted_experience)
        job_description_keywords = extract_keywords(job_description)
        
        # Calculate keyword match scores
        skill_keyword_match = exact_keyword_match_score(resume_skill_keywords, job_skill_keywords)
        experience_keyword_match = exact_keyword_match_score(experience_keywords, job_description_keywords)
        
        # --- YEARS OF EXPERIENCE MATCHING ---
        required_years = extract_years_experience_required(job_description)
        resume_total_exp_str = structured_data.get('total_years_of_experience')
        experience_years_match_score = compare_years_experience(resume_total_exp_str, required_years)
        
        # --- LLM-BASED SIMILARITY ASSESSMENT ---
        llm_similarity_score = assess_llm_similarity(structured_data, job_description, key_skills)
        
        # --- COMBINED SCORING (Adjusted Weights) ---
        # Weights for score components
        semantic_weight = 0.3
        keyword_weight = 0.35
        experience_years_weight = 0.1
        llm_weight = 0.25  # Add weight for LLM assessment
        
        # Component weights (within semantic/keyword scores)
        experience_desc_weight = 0.4 # Weight for experience description vs job description
        skills_weight = 0.6       # Weight for skills vs key skills
        projects_weight = 0.1     # Lowered weight for projects in semantic score
        
        # Calculate semantic score (adjusted internal weights)
        semantic_score = (
            resume_description_similarity * experience_desc_weight +
            resume_skills_similarity * skills_weight +
            resume_projects_similarity * projects_weight
        )
        
        # Calculate keyword score (adjusted internal weights)
        keyword_score = (
            skill_keyword_match * skills_weight + # Focus more on direct skill keyword match
            experience_keyword_match * experience_desc_weight
        )
        
        # Combined final score
        final_similarity = (
            semantic_score * semantic_weight +
            keyword_score * keyword_weight +
            experience_years_match_score * experience_years_weight +
            llm_similarity_score * llm_weight
        )
        
        # Apply penalty for very low keyword matches in skills (Domain Mismatch)
        if skill_keyword_match < 0.1:  # Less than 10% of job skills matched
            final_similarity *= 0.6  # Stronger penalty
        elif skill_keyword_match < 0.25: # Less than 25% match
            final_similarity *= 0.85 # Moderate penalty
        
        # Ensure score is within 0-1 range
        final_similarity = max(0.0, min(1.0, final_similarity))
        
        print(f"Semantic Score: {semantic_score:.2f}, Keyword Score: {keyword_score:.2f}, Exp Years Score: {experience_years_match_score:.2f}, LLM Score: {llm_similarity_score:.2f}")
        print(f"Final similarity: {final_similarity * 100:.2f}%")

        try:
            # Create the new resume record
            new_resume = Resume(
                user_id=user_id,
                job_id=job_id,
                extracted_text=extracted_text,
                processed_text=preProcessedText,
                personal_info=structured_data.get('personal_info', {}),
                extracted_skills=structured_data.get('skills', []),
                extracted_experience=structured_data.get('experience', []),
                extracted_projects=structured_data.get('projects', []),
                extracted_certifications=structured_data.get('certifications', []),
                extracted_education=structured_data.get('education', []),
                description_similarity=resume_description_similarity,
                skills_similarity=resume_skills_similarity,
                projects_similarity=resume_projects_similarity,
                llm_similarity=llm_similarity_score,  # Add the LLM similarity score
                overall_similarity=final_similarity
            )
            
            db.session.add(new_resume)
            db.session.flush()  # Get the ID of the new resume
            
            # Create a record in AppliedJobs to track the job application
            job_application = AppliedJobs(
                user_id=user_id,
                job_id=job_id,
                resume_id=new_resume.id,
                match_score=final_similarity * 100,  # Convert to percentage
                status='Pending'
            )
            
            db.session.add(job_application)
            db.session.commit()
            
            
        except Exception as e:
            db.session.rollback()
            print(f"Database error: {str(e)}")
            return {
                "Message": f"Error saving resume: {str(e)}"
            }
            
        
def format_experience(experience_list):
    """Format experience data as text for vectorization"""
    if not experience_list:
        return ""
    
    formatted_text = ""
    for exp in experience_list:
        company = exp.get('company', '')
        tenure = exp.get('tenure', '')
        roles = exp.get('roles_and_responsibilities', '')
        
        if isinstance(roles, list):
            roles = ' '.join(roles)
            
        formatted_text += f"{company} {tenure} {roles} "
    
    return formatted_text.strip()

def format_skills(skills_list):
    """Format skills data as text for vectorization"""
    if not skills_list:
        return ""
    
    return ' '.join(skills_list)

def format_projects(projects_list):
    """Format projects data as text for vectorization"""
    if not projects_list:
        return ""
    
    formatted_text = ""
    for project in projects_list:
        title = project.get('title', '')
        skills = project.get('skills_used', [])
        description = project.get('description', '')
        
        if isinstance(skills, list):
            skills = ' '.join(skills)
            
        formatted_text += f"{title} {skills} {description} "
    
    return formatted_text.strip()

def assess_llm_similarity(resume_data, job_description, job_skills):
    """
    Use LLM to assess the similarity between resume and job requirements.
    
    Args:
        resume_data: Structured resume data
        job_description: Job description text
        job_skills: Job required skills
        
    Returns:
        float: Similarity score between 0 and 1
    """
    try:
        # Format resume data for prompt
        experience_text = format_experience(resume_data.get('experience', []))
        skills_text = format_skills(resume_data.get('skills', []))
        projects_text = format_projects(resume_data.get('projects', []))
        education_text = format_education(resume_data.get('education', []))
        total_experience = resume_data.get('total_years_of_experience', 'Not specified')
        
        # Create the prompt for LLM
        prompt = f"""
You are an expert AI recruiter tasked with evaluating how well a candidate's resume matches a job description.

Job Description:
```
{job_description}
```

Required Skills:
```
{job_skills}
```

Candidate's Information:
- Skills: {skills_text}
- Experience: {experience_text}
- Projects: {projects_text}
- Education: {education_text}
- Total Years of Experience: {total_experience}

Based on the detailed analysis of:
1. Skills match (technical and soft skills)
2. Relevant experience match
3. Project relevance to the job
4. Education qualifications
5. Years of experience
6. Overall fit for the role

Rate the candidate's match with the job on a scale of 0 to 1, where:
- 0.0-0.2: Poor match
- 0.3-0.5: Below average match
- 0.6-0.7: Average match
- 0.8-0.9: Good match
- 1.0: Perfect match

Provide ONLY a single number between 0 and 1 (to two decimal places) as your response.
"""

        # Call the LLM
        response = model.generate_content(prompt)
        result = response.text.strip()
        
        # Extract the score from the response
        match = re.search(r'(\d+\.\d+)', result)
        if match:
            score = float(match.group(1))
            # Ensure score is within 0-1 range
            return max(0.0, min(1.0, score))
        else:
            # If no match found, extract first decimal number or default to 0.5
            try:
                score = float(result)
                return max(0.0, min(1.0, score))
            except:
                print(f"Could not parse LLM similarity score from: {result}")
                return 0.5
    except Exception as e:
        print(f"Error in assess_llm_similarity: {str(e)}")
        return 0.5  # Return a neutral score in case of error

def format_education(education_list):
    """Format education data as text"""
    if not education_list:
        return ""
    
    formatted_text = ""
    for edu in education_list:
        degree = edu.get('degree', '')
        institution = edu.get('institution', '')
        year = edu.get('year', '')
        
        formatted_text += f"{degree} from {institution} {year} "
    
    return formatted_text.strip()

def generate_vector_embedding(text):
    """Generate vector embedding for the given text using Google's embedding model"""
    if not text or len(text.strip()) == 0:
        print("DEBUG: generate_vector_embedding received empty text. Returning None.")
        return None
    # Log start and sample text
        
    try:
        
        # Use the genai.embed_content method
        response = genai.embed_content(
            model="models/embedding-001",  # Use the stable embedding model
            content=text,
            task_type="retrieval_document"
        )
        

        
        # Access the embedding from the dictionary response
        if isinstance(response, dict) and 'embedding' in response:
            embedding = response['embedding']
            return np.array(embedding)
        else:
            print(f"DEBUG: Could not find 'embedding' key in response dict: {response}")
            return None
            
    except Exception as e:
        print(f"ERROR in generate_vector_embedding: {str(e)}") # Make error more prominent
        import traceback
        traceback.print_exc()
        return None

def extract_resume(resume_text: str) -> dict:
    prompt = f"""
You are an AI resume parser.

From the following resume text, extract structured information and return it in **valid JSON format**.

Include these fields:

- personal_info: {{
    name: string,
    email: string,
    phone_number: string (if available),
    github: string (if available),
    linkedin: string (if available),
    other_links: list of strings (if any)
}}

- skills: list of strings

- experience: list of {{
    company: string,
    tenure: string (e.g. "Jan 2020 - Mar 2022"),
    roles_and_responsibilities: string or list of bullet points
}}

- projects: list of {{
    title: string,
    skills_used: list of strings,
    description: string
}}

- certifications: list of {{
    name: string,
    offered_by: string
}}

- education: list of {{
    degree: string,
    institution: string,
    year: string (or duration)
}}

- total_years_of_experience: string (e.g. "3.5 years")

Return output in this format:

{{
  "personal_info": {{...}},
  "skills": [...],
  "experience": [...],
  "projects": [...],
  "certifications": [...],
  "education": [...],
  "total_years_of_experience": "..."
}}

Resume Text:
```{resume_text}```
"""
    try:
        # Call the Gemini model with the prompt
        response = model.generate_content(prompt)
        
        # Extract the response text
        result = response.text
        
        # Try to parse JSON from the response
        try:
            # First attempt to parse the entire response as JSON
            structured_data = json.loads(result)
        except json.JSONDecodeError:
            # If that fails, try to extract JSON from the text
            match = re.search(r'{.*}', result, re.DOTALL)
            if match:
                try:
                    structured_data = json.loads(match.group(0))
                except:
                    print("Failed to parse JSON from the response")
                    return {"error": "Failed to parse structured data"}
            else:
                print("No JSON pattern found in response")
                return {"error": "No structured data found in response"}
        
        return structured_data
    except Exception as e:
        print(f"Error in extract_resume: {str(e)}")
        return {"error": f"Failed to extract resume data: {str(e)}"}

def calculate_similarity(vector1, vector2):
    """
    Calculate cosine similarity between two vectors.
    
    Cosine similarity = dot(v1, v2) / (||v1|| * ||v2||)
    
    Args:
        vector1: First vector
        vector2: Second vector
        
    Returns:
        float: Cosine similarity score between 0 and 1
    """
    if vector1 is None or vector2 is None:
        return 0.0
    
    # Calculate dot product
    dot_product = np.dot(vector1, vector2)
    
    # Calculate magnitudes
    magnitude1 = np.linalg.norm(vector1)
    magnitude2 = np.linalg.norm(vector2)
    
    # Avoid division by zero
    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0
        
    # Calculate cosine similarity
    return dot_product / (magnitude1 * magnitude2)

def exact_keyword_match_score(resume_keywords, job_keywords):
    """
    Calculate exact keyword match score between resume and job keywords
    
    Args:
        resume_keywords: List of keywords from resume
        job_keywords: List of keywords from job description
    
    Returns:
        float: Match score between 0 and 1
    """
    if not resume_keywords or not job_keywords:
        return 0.0
    
    # Convert to lowercase sets for case-insensitive matching
    resume_keywords_set = set(k.lower() for k in resume_keywords if k)
    job_keywords_set = set(k.lower() for k in job_keywords if k)
    
    # Count matches
    matches = resume_keywords_set.intersection(job_keywords_set)
    
    # Calculate score based on percentage of job keywords matched
    if len(job_keywords_set) == 0:
        return 0.0
        
    return len(matches) / len(job_keywords_set)

def extract_keywords(text):
    """Extract important keywords from text using lemmatization"""
    if not text:
        return []
    
    # Tokenize, lowercase, remove stopwords, and lemmatize
    words = word_tokenize(text.lower())
    stop_words = set(stopwords.words('english'))
    keywords = [lemmatizer.lemmatize(word) for word in words \
                if word.isalnum() and word not in stop_words and len(word) > 2]
    
    return list(set(keywords)) # Return unique keywords

def extract_years_experience_required(job_description):
    """Extract minimum required years of experience from job description using regex."""
    if not job_description:
        return None
       
    # Regex patterns to find numbers followed by "year", "yr", etc.
    patterns = [
        r'(\d+)\s*\+?\s*years?\b\s*of\s*experience',\
        r'minimum\s*of\s*(\d+)\s*years?\b',\
        r'(\d+)-(\d+)\s*years?\b', # Captures ranges like 3-5 years
        r'at\s*least\s*(\d+)\s*years?\b'
    ]
    
    min_years = float('inf')
    found = False

    for pattern in patterns:
        matches = re.findall(pattern, job_description, re.IGNORECASE)
        for match in matches:
            found = True
            if isinstance(match, tuple): # Handle range pattern (e.g., (3, 5))
                years = int(match[0]) # Take the lower bound of the range
            else:
                years = int(match)
            min_years = min(min_years, years)
           
    return min_years if found else None

def parse_experience_string(exp_string):
    """Attempt to parse a numerical value from experience string like '3.5 years'"""
    if not exp_string:
        return None
    match = re.search(r'(\d+(\.\d+)?)', exp_string)
    return float(match.group(1)) if match else None

def compare_years_experience(resume_exp_str, required_exp_years):
    """Compare resume experience years with required years. Returns score 0-1."""
    if required_exp_years is None:
        return 0.75 # No requirement specified, neutral score

    resume_exp_years = parse_experience_string(resume_exp_str)

    if resume_exp_years is None:
        return 0.25 # Cannot parse resume experience, low score

    if resume_exp_years >= required_exp_years:
        return 1.0 # Meets or exceeds requirement
    elif resume_exp_years >= required_exp_years * 0.8: # Within 80% of requirement
        return 0.6 # Close match
    else:
        return 0.1 # Doesn't meet requirement


