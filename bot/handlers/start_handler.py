from telegram import InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup
from telegram.ext import CommandHandler, CallbackQueryHandler

TECH_CATEGORIES = [
    "Programming Languages",
    "Web Development",
    "Mobile Development",
    "Machine Learning & AI",
    "Data Science & Analytics",
    "Cloud Computing",
    "Cybersecurity",
    "Blockchain & Cryptocurrencies",
    "Software Engineering & Architecture",
    "DevOps & Automation",
    "Game Development"
]

async def start(update, context):
    hard_disk = context.bot_data['hard_disk']

    user = update.effective_user
    user_id = user.id
    username = user.username or "New User"
    first_name = user.first_name or "Friend"
    last_name = user.last_name

    user_ref = hard_disk.collection('users').document(str(user_id))
    doc = user_ref.get()

    image_url = 'https://i.ibb.co/MGVz6t1/1-1.jpg'

    keyboard_buttons = [
        ['🎧 Browse Podcasts', '⭐ My Ratings'],
        ['📚 Create a Podcast', '📜 My Subscriptions'],
        ['🛠️ Settings']
    ]
    keyboard_markup = ReplyKeyboardMarkup(
        keyboard_buttons,
        resize_keyboard=True
    )

    if not doc.exists:
        user_ref.set({
            'first_name': first_name,
            'last_name': last_name,
            'username': username,
            'role': 'listener',
            'preferences': {
                'notification_times': [24, 5, 1, 0.5, 0.0833],
                'subscribed_podcasts': [],
                'tech_tags': []
            }
        })

        welcome_message = (
            f"🎉 **Welcome, {first_name}**\!\n\n"
            "You’ve joined *Podmates* \- your ultimate podcast companion\! 🚀\n\n"
            "🌟 *What you can do here:*\n"
            "🔹 🎧 Discover trending podcasts\n"
            "🔹 📚 Create and share your own podcasts\n"
            "🔹 📜 Subscribe to podcasts from creators\n"
            "🔹 ⭐ Rate your favorites and leave feedback\n"
            "🔹 📅 Set personalized notifications for episodes\n\n"
            "✨ _Start your journey by exploring or creating podcasts today\._"
        )

        buttons = [
            [InlineKeyboardButton(f"{category} ⬜", callback_data=f"select_{category}") for category in TECH_CATEGORIES],
            [InlineKeyboardButton("✅ Finish", callback_data="finish_selection")]
        ]
        inline_markup = InlineKeyboardMarkup(buttons)

        tags_message = (
            "🌐 *Let’s personalize your experience!*\n"
            "Please choose your preferred tech topics from the options below:\n\n"
            "🔹 *Select up to 3 topics* you are interested in:\n"
        )

        await update.message.reply_photo(
            photo=image_url,
            caption=welcome_message,
            parse_mode='MarkdownV2',
            reply_markup=keyboard_markup
        )

        await update.message.reply_text(tags_message, reply_markup=inline_markup)

    else:
        welcome_back_message = (
            f"👋 **Welcome back, {first_name}**\!\n\n"
            "🎧 *Let’s dive back into your favorite podcasts and discover new ones\!*\n\n"
            "🌟 *What’s next for you:*\n"
            "🔹 Browse and explore trending episodes\n"
            "🔹 Manage your subscriptions\n"
            "🔹 Create & share your podcasts with the community\n"
            "🔹 Collaborate with friends and creators\n\n"
            "✨ *Stay inspired and keep listening\!*\n"
        )

        await update.message.reply_photo(
            photo=image_url,
            caption=welcome_back_message,
            parse_mode='MarkdownV2',
            reply_markup=keyboard_markup
        )


async def finish_selection(update, context):
    user = update.effective_user
    user_id = user.id
    hard_disk = context.bot_data['hard_disk']
    
    user_ref = hard_disk.collection('users').document(str(user_id))
    doc = user_ref.get()

    selected_tags = []  # Logic to manage this based on user selection
    user_ref.update({
        'preferences.tech_tags': selected_tags
    })
    
    keyboard_buttons = [
        ['🎧 Browse Podcasts', '⭐ My Ratings'],
        ['📚 Create a Podcast', '📜 My Subscriptions'],
        ['🛠️ Settings']
    ]
    keyboard_markup = ReplyKeyboardMarkup(
        keyboard_buttons,
        resize_keyboard=True
    )
    
    await update.callback_query.answer()
    await update.callback_query.message.reply_text(
        "🎉 You've finished selecting your tech interests! Here's your main menu:",
        reply_markup=keyboard_markup
    )


finish_handler = CallbackQueryHandler(finish_selection, pattern="finish_selection")
