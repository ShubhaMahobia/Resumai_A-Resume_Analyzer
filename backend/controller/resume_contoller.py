import PyPDF2 as pdf
import string
import nltk
import re
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

nltk.download('punkt')
nltk.download('wordnet')
nltk.download('stopwords')

class ResumeController:

    def extract_text(self, file):
        if not file:
            return "NO FILE UPLOADED"

        try:
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
        if not extracted_text: 
            return ""

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
        def remove_stopwords(text):
            stop_words = set(stopwords.words('english'))
            return " ".join([word for word in text.split() if word not in stop_words])
        
        preProcessedText = remove_stopwords(preProcessedText)

        # Tokenization 
        tokens = word_tokenize(preProcessedText)

        # Lemmatization
        word_lemmatizer = WordNetLemmatizer()
        lemmatized_tokens = [word_lemmatizer.lemmatize(token) for token in tokens]

        return lemmatized_tokens
