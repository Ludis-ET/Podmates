import firebase_admin
from firebase_admin import credentials, firestore, db

hard_disk = None
ram = None

def initialize_firebase():
    global hard_disk, ram 
    
    if not firebase_admin._apps:
        cred = credentials.Certificate('firebase.json') 
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://podmates-485af-default-rtdb.firebaseio.com/',  
        })
        hard_disk = firestore.client() 
        ram = db.reference()
    
    return hard_disk, ram
