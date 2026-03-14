import os
import imageio_ffmpeg as ffmpeg
from pydub import AudioSegment
import shutil

# Configure pydub and systems to use ffmpeg from imageio-ffmpeg
ffmpeg_exe = ffmpeg.get_ffmpeg_exe()
ffmpeg_dir = os.path.dirname(ffmpeg_exe)
AudioSegment.converter = ffmpeg_exe
os.environ["IMAGEIO_FFMPEG_EXE"] = ffmpeg_exe

# Add ffmpeg directory to PATH so whisper can find it
if ffmpeg_dir not in os.environ["PATH"]:
    os.environ["PATH"] = ffmpeg_dir + os.path.pathsep + os.environ["PATH"]

# Ensure there is a file named 'ffmpeg.exe' in that directory for whisper
ffmpeg_target = os.path.join(ffmpeg_dir, "ffmpeg.exe")
if not os.path.exists(ffmpeg_target):
    try:
        shutil.copy2(ffmpeg_exe, ffmpeg_target)
    except Exception as e:
        print(f"Warning: Could not create ffmpeg.exe symlink/copy: {e}")

import pickle
import re
import random
import datetime
import warnings
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from flask_mail import Mail, Message
from dotenv import load_dotenv
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import whisper
from moviepy import VideoFileClip
import tempfile
import io
import pytesseract
from PIL import Image
import PyPDF2
import docx

# Tesseract-OCR Tactical Configuration for Windows
def configure_tesseract():
    common_paths = [
        r'C:\Program Files\Tesseract-OCR\tesseract.exe',
        r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
        os.path.join(os.environ.get('USERPROFILE', ''), r'AppData\Local\Tesseract-OCR\tesseract.exe')
    ]
    
    for path in common_paths:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            print(f"TACTICAL: Tesseract-OCR localized at {path}")
            return True
    
    # Check if 'tesseract' is accessible in System PATH
    try:
        pytesseract.get_tesseract_version()
        print("TACTICAL: Tesseract-OCR found in System PATH")
        return True
    except pytesseract.TesseractNotFoundError:
        print("WARNING: Tesseract-OCR binary not detected. Visual/Pic scanning will be disabled.")
        return False

configure_tesseract()

# Suppress sklearn version mismatch warnings that can appear when using pickled models
# created with an older/newer sklearn than what's installed. They do not prevent the app
# from running, but they can be noisy during startup.
try:
    from sklearn.exceptions import InconsistentVersionWarning
    warnings.filterwarnings("ignore", category=InconsistentVersionWarning)
except Exception:
    # If sklearn isn't installed yet, we can ignore this.
    pass

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024 # 100MB Limit

# Email Configuration from .env
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('EMAIL_USER')
app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('EMAIL_USER')

mail = Mail(app)

# MongoDB Setup (Atlas Connection)
MONGODB_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGODB_URI)
db = client['Cyber_Bullying']
users_collection = db['Cyber']
incidents_collection = db['Incidents'] # New collection for scan history

# Load model files (use absolute paths so it works regardless of working directory)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def _load_pickle(filename):
    path = os.path.join(BASE_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Required model file not found: {path}.\n" \
            "Make sure you are running the server from the project and that the file exists."
        )

    with open(path, "rb") as f:
        return pickle.load(f)

try:
    model = _load_pickle("cyberbullying_model.pkl")
    vectorizer = _load_pickle("vectorizer.pkl")
    telugu_words = _load_pickle("telugu_words.pkl")
    try:
        predictor_model = _load_pickle("predictor_model.pkl")
    except:
        predictor_model = {}
except Exception as e:
    # Fail fast with a clear message if model assets aren't available
    print(f"FAILED TO LOAD MODEL ASSETS: {e}")
    raise

# Load Whisper model for video transcription
print("Loading Whisper model...")
whisper_model = whisper.load_model("tiny")
print("Whisper model loaded.")

@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        name = data.get("name")
        email = data.get("email")
        
        if not email:
            return jsonify({"error": "Email identifier is required."}), 400

        # Check if user exists
        existing_user = users_collection.find_one({"email": email})
        
        if not existing_user and not name:
            return jsonify({"error": "Full Name is required for first-time registration."}), 400

        otp = str(random.randint(100000, 999999))
        
        # Determine name to use
        final_name = name if name else existing_user.get("name", "User")
        
        # 1. Update MongoDB
        try:
            users_collection.update_one(
                {"email": email},
                {"$set": {"name": final_name, "otp": otp, "verified": False, "updated_at": datetime.datetime.now()}},
                upsert=True
            )
        except Exception as e:
            print(f"DATABASE ERROR: {e}")
            return jsonify({"error": "Cloud database sync failed. Please check network connectivity."}), 500
        
        # 2. Send REAL Email OTP (Modern HTML Design)
        try:
            msg = Message("🛡️ SafeSentry PRO: Security Authorization",
                          recipients=[email])
            
            # Premium HTML Email Design
            msg.html = f"""
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <div style="display: inline-block; padding: 12px 24px; background-color: #0f172a; color: #6366f1; border-radius: 12px; font-weight: 800; font-size: 14px; letter-spacing: 2px;">SAFESENTRY PRO</div>
                </div>
                
                <h2 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 16px; text-align: center;">Identity Verification Required</h2>
                
                <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    Hello <strong>{final_name}</strong>,<br><br>
                    An authorization request has been initiated for your account. Please use the high-security cryptographic code below to verify your identity and gain access to the Detection Intelligence Core.
                </p>
                
                <div style="background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 32px;">
                    <span style="display: block; font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Your Security Code</span>
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 48px; font-weight: 900; color: #6366f1; letter-spacing: 8px;">{otp}</span>
                </div>
                
                <div style="border-top: 1px solid #f1f5f9; padding-top: 24px; text-align: center;">
                    <p style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">
                        This code is part of our multi-factor authentication protocol and will expire in <strong>10 minutes</strong>.
                    </p>
                    <p style="color: #94a3b8; font-size: 12px;">
                        If you did not initiate this request, please ignore this email or contact the Security Operations Center.
                    </p>
                </div>
                
                <div style="margin-top: 40px; text-align: center; color: #cbd5e1; font-size: 10px; font-weight: 700; letter-spacing: 1px;">
                    © 2024 SAFESENTRY INTELLIGENCE NETWORKS • SECURE ENCLAVE 01
                </div>
            </div>
            """
            
            # Fallback text content
            msg.body = f"Hello {final_name}, your SafeSentry PRO verification code is: {otp}. This code expires in 10 minutes."
            
            mail.send(msg) 
            print(f"SUCCESS: Premium authorization email sent to {email}")
        except Exception as e:
            print(f"SMTP EXCEPTION: {e}")
            return jsonify({
                "message": "Direct mail delivery failed. Using secure session fallback.",
                "otp_debug": otp, # Return for UX in dev or local testing
                "error_detail": "SMTP credentials invalid or server blocked."
            }), 200 

        return jsonify({"message": "Authorization code dispatched to email.", "otp_debug": otp})
    except Exception as e:
        print(f"INTERNAL SYSTEM ERROR: {e}")
        return jsonify({"error": "The security kernel encountered an unexpected state."}), 500

@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.json
    email = data.get("email")
    
    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found"}), 404

    otp = str(random.randint(100000, 999999))
    users_collection.update_one({"email": email}, {"$set": {"otp": otp}})
    
    # Send REAL Reset OTP
    try:
        msg = Message("SafeSentry PRO Password Reset",
                      recipients=[email])
        msg.body = f"Your SafeSentry PRO password reset code is: {otp}"
        mail.send(msg)
        print(f"SUCCESS: Reset OTP sent to {email}")
    except Exception as e:
        print(f"CRITICAL ERROR sending reset email: {e}")

    return jsonify({"message": "Reset OTP sent"})

@app.route("/google-login", methods=["POST"])
def google_login():
    data = request.json
    token = data.get("token")
    if not token:
        print("GOOGLE LOGIN ERROR: Missing token in request")
        return jsonify({"success": False, "error": "Missing token"}), 400
        
    try:
        # Specify the GOOGLE_CLIENT_ID of the app that accesses the backend:
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        print(f"DEBUG: Verifying Google Token for Client ID: {client_id}")
        
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), client_id)

        # ID token is valid. Get the user's Google Account ID from the decoded token.
        email = idinfo['email']
        name = idinfo.get('name', email.split('@')[0])
        print(f"DEBUG: Google Auth Success for: {email}")

        # Check if user exists in MongoDB, if not upsert
        users_collection.update_one(
            {"email": email},
            {"$set": {"name": name, "verified": True, "updated_at": datetime.datetime.now()}},
            upsert=True
        )

        return jsonify({
            "success": True, 
            "message": "Authorized via Google",
            "user": {"email": email, "name": name}
        })
    except ValueError as val_err:
        print(f"GOOGLE TOKEN VERIFICATION FAILED (ValueError): {val_err}")
        return jsonify({"success": False, "error": f"Token verification failed: {str(val_err)}"}), 401
    except Exception as e:
        print(f"GOOGLE LOGIN CRITICAL SYSTEM ERROR: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": f"Internal security error: {str(e)}"}), 500

@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    email = data.get("email")
    otp_provided = data.get("otp")
    
    user = users_collection.find_one({"email": email})
    
    if user and user.get("otp") == otp_provided:
        users_collection.update_one({"email": email}, {"$set": {"verified": True}})
        return jsonify({
            "success": True, 
            "message": "Verified", 
            "user": {"name": user['name'], "email": email}
        })
    
    return jsonify({"success": False, "message": "Invalid OTP"}), 401

@app.route("/update-profile", methods=["POST"])
def update_profile():
    data = request.json
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email identifier missing"}), 400

    # Fields to update
    update_data = {
        "name": data.get("name"),
        "role": data.get("role"),
        "bio": data.get("bio"),
        "updated_at": datetime.datetime.now()
    }
    
    users_collection.update_one({"email": email}, {"$set": update_data})
    return jsonify({"success": True, "message": "Profile synchronized successfully"})

def normalize_elongated_words(text):
    # Tactical Normalization: Reduces 3 or more repeated characters to 1 
    # (e.g., "fuckkkkk" -> "fuck", "pukkkkka" -> "pukka")
    return re.sub(r'(.)\1{2,}', r'\1', text)

def normalize_extreme_obfuscation(text):
    # Tactical Decoding: Reveal core intent from any level of noise
    text = text.lower()
    
    # 1. Leet-speak decoding (Numerical to Alphabetical)
    text = text.replace('0', 'o').replace('1', 'i').replace('3', 'e').replace('4', 'a')\
               .replace('5', 's').replace('7', 't').replace('8', 'b').replace('$', 's').replace('@', 'a')
    
    # 2. Fragmented Initial Logic (e.g., F * * * / L * * *)
    # Handles cases where only the first letter is visible with infinite padding
    for initial, root in [('f', 'fuck'), ('p', 'puku'), ('l', 'lanja'), ('s', 'shit')]:
        # Regex: Initial followed by 3+ symbols/spaces
        if re.search(rf"\b{initial}[\s\*@#%!_\-\.]{{3,}}", text):
            text = text.replace(initial, root)

    # 3. Aggressive Noise Stripping (Removes all spaces/punctuation)
    # This aligns "f u c k" -> "fuck" and "l..a..n..j..a" -> "lanja"
    return re.sub(r"[^a-z]", "", text)

def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-zA-Z ]", " ", text)
    return " ".join(text.split())

def telugu_bullying_check(msg):
    words = msg.lower().split()
    for w in words:
        if w in telugu_words:
            return True
    return False

def transliterate_telugu(text):
    """
    Tactical Layer: Maps Romanized Telugu (Transliteration) to English semantic matches.
    Specifically targets high-threat keywords requested for safety monitoring.
    """
    mapping = {
        "champutha": "kill",
        "champuta": "kill",
        "champutharu": "kill",
        "nenu": "i",
        "ninu": "you",
        "ninnu": "you",
        "chanipo": "die",
        "pichoda": "crazy",
        "yedhava": "idiot"
    }
    words = text.lower().split()
    translated = [mapping.get(w, w) for w in words]
    return " ".join(translated)

def predict_message(msg):
    # Tactical Normalization for elongated words (Extreme Cases)
    msg = normalize_elongated_words(msg)
    
    # Default confidence
    confidence = 0.942

    # Telugu word detection (Script-based)
    if telugu_bullying_check(msg):
        return {
            "prediction": "Telugu Cyberbullying Detected (Native Script)",
            "confidence": 0.98,
            "category": "Telugu"
        }

    # Transliteration Layer (Romanized Telugu to English)
    transliterated_msg = transliterate_telugu(msg)
    if "kill" in transliterated_msg or "die" in transliterated_msg:
         return {
            "prediction": "Severe Threat Detected (Telugu Transliteration)",
            "confidence": 0.99,
            "category": "Cyberbullying"
        }

    msg_cleaned = clean_text(msg)

    # Keyword Robustness Layer (Consolidated Multi-dialect Matrix)
    hate_keywords = [
        # --- English (Standard & Slang) ---
        "idiot","stupid","moron","loser","pathetic","useless","worthless","garbage","trash","freak",
        "weirdo","psycho","jerk","scumbag","clown","coward","failure","fake","liar","cheater",
        "fraud","brainless","dimwit","dork","imbecile","ignorant","annoying","creep","disgusting",
        "lame","ridiculous","hopeless","nonsense","lazy","arrogant","selfish","attention seeker",
        "drama queen","crybaby","loser kid","pathetic person","useless human","worthless person",
        "garbage person","trash human","dumb","dumb person","dumb idiot","dumb loser","fool",
        "foolish","foolish person","stupid fool","stupid person","stupid kid","stupid guy",
        "stupid human","dumb fellow","useless fellow","waste fellow","waste person","waste human",
        "good for nothing","good for nothing person","good for nothing idiot",
        "fuck","fucker","fucking","fucking idiot","shit","bullshit","asshole","bitch","bastard",
        "motherfucker","son of a bitch","damn you","dumbass","jackass","douchebag","dipshit",
        "piece of shit","shithead","screw you","screw off","kiss my ass","bloody idiot",
        "bloody fool","damn fool","damn idiot","ass clown","jerk face","shit face","dirty bastard",
        "stupid bastard","ugly bastard","useless bastard","damn loser","bloody loser","stupid jerk",
        "shut up","shut your mouth","stop talking","stop crying","go away","get lost","stay away",
        "nobody likes you","no one cares about you","you are nothing","you are a joke",
        "you are pathetic","you are useless","you are garbage","you are trash","you are stupid",
        "you are embarrassing","you are annoying","you are disgusting","you are worthless",
        "you are hopeless","you are brainless","you are dumb","you are a loser","you are a clown",
        "you are a failure","you are fake","you are a liar","you are a cheat","you are useless worker",
        "go die","drop dead","kill yourself","you deserve to die","i will kill you","i will hurt you",
        "i will destroy you","i will ruin you","i will beat you","watch what happens",
        "you will regret this","i will expose you","i will report you","i will break you",
        "i will make you pay","i will find you","i will ruin your life","i will end you",
        "you better watch out","i will destroy your career","i will finish you",
        "fat","ugly","pig","cow","donkey","dog","monkey","buffalo","dirty","smelly","gross",
        "fat pig","fat cow","fat idiot","ugly freak","ugly face","ugly idiot","dirty pig",
        "smelly idiot","disgusting face","creepy face","fat loser","ugly loser","fat clown",
        "ugly clown","dirty creature","gross person","disgusting person","fat freak",
        "your work is trash","this is garbage work","useless employee","lazy worker",
        "incompetent worker","worst employee","wasting my time","do you even know anything",
        "pathetic work","this is embarrassing work","this report is garbage","your code is trash",
        "this is the worst work","you are incompetent","useless worker","useless coder",
        "worst programmer","bad worker","terrible employee","hopeless worker",
        "noob","tryhard","clown player","npc","internet troll","keyboard warrior","wannabe",
        "fake influencer","attention freak","cringe","cringe kid","stupid gamer","trash player",
        "bot player","loser gamer","noob gamer","useless gamer","pathetic gamer","clown gamer",
        "garbage player","trash gamer","fake gamer","kid gamer",
        "bloody stupid","very stupid","very useless","very pathetic","extremely stupid",
        "extremely useless","extremely pathetic","bloody moron","damn moron","stupid moron",
        "useless moron","pathetic moron","garbage moron","trash moron","hopeless idiot",
        "pathetic idiot","useless idiot","stupid idiot","garbage idiot","trash idiot",
        "bloody idiot","damn idiot","hopeless loser","pathetic loser","useless loser",
        "garbage loser","trash loser","bloody loser","damn loser",
        "annoying idiot","annoying loser","annoying person","disgusting idiot","disgusting loser",
        "creepy idiot","creepy loser","ridiculous idiot","ridiculous person","nonsense person",
        "lazy idiot","lazy loser","arrogant idiot","arrogant loser","selfish idiot","selfish loser",
        "shame on you","what a joke","you are embarrassing yourself","you are pathetic human",
        "you are worthless human","you are useless human","you are disgusting human",
        "you are trash human","you are garbage human","you are stupid human","you are a failure human","gay",

        # --- Telugu (Abuse & Slang) ---
        "overaction dengaku", "athi dengaku", "extralu dengaku", "athiga matladaku",
        "erri hukka", "hukka", "lawada", "nuv entira", "nuv em peekav", "nee level enti", "nee range enti",
        "ekkuva chestunnav", "athiga behave chestunnav", "drama aadaku",
        "show off cheyyaku", "nuv waste", "nuv useless", "nee life waste",
        "gudha balupu", "gudha balsinda", "nee buddhi ledu", "nee brain ledu",
        "mental fellow", "mental case", "pichi fellow", "pichi naayala",
        "erpk", "erpka", "erpkmunda", "erripuka", "erri puka",
        "ni gudha ni denga", "dengutha", "dengithe addam tiruguthav",
        "vangabetti dengutha", "langa lepi dengu",
        "ni gudha ni veyyi saarlu dengutha",
        "vaadi gudha naaku", "vaadi puku naaku",
        "vaadi sulli nootlo petukoni cheeku",
        "modda cheeku", "sulli cheesko", "vaadi madda kudu",
        "ni puku lo gola", "ni amma puku", "nee pellam puku",
        "nee amma", "nee amma lanja", "nee amma munda",
        "nee akka lanja", "nee akka munda",
        "nee pellam lanja", "nee pellam munda",
        "nee amma ni denga", "nee akka ni denga",
        "kojja gaanivi", "kojja naayala", "kojja fellow",
        "puka", "puku na kodaka", "lanja dhaana", "lanja", "lanjja",
        "puku", "pukku", "pukkulo", "pukulo",
        "langa munda", "lanjodaka", "lanja kodaka", "lanjja kodaka",
        "sasthav", "champestha", "ninnu champestha",
        "ninnu dengesstha", "nee life finish",
        "ninnu vadilanu", "nee pani aipothundi",
        "nee pichi matalu", "nee comedy enti",
        "nuv joker", "clown fellow",
        "nee face chudale", "nee moham chudale",
        "nee moham chusi navvostundi",
        "nee moham ugly", "nee face waste",
        "gorre face", "kukka moham",
        "pandi moham", "kothi face", "pichoda", "yedhava",
        # --- General Telugu Scenarios (Conversational Abuse) ---
        "nee build up aapu", "build up dengaku", "pedda thopu anukuntunnava",
        "nuvvu oka waste", "nee bathuku waste", "nee janma waste",
        "nee range enti", "nee level enti", "naa sulli kudu", "burra leda",
        "intelligence leda", "siggu undali", "siggu leni janma",
        "panikirani vadu", "chetha moham", "dhurtha", "nee moham manda",
        "chanipo ra", "poyi chavura", "kanapadani poyi", "thupuk",
        "nuvvu oka failure", "nee valla em kadu", "nee moham chusi navvostundi",
        "lanja", "lanjja", "kodaka", "lanja kodaka", "lanjodaka",
        "na kodaka", "naa sulli", "nee amma", "nee akka", "nee pellam",
        "mogada", "pellama", "kojja", "hijra", "siggu ledu", "buddhi ledu",

        # --- Hindi (Abuse & Slang) ---
        "bewakoof","nalayak","pagal","gadha","ullu","nikamma","bekar","faltu","ghatiya","badtameez",
        "bewakoof aadmi","nalayak aadmi","pagal insaan","gadha aadmi","ullu ka pattha","nikamma aadmi",
        "bekar aadmi","faltu aadmi","ghatiya aadmi","ghatiya insaan","bekar insaan","faltu insaan",
        "nikamma insaan","bewakoof insaan","pagal aadmi","badtameez aadmi","badtameez insaan",
        "kameena","harami","saala","kutte","kutte ka baccha","kamina aadmi","harami insaan",
        "saale bewakoof","kutte jaise aadmi","kamina insaan","ghatiya aadmi","gandi soch",
        "ganda aadmi","gandi aukaat","badtameez kutta","harami aadmi","kamina kutta",
        "ghatiya kutta","harami banda","kamina banda",
        "tum bewakoof ho","tum nalayak ho","tum pagal ho","tum gadhe ho","tum nikamme ho",
        "tum bekaar ho","tum faltu ho","tum ghatiya ho","tum useless ho","tum kuch nahi ho",
        "tum ek joke ho","tum bekaar aadmi ho","tum bekaar insaan ho","tum faltu aadmi ho",
        "tum nalayak insaan ho","tum bewakoof insaan ho","tum sabse kharab ho","tum bilkul bekaar ho",
        "tumhara dimaag kharab hai","tumhara dimaag bekaar hai","tumhara dimaag ghatiya hai",
        "tumhara soch bakwaas hai","tumhari soch ghatiya hai","tumhari soch bekaar hai",
        "tumse kuch nahi hoga","mar ja","mar jao","tum mar jao","jaake mar ja","jaake mar jao",
        "tum marne layak ho","main tumhe maar dunga","main tumhe barbaad kar dunga","main tumhe dekh lunga",
        "tum pachtaoge","tumhari zindagi kharab kar dunga","main tumhe expose kar dunga",
        "main tumhe sabke saamne beizzat karunga","tumhe sabke saamne gira dunga",
        "mota","patla","badsurat","ganda","badbu wala","gandi shakal","badsurat chehra",
        "ganda aadmi","mota aadmi","patla aadmi","badsurat aadmi","ghatiya shakal",
        "bekar chehra","ganda chehra","badbu wala aadmi","gandi soorat","bekar soorat",
        "tumhara kaam bakwaas hai","yeh kaam kachra hai","tum bekaar employee ho",
        "tum kuch nahi kar sakte","tum bilkul useless ho","tumhara report bakwaas hai",
        "tumhari coding bakwaas hai","tumhara kaam ghatiya hai","tum sabse bekaar employee ho",
        "tum worst employee ho","tumhara project kachra hai","tumhara kaam bakwaas hai",
        "noob banda","faltu banda","bekar banda","ghatiya banda","stupid banda",
        "pagal banda","useless banda","bekar gamer","noob gamer","faltu player",
        "ghatiya player","stupid player","useless gamer","bekar player","noob player",
        "bahut bewakoof","bahut nalayak","bahut ghatiya","bahut bakwaas","bahut bekaar",
        "bilkul bekaar","bilkul useless","bilkul ghatiya","bahut stupid","bahut bekaar aadmi",
        "bahut ghatiya insaan","bahut bakwaas kaam","bahut ghatiya kaam","bahut bekaar kaam",
        "bewakoof insaan","nalayak insaan","pagal insaan","nikamma insaan","faltu insaan",
        "ghatiya insaan","bekar insaan","badtameez insaan","harami insaan","kamina insaan",
        "tum bewakoof insaan ho","tum nalayak insaan ho","tum ghatiya insaan ho",
        "tum nikamme insaan ho","tum faltu insaan ho","tum bekaar insaan ho",
        "tum gande insaan ho","tum bakwaas insaan ho","tum useless insaan ho",
        "bahut ghatiya aadmi","bahut bekaar aadmi","bahut nalayak aadmi","bahut bewakoof aadmi",
        "bahut ganda aadmi","bahut nikamma aadmi","bahut faltu aadmi","bahut ghatiya banda",
        "bekar aadmi","bekar banda","bekar insaan","bekar kaam","bekar soch",
        "faltu aadmi","faltu banda","faltu insaan","faltu kaam","faltu soch",
        "tum sabse ghatiya ho","tum sabse bekaar ho","tum sabse nalayak ho",
        "tum sabse bewakoof ho","tum sabse nikamme ho","tum sabse faltu ho",
        "ghatiya kaam","bekar kaam","bakwaas kaam","faltu kaam","useless kaam",
        "nikamma kaam","bewakoof kaam","nalayak kaam","ganda kaam","kachra kaam",
        "tum ek failure ho","tum ek joke ho","tum ek bekaar aadmi ho",
        "tum ek ghatiya aadmi ho","tum ek nalayak aadmi ho","tum ek bewakoof aadmi ho",
        "tumhari aukaat kya hai","tumhari aukaat nahi hai","tumhari koi value nahi hai",
        "tumhari koi izzat nahi hai","tumhari koi respect nahi hai",
        # --- Expanded Foul Language Matrix ---
        "slut", "whore", "pimp", "hoe", "cunt", "dick", "pussy", "vagina", "penis", "ass", "tits",
        "jackoff", "wanker", "prick", "motherfucker", "fucker", "fucking", "shit", "bollocks",
        "bastard", "crap", "damn", "hell", "suck my", "lick my", "blowjob", "handjob",
        "porn", "sexual", "harassment", "molest", "rape", "violate", "abuse"
    ]
    # Advanced de-obfuscation for phrases like "f***", "sh*t", etc.
    msg_deobfuscated = msg.lower()
    # --- UNIFIED DETECTION ARCHITECTURE ---
    # Layer 1: Phonetic Normalization (e.g. f*ck)
    msg_deobfuscated = re.sub(r"f[*x@#%!]+ck?|f[*x@#%!]+", "fuck", msg.lower())
    msg_deobfuscated = re.sub(r"sh[i*x@#%!]+t", "shit", msg_deobfuscated)
    msg_deobfuscated = re.sub(r"b[i*x@#%!]+tch", "bitch", msg_deobfuscated)
    msg_deobfuscated = re.sub(r"p[u*x@#%!]+ssy", "pussy", msg_deobfuscated)
    msg_deobfuscated = re.sub(r"p[u*x@#%!]+[k]+u", "puku", msg_deobfuscated)
    
    # Layer 2: Deep Aligned Fragmentation Analysis
    msg_aligned = normalize_extreme_obfuscation(msg)
    
    msg_original_lower = msg.lower()

    for kw in hate_keywords:
        # Check original, phonetic-regex, AND deep-aligned versions
        kw_aligned = normalize_extreme_obfuscation(kw)
        
        # Logic: If keyword exists in original OR deobfuscated OR aligned
        if kw in msg_original_lower or kw in msg_deobfuscated or (len(kw_aligned) > 2 and kw_aligned in msg_aligned):
            # --- EXTREME LEVEL THREAT DETECTION ---
            extreme_keywords = [
                "kill", "murder", "rape", "suicide", "terrorist", "nazi", 
                "chanipestha", "champestha", "rape", "molest", "violate",
                "lanja kodaka", "erri puka", "erri puku", "puku na kodaka",
                "motherfucker", "fucker", "bastard"
            ]
            
            if any(extreme in kw.lower() for extreme in extreme_keywords):
                return {
                    "prediction": "CRITICAL THREAT DETECTED (Extreme)",
                    "confidence": 1.0,
                    "category": "High-Risk Threat",
                    "extreme": True
                }

            # Special classification for high-priority hate-speech
            if kw in ["racist", "white power", "nazi", "terrorist", "monkey"]:
                return {
                    "prediction": "Hate Speech / Racism Detected",
                    "confidence": 0.99,
                    "category": "Hate Speech"
                }
            return {
                "prediction": "Cyberbullying Detected",
                "confidence": 0.95,
                "category": "Cyberbullying"
            }

    vec = vectorizer.transform([msg_cleaned])
    
    try:
        # Try to get probability if available
        probs = model.predict_proba(vec)[0]
        max_prob = max(probs)
        confidence = float(max_prob)
        pred = model.predict(vec)[0]
    except:
        pred = model.predict(vec)[0]
        confidence = 0.942

    safe_labels = ['0', '0.0', 'not_cyberbullying']

    if str(pred) in safe_labels:
        return {
            "prediction": "Safe Message",
            "confidence": confidence,
            "category": "Safe"
        }
    else:
        return {
            "prediction": "Cyberbullying Detected",
            "confidence": confidence,
            "category": "Cyberbullying"
        }

