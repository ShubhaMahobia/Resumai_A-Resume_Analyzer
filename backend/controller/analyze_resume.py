import spacy
import json
from models.models import db,Resume
from flask import request, jsonify
from controller.resume_contoller import ResumeController
class ResumeNER:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")

    def extract_entities(self, text):
        doc = self.nlp(text)

        extracted_data = {
            "skills": [],
            "education": [],
            "experience": [],
            "certifications": []
        }

        for ent in doc.ents:
            if ent.label_ in ["ORG", "GPE"]:  # Education & Companies
                extracted_data["education"].append(ent.text)
            elif ent.label_ in ["DATE"]:  # Experience durations
                extracted_data["experience"].append(ent.text)
            elif ent.label_ in ["PERSON"]:  # Sometimes certifications appear as names
                extracted_data["certifications"].append(ent.text)
            elif ent.label_ in ["PRODUCT", "WORK_OF_ART"]:  # Skills detection
                extracted_data["skills"].append(ent.text)

        # Convert lists to sets to remove duplicates
        extracted_data = {key: list(set(value)) for key, value in extracted_data.items()}
        return extracted_data
    
    
    def process_resume(self,file_path, user_id, job_id):
        resume_controller = ResumeController()
        ner_extractor = ResumeNER()

        with open(file_path, "rb") as file:
            extracted_text = resume_controller.extract_text(file_path)
        
        uploaded_file = request.files["resume"]  # Get the file object
        filename = uploaded_file.filename  # Extract filename


    # Preprocess text
        processed_text = resume_controller.textPreProcessing(extracted_text)

    # Perform NER
        ner_data = ner_extractor.extract_entities(" ".join(processed_text))

    # Save data to database
        new_resume = Resume(
            user_id=user_id,
            job_id=job_id,
            file_path=filename,
            extracted_text=extracted_text,
            processed_text=" ".join(processed_text),
            extracted_skills=json.dumps(ner_data["skills"]),
            extracted_education=json.dumps(ner_data["education"]),
            extracted_experience=json.dumps(ner_data["experience"]),
            extracted_certifications=json.dumps(ner_data["certifications"])
        )

        print(new_resume.extracted_experience)

        db.session.add(new_resume)
        db.session.commit()
