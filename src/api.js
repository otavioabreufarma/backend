export async function getUserByDiscord(discordId) {
  try {
    const { data } = await api.get(`/internal/user/by-discord/${discordId}`);
    return data;
  } catch {
    return null;
  }
}
