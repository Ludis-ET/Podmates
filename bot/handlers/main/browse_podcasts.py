

async def browse_podcasts(update, context):
    hard_disk = context.bot_data['hard_disk']
    
    podcasts_ref = hard_disk.collection('podcasts')
    podcasts = podcasts_ref.stream()
    
    if not podcasts:
        await update.message.reply_text("🎙️ No podcasts available yet. Stay tuned!")
        return

    for podcast in podcasts:
        data = podcast.to_dict()
        print(data)
        await update.message.reply_text(
            f"🎙️ **{data['title']}**\n"
            f"_By {data['creator']}_\n\n"
            f"{data['description']}\n\n"
            f"🌟 Rating: {data['rating']}/5\n\n"
            f"🔗 Subscribe to this podcast using the button below:",
            parse_mode='Markdown'
        )