@app.route("/predict-video", methods=["POST"])
def predict_video():
    if 'video' not in request.files:
        return jsonify({"error": "No video file provided"}), 400
    
    video_file = request.files['video']
    email = request.form.get("email", "Anonymous")

    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video:
        video_file.save(temp_video.name)
        temp_video_path = temp_video.name

    try:
        # Extract audio and transcribe
        video = VideoFileClip(temp_video_path)
        audio_path = temp_video_path.replace('.mp4', '.wav')
        
        if video.audio is None:
             return jsonify({"error": "No audio track found in video"}), 400
             
        video.audio.write_audiofile(audio_path, logger=None)
        
        # Transcribe and Translate to English automatically using Whisper's translation engine
        # fp16=False is set to prevent numerical instability (NaN logits) on many systems
        result = whisper_model.transcribe(audio_path, verbose=False, task="translate", fp16=False)
        
        timeline_data = []
        overall_bullying = False
        
        for segment in result['segments']:
            text = segment['text'].strip()
            if not text:
                continue
                
            prediction_result = predict_message(text)
            
            segment_info = {
                "start": segment['start'],
                "end": segment['end'],
                "text": text,
                "prediction": prediction_result['prediction'],
                "confidence": prediction_result['confidence'],
                "category": prediction_result['category']
            }
            timeline_data.append(segment_info)
            
            if "Detected" in prediction_result['prediction']:
                overall_bullying = True

        # Log incident if bullying detected
        if overall_bullying:
            # Safely calculate confidence for the incident log
            try:
                conf_values = [float(s['confidence']) for s in timeline_data if "Detected" in str(s['prediction'])]
                max_conf = max(conf_values) if conf_values else 0.94
            except:
                max_conf = 0.94

            incident_data = {
                "timestamp": datetime.datetime.now(),
                "email": email,
                "content": f"Video Analysis: {len(timeline_data)} segments processed.",
                "classification": "Cyberbullying Detected (Video)",
                "confidence": f"{max_conf * 100:.1f}%"
            }
            incidents_collection.insert_one(incident_data)

        return jsonify({
            "success": True,
            "overall_prediction": "Cyberbullying Detected" if overall_bullying else "Safe Content",
            "timeline": timeline_data
        })

    except Exception as e:
        print(f"VIDEO PROCESSING ERROR: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        # Guaranteed cleanup
        try:
            if 'video' in locals():
                video.close()
            if os.path.exists(temp_video_path):
                os.remove(temp_video_path)
            if 'audio_path' in locals() and os.path.exists(audio_path):
                os.remove(audio_path)
        except Exception as cleanup_error:
            print(f"Cleanup Error: {cleanup_error}")

@app.route("/predict-audio-chunk", methods=["POST"])
def predict_audio_chunk():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio data provided"}), 400
    
    audio_file = request.files['audio']
    email = request.form.get("email", "Anonymous")

    try:
        # Save chunk to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_audio:
            audio_file.save(temp_audio.name)
            temp_path = temp_audio.name

        # Convert to wav for Whisper
        audio = AudioSegment.from_file(temp_path)
        wav_path = temp_path.replace('.webm', '.wav')
        audio.export(wav_path, format="wav")

        # Transcribe
        # fp16=False is set to prevent numerical instability (NaN logits) 
        result = whisper_model.transcribe(wav_path, verbose=False, fp16=False)
        text = result['text'].strip()

        if not text:
            return jsonify({
                "success": True, 
                "prediction": "Safe Message", 
                "text": "", 
                "confidence": 0.99,
                "category": "Safe"
            })

        # Analyze text
        prediction_result = predict_message(text)

        # Log if bullying detected
        if "Detected" in prediction_result['prediction']:
            incident_data = {
                "timestamp": datetime.datetime.now(),
                "email": email,
                "content": f"Live Audio Detection: {text[:100]}",
                "classification": prediction_result['prediction'],
                "confidence": f"{prediction_result['confidence'] * 100:.1f}%"
            }
            incidents_collection.insert_one(incident_data)

        return jsonify({
            "success": True,
            "text": text,
            "prediction": prediction_result['prediction'],
            "confidence": prediction_result['confidence'],
            "category": prediction_result['category']
        })

    except Exception as e:
        print(f"AUDIO CHUNK ERROR: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up
        try:
            if 'temp_path' in locals() and os.path.exists(temp_path):
                os.remove(temp_path)
            if 'wav_path' in locals() and os.path.exists(wav_path):
                os.remove(wav_path)
        except:
            pass

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True) or {}
    message = data.get("message")
    if not message:
        return jsonify({"error": "Message is required"}), 400

    email = data.get("email", "Anonymous")

    result = predict_message(message)

    # Store incident in MongoDB for real-time dashboard logs
    incident_data = {
        "timestamp": datetime.datetime.now(),
        "email": email,
        "content": message[:100],
        "classification": result['prediction'],
        "confidence": f"{result['confidence'] * 100:.1f}%"
    }
    try:
        incidents_collection.insert_one(incident_data)
    except Exception as e:
        print(f"INCIDENT LOGGING ERROR: {e}")

    return jsonify({"prediction": result['prediction'], "confidence": result['confidence'], "category": result['category']})

@app.route("/analyze-image", methods=["POST"])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image data provided"}), 400
    
    image_file = request.files['image']
    email = request.form.get("email", "Anonymous")

    try:
        # Save to memory and open with PIL (Safe ByteStream Handling)
        img = Image.open(io.BytesIO(image_file.read()))
        
        # Convert to RGB to ensure compatibility with OCR engine (especially for GIFs/indexed images)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Tactical Re-check for Tesseract PATH inside route (Real-time activation)
        if not pytesseract.pytesseract.tesseract_cmd or not os.path.exists(pytesseract.pytesseract.tesseract_cmd):
            configure_tesseract()

        # Extract text using pytesseract
        try:
            extracted_text = pytesseract.image_to_string(img).strip()
        except Exception as ocr_err:
            print(f"OCR ENGINE ERROR: {ocr_err}")
            # Final fallback: Hardcoded path to default Windows install
            default_win_path = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
            if os.path.exists(default_win_path):
                 pytesseract.pytesseract.tesseract_cmd = default_win_path
                 extracted_text = pytesseract.image_to_string(img).strip()
            else:
                 return jsonify({
                    "error": "OCR Engine (Tesseract) not found or failed. Please ensure Tesseract-OCR is installed on the server.",
                    "details": str(ocr_err)
                 }), 500

        if not extracted_text:
            return jsonify({
                "success": True,
                "text": "[NO TEXT DETECTED]",
                "overall_prediction": "Safe Content (No Text)",
                "details": "The image lens did not detect any legible text strings."
            })

        # Process text lines for granular analysis
        lines = [line.strip() for line in extracted_text.split('\n') if line.strip()]
        line_results = []
        overall_bullying = False

        for line in lines:
            res = predict_message(line)
            is_threat = "Detected" in res["prediction"]
            if is_threat: overall_bullying = True
            line_results.append({
                "text": line,
                "prediction": res["prediction"],
                "confidence": res["confidence"],
                "category": res.get("category", "General"),
                "is_threat": is_threat
            })

        # Record incident if bullying detected
        if overall_bullying:
            # Safely calculate confidence
            try:
                conf_values = [float(r['confidence']) for r in line_results if r['is_threat']]
                max_conf = max(conf_values) if conf_values else 0.94
            except:
                max_conf = 0.94

            incident_data = {
                "timestamp": datetime.datetime.now(),
                "email": email,
                "classification": "Visual Text Bullying Detected",
                "content": f"Image Scan: {extracted_text[:100]}...",
                "confidence": f"{max_conf * 100:.1f}%"
            }
            incidents_collection.insert_one(incident_data)

        return jsonify({
            "success": True,
            "text": extracted_text,
            "overall_prediction": "Cyberbullying Detected" if overall_bullying else "Safe Content",
            "findings": line_results
        })

    except Exception as e:
        print(f"IMAGE ANALYSIS ERROR: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/get-incidents", methods=["GET"])
def get_incidents():
    # Fetch last 10 incidents for the dashboard
    incidents = list(incidents_collection.find().sort("timestamp", -1).limit(10))
    for inc in incidents:
        inc["_id"] = str(inc["_id"])
        ts = inc.get("timestamp")
        if isinstance(ts, datetime.datetime):
            inc["timestamp"] = ts.strftime("%I:%M:%S %p")
        else:
            inc["timestamp"] = str(ts)
    return jsonify(incidents)

@app.route("/get-analytics", methods=["GET"])
def get_analytics():
    try:
        # 1. Total Stats
        total_incidents = incidents_collection.count_documents({})
        unique_emails = len(incidents_collection.distinct("email"))
        
        # 2. Category Distribution
        pipeline = [
            {"$group": {"_id": "$classification", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]
        category_stats = list(incidents_collection.aggregate(pipeline))
        categories = [{"label": s["_id"], "value": s["count"]} for s in category_stats]

        # 3. Volatility (Last 7 Days)
        volatility = []
        now = datetime.datetime.now()
        for i in range(6, -1, -1):
            day = now - datetime.timedelta(days=i)
            start_of_day = datetime.datetime(day.year, day.month, day.day)
            end_of_day = start_of_day + datetime.timedelta(days=1)
            
            count = incidents_collection.count_documents({
                "timestamp": {"$gte": start_of_day, "$lt": end_of_day}
            })
            volatility.append({
                "time": day.strftime("%b %d"),
                "value": count
            })

        # 4. Taxonomy (Detailed Radar Data)
        taxonomy_subjects = ["Toxicity", "Hate Speech", "Obscene", "Threat", "Insult", "Identity Hate"]
        taxonomy = []
        for subject in taxonomy_subjects:
            count = incidents_collection.count_documents({"classification": {"$regex": subject, "$options": "i"}})
            taxonomy.append({"subject": subject, "A": count, "fullMark": max(10, count * 1.5)})

        # 5. Recent Incidents (Integrated Feed)
        recent_incidents = list(incidents_collection.find().sort("timestamp", -1).limit(5))
        for inc in recent_incidents:
            inc["_id"] = str(inc["_id"])
            ts = inc.get("timestamp")
            if isinstance(ts, datetime.datetime):
                inc["timestamp"] = ts.strftime("%I:%M %p")
            else:
                inc["timestamp"] = str(ts)

        return jsonify({
            "success": True,
            "total_incidents": total_incidents,
            "unique_targets": unique_emails,
            "risk_level": "CRITICAL" if total_incidents > 100 else "HIGH" if total_incidents > 50 else "LOW",
            "volatility": volatility,
            "categories": categories,
            "taxonomy": taxonomy,
            "recent_incidents": recent_incidents
        })
    except Exception as e:
        print(f"ANALYTICS ERROR: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/analyze-document", methods=["POST"])
def analyze_document():
    if 'document' not in request.files:
        return jsonify({"error": "No document provided"}), 400
    
    doc_file = request.files['document']
    email = request.form.get("email", "Anonymous")
    filename = doc_file.filename.lower()
    
    extracted_text = ""
    
    try:
        if filename.endswith(".pdf"):
            reader = PyPDF2.PdfReader(doc_file)
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + " "
        elif filename.endswith(".docx"):
            doc = docx.Document(doc_file)
            for para in doc.paragraphs:
                extracted_text += para.text + " "
        elif filename.endswith(".txt"):
            extracted_text = doc_file.read().decode("utf-8")
        else:
            return jsonify({"error": "Unsupported document format. Use PDF, DOCX, or TXT."}), 400

        extracted_text = extracted_text.strip()
        
        if not extracted_text:
            return jsonify({
                "overall_prediction": "Safe (No Text Detected)",
                "text": "[EMPTY DOCUMENT]",
                "findings": []
            })

        # Process text lines for granular analysis
        # Cleanup text for analysis
        lines = [line.strip() for line in re.split(r'\.|\n', extracted_text) if len(line.strip()) > 5]
        line_results = []
        overall_bullying = False

        for line in lines[:100]: # Capacity: First 100 semantic units
            res = predict_message(line)
            
            # TACTICAL REFINEMENT: 
            # 1. Document Intel now prioritizes "Particular Keywords" (Explicit hate matches)
            # 2. Or accepts AI prediction ONLY if confidence is > 0.98 (Extreme cases)
            has_explicit_keyword = any(kw in line.lower() for kw in ["fuck", "shit", "bitch", "lanja", "puku", "pukku", "lawada", "hukka", "murder", "rape", "kill"])
            is_high_confidence = res["confidence"] > 0.98
            
            is_threat = ("Detected" in res["prediction"]) and (has_explicit_keyword or is_high_confidence)
            
            if is_threat: overall_bullying = True
            line_results.append({
                "text": line[:150] + ("..." if len(line) > 150 else ""),
                "prediction": res["prediction"] if (has_explicit_keyword or is_high_confidence) else "Safe Message (Heuristic Filter)",
                "confidence": res["confidence"],
                "category": res.get("category", "General"),
                "is_threat": is_threat
            })

        # Record incident if bullying detected
        if overall_bullying:
            try:
                conf_values = [float(r['confidence']) for r in line_results if r['is_threat']]
                max_conf = max(conf_values) if conf_values else 0.94
            except:
                max_conf = 0.94

            incident_data = {
                "timestamp": datetime.datetime.now(),
                "email": email,
                "classification": "Bullying/Toxic Content Detected (Document)",
                "confidence": f"{max_conf * 100:.1f}%",
                "content": f"Document Intel: {filename}"
            }
            incidents_collection.insert_one(incident_data)

        return jsonify({
            "overall_prediction": "Bullying Detected" if overall_bullying else "Safe Content",
            "text": extracted_text[:1500] + ("..." if len(extracted_text) > 1500 else ""),
            "findings": [f for f in line_results if f['is_threat']][:15] # Return top 15 threats
        })

    except Exception as e:
        print(f"DOCUMENT ANALYSIS ERROR: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/get-predictions", methods=["POST"])
def get_predictions():
    try:
        data = request.json
        word = data.get("word", "").lower()
        if not word:
            return jsonify({"suggestions": []})
        
        # Exact bigram match from trained model
        suggestions = predictor_model.get(word, [])
        
        # Also include heuristic prefix matching from keywords if model has nothing
        if not suggestions:
            # We can expose a few high-risk completions
            all_keywords = ["idiot", "stupid", "useless", "pathetic", "lanja", "kodaka", "champesa"]
            suggestions = [kw for kw in all_keywords if kw.startswith(word) and kw != word][:3]
            
        return jsonify({"success": True, "suggestions": suggestions})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)