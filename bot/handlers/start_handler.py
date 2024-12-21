from telegram import Update
from telegram.ext import CommandHandler, CallbackContext
from services.firebase_service import firestore

def start(update: Update, context: CallbackContext):
    user = update.effective_user
    user_id = user.id
    username = user.username

    user_ref = firestore.collection('users').document(str(user_id))
    doc = user_ref.get()

    if not doc.exists:
        user_ref.set({
            'username': username,
            'role': 'listener',
            'preferences': {
                'notification_times': [24, 5, 1, 0.5, 0.0833],
                'subscribed_podcasts': []
            }
        })
        update.message.reply_text(f"Welcome, {username}! You are now subscribed to Podmates. You will receive notifications for upcoming podcasts.")
    else:
        update.message.reply_text(f"Welcome back, {username}! Ready to get started with the latest tech podcasts?")
