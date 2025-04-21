#!/usr/bin/env python3
import nltk
import os
import sys

def diagnose_nltk():
    """Diagnose NLTK data setup and availability"""
    print("\n=== NLTK DIAGNOSTICS ===\n")
    
    # Print Python version and paths
    print(f"Python version: {sys.version}")
    print(f"Working directory: {os.getcwd()}")
    
    # Check NLTK version
    print(f"NLTK version: {nltk.__version__}")
    
    # Check NLTK data path
    print("\nNLTK data paths:")
    for path in nltk.data.path:
        exists = os.path.exists(path)
        print(f"  - {path} {'(exists)' if exists else '(does not exist)'}")
    
    # Test loading resources
    print("\nTesting resource loading:")
    resources_to_test = ['tokenizers/punkt', 'corpora/stopwords', 'corpora/wordnet']
    
    for resource in resources_to_test:
        try:
            nltk.data.find(resource)
            print(f"  - {resource}: ✓ Found")
        except LookupError as e:
            print(f"  - {resource}: ✗ Not found - {str(e)}")
    
    # Download missing resources
    print("\nDownloading any missing resources:")
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')
    
    # Check system environment variables
    print("\nEnvironment variables:")
    print(f"  NLTK_DATA: {os.environ.get('NLTK_DATA', 'Not set')}")
    
    print("\n=== END OF DIAGNOSTICS ===\n")

if __name__ == "__main__":
    diagnose_nltk() 