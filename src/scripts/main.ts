
export const main = async(ctx: any, userData: any) => {
  const username = ctx.from?.username;
  if (userData) {
    const welcomeMessage = `Welcome back, ${username}!\n\nHere is your data:\n${JSON.stringify(
      userData,
      null,
      2
    )}`;
    await ctx.reply(welcomeMessage);
  } else {
    await ctx.reply("Could not retrieve your data.");
  }
}
