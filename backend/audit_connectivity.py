import asyncio
import os
import firebase_admin
from firebase_admin import credentials, firestore
import google.generativeai as genai
from app.core.config import get_settings

async def audit_backend():
    settings = get_settings()
    print("--- SEWA Backend Audit ---")
    print(f"Project ID: {settings.firebase_project_id}")
    print(f"Credentials Path: {settings.google_application_credentials}")
    
    # 1. Test Firestore Connectivity
    print("\n[1/2] Testing Firestore Connectivity...")
    try:
        if not firebase_admin._apps:
            cred_path = settings.google_application_credentials
            if not os.path.isabs(cred_path):
                # Ensure we have an absolute path relative to the current working directory
                backend_dir = os.path.dirname(os.path.abspath(__file__))
                cred_path = os.path.join(backend_dir, cred_path)
            
            print(f"   Using credentials from: {cred_path}")
            if not os.path.exists(cred_path):
                raise FileNotFoundError(f"Credentials file not found at {cred_path}")
                
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            
        db = firestore.client()
        # Try a simple write/read test
        test_ref = db.collection('audit_test').document('last_run')
        test_ref.set({
            'timestamp': firestore.SERVER_TIMESTAMP,
            'status': 'verified'
        })
        doc = test_ref.get()
        if doc.exists:
            print("[SUCCESS] Firestore Connection")
            print(f"   Data: {doc.to_dict()}")
        else:
            print("[FAILED] Firestore Connection (Doc not found after write)")
    except Exception as e:
        print(f"[FAILED] Firestore Connection")
        print(f"   Error: {str(e)}")

    # 2. Test Gemini AI Connectivity
    print("\n[2/2] Testing Gemini AI Connectivity...")
    try:
        if not settings.gemini_api_key:
            print("[WARNING] Skipping Gemini test (Missing API Key in .env)")
        else:
            genai.configure(api_key=settings.gemini_api_key)
            model = genai.GenerativeModel('gemini-3-flash-preview')
            response = model.generate_content("Say 'Gemini OK' if you can read this.")
            print(f"[SUCCESS] Gemini AI Connection")
            print(f"   Response: {response.text.strip()}")
    except Exception as e:
        print(f"[FAILED] Gemini AI Connection")
        print(f"   Error: {str(e)}")

    print("\n--- Audit Complete ---")

if __name__ == "__main__":
    asyncio.run(audit_backend())
