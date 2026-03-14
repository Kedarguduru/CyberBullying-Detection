import os
import pickle
import re
from pymongo import MongoClient
from dotenv import load_dotenv

# Tactical Prediction Trainer
# Builds a Bigram transition matrix for real-time behavioral text suggestions.

load_dotenv()

def train():
    print("🚀 INITIALIZING PREDICTION ANALYSIS TRAINING...")
    
    # 1. Source Data from app.py (Static Keywords)
    # We'll re-list the critical transitions here for the trainer
    corpus = []
    
    # Extracting from the app.py matrix
    static_phrases = [
        "you are a", "you are stupid", "you are useless", "you are pathetic",
        "i will kill", "i will destroy", "i will ruin", "i will find",
        "nee amma", "nee akka", "nee face", "nee life", "nee level",
        "nuv waste", "nuv useless", "nuv entira", "nuv em peekav",
        "go die", "drop dead", "kill yourself", "deserve to die",
        "this is garbage", "this is trash", "useless employee", "lazy worker",
        "mota aadmi", "pagal insaan", "gadha aadmi", "bewakoof insaan",
        "lanja kodaka", "lanjodaka", "lanjja kodaka", "nee amma lanja"
    ]
    corpus.extend(static_phrases)

    # 2. Source Data from MongoDB (Dynamic Telemetry)
    try:
        MONGODB_URI = os.getenv('MONGODB_URI')
        client = MongoClient(MONGODB_URI)
        db = client['Cyber_Bullying']
        incidents = db['Incidents'].find({}, {"content": 1})
        for inc in incidents:
            if "content" in inc and inc["content"]:
                corpus.append(inc["content"].lower())
        print(f"📊 Extracted {len(corpus)} behavioral samples from registry.")
    except Exception as e:
        print(f"⚠️ Registry connection failed: {e}. Training on static matrix only.")

    # 3. Build Transition Matrix
    transitions = {}
    
    for text in corpus:
        # Basic cleaning
        text = re.sub(r'[^a-zA-Z\s]', '', text.lower())
        words = text.split()
        
        for i in range(len(words) - 1):
            current = words[i]
            next_word = words[i+1]
            
            if current not in transitions:
                transitions[current] = {}
            
            transitions[current][next_word] = transitions[current].get(next_word, 0) + 1

    # 4. Finalize Model (Pick top 5 for each word)
    refined_model = {}
    for word, followers in transitions.items():
        # Sort by frequency and take top 5
        sorted_followers = sorted(followers.items(), key=lambda x: x[1], reverse=True)
        refined_model[word] = [pair[0] for pair in sorted_followers[:5]]

    # 5. Save Artifact
    with open("predictor_model.pkl", "wb") as f:
        pickle.dump(refined_model, f)
    
    print("✅ PREDICTION ANALYSIS TRAINING COMPLETE.")
    print(f"💾 Model saved to: predictor_model.pkl (Size: {len(refined_model)} tokens)")

if __name__ == "__main__":
    train()
