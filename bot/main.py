from telegram.ext import Application, CommandHandler
from handlers.start_handler import start
from services.firebase_service import initialize_firebase
from config import BOT_TOKEN


def main():
    hard_disk, ram = initialize_firebase()

    application = Application.builder().token(BOT_TOKEN).build()

    application.bot_data['hard_disk'] = hard_disk
    application.bot_data['ram'] = ram

    application.add_handler(CommandHandler('start', start))

    print("Bot is running...")
    application.run_polling()

if __name__ == '__main__':
    main()