import firebase_admin
from firebase_admin import credentials, firestore, db

firestore = None
realtime = None

def initialize_firebase():
    global firestore, realtime  
    
    if not firebase_admin._apps:
        cred = credentials.Certificate('firebase.json') 
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://podmates-485af-default-rtdb.firebaseio.com/',  
        })
        firestore = firestore.client() 
        realtime = db.reference()    
