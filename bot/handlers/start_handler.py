from telegram import Update
from telegram.ext import CallbackContext

async def start(update: Update, context: CallbackContext):
    hard_disk = context.bot_data['hard_disk']

    user = update.effective_user
    user_id = user.id
    username = user.username
    first_name = user.first_name
    last_name = user.last_name

    user_ref = hard_disk.collection('users').document(str(user_id))
    doc = user_ref.get()

    image_url = 'https://i.ibb.co/MGVz6t1/1-1.jpg' 

    if not doc.exists:
        user_ref.set({
            'first_name': first_name,
            'last_name': last_name,
            'username': username,
            'role': 'listener',
            'preferences': {
                'notification_times': [24, 5, 1, 0.5, 0.0833],
                'subscribed_podcasts': []
            }
        })
        
        welcome_message = (
            f"**Welcome, {username}\!**\n\n"
            "*You are now subscribed to Podmates\.*\n\n"
            "You will receive notifications for upcoming podcasts\. Stay tuned\!\n\n"
            "_Here are some quick tips to get started:_\n"
            "* Use `/schedule` to set your podcast schedule\n"
            "* Use `/rating` to give feedback after listening\n\n"
            "Feel free to reach out anytime\! 😊"
        )
        
        await update.message.reply_photo(
            photo=image_url,
            caption=welcome_message,
            parse_mode='MarkdownV2'
        )
        
    else:
        welcome_back_message = (
            f"**Welcome back, {username}\!**\n\n"
            "Ready to get started with the latest tech podcasts\? 🎧\n\n"
            "We have some amazing content lined up for you\! 📚\n\n"
            "_Here’s a quick rundown of the features:_\n"
            "* /schedule \- Set your podcast schedule\n"
            "* /rating \- Rate your favorite podcasts\n\n"
            "Let's get started\! 🚀"
        )
        
        await update.message.reply_photo(
            photo=image_url,
            caption=welcome_back_message,
            parse_mode='MarkdownV2'
        )