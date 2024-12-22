import os
from dotenv import load_dotenv

load_dotenv()

FIREBASE_CREDENTIALS_PATH = os.getenv('FIREBASE_CREDENTIALS_PATH')
DATABASE_URL = os.getenv('DATABASE_URL')  

BOT_TOKEN = os.getenv('BOT_TOKEN')  

OFFICIAL_WEBSITE = 'https://google.com/'
