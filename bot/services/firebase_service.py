import firebase_admin
from firebase_admin import credentials, firestore, db
import config

hard_disk = None
ram = None

def initialize_firebase():
    global hard_disk, ram 
    
    if not firebase_admin._apps:
        cred = credentials.Certificate(config.FIREBASE_CREDENTIALS_PATH) 
        firebase_admin.initialize_app(cred, {
            'databaseURL': config.DATABASE_URL,  
        })
        hard_disk = firestore.client() 
        ram = db.reference()
    
    return hard_disk, ram
