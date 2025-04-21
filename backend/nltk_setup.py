import nltk
import os

def download_nltk_data():
    """Download required NLTK data packages."""
    print("Downloading NLTK data packages...")
    # Create a directory for NLTK data if it doesn't exist
    nltk_data_dir = os.environ.get('NLTK_DATA', os.path.join(os.path.dirname(__file__), 'nltk_data'))
    os.makedirs(nltk_data_dir, exist_ok=True)
    
    # Set the download directory
    nltk.data.path.append(nltk_data_dir)
    
    # Download required packages
    nltk.download('punkt', download_dir=nltk_data_dir)
    nltk.download('stopwords', download_dir=nltk_data_dir)
    nltk.download('wordnet', download_dir=nltk_data_dir)
    
    print(f"NLTK data downloaded to {nltk_data_dir}")
    print("NLTK data paths:", nltk.data.path)

if __name__ == "__main__":
    download_nltk_data() 