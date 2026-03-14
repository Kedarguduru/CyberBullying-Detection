import os
import pytesseract

def test_tesseract():
    common_paths = [
        r'C:\Program Files\Tesseract-OCR\tesseract.exe',
        r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
        os.path.join(os.environ.get('USERPROFILE', ''), r'AppData\Local\Tesseract-OCR\tesseract.exe')
    ]
    
    found = False
    for path in common_paths:
        if os.path.exists(path):
            print(f"✅ FOUND: Tesseract-OCR localized at: {path}")
            pytesseract.pytesseract.tesseract_cmd = path
            found = True
            break
            
    if found:
        try:
            version = pytesseract.get_tesseract_version()
            print(f"🚀 VERIFIED: Version detected: {version}")
            print("\nSYSTEM READY: You can now restart your 'app.py' server.")
        except Exception as e:
            print(f"❌ ERROR: Found but not functional: {e}")
    else:
        print("❌ NOT FOUND: Ensure you installed to 'C:\\Program Files\\Tesseract-OCR'")

if __name__ == "__main__":
    test_tesseract()
