import axios from "axios";

const IGDB_URL = "https://api.igdb.com/v4";

/**
 * Checks if the twitch token is valid
 * @returns {Promise<boolean>}
 */
async function validateToken(): Promise<boolean> {
  if (process.env.TWITCH_TOKEN !== undefined) {
    try {
      const res = await axios({
        method: "GET",
        url: `https://id.twitch.tv/oauth2/validate`,
        headers: {
          Authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
        },
      });

      console.log(`Twitch validated with ${res.status}`);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  return false;
}

/**
 * Send a request to IGDB
 * @param endpoint endpoint for request
 * @param data
 * @returns {Promise<any[]>}
 */
async function requestIGDB(endpoint: string, data: string): Promise<any[]> {
  console.log("Sending request to IGDB...");
  try {
    const resp = await axios({
      url: `${IGDB_URL}/${endpoint}`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
        "Client-ID": process.env.TWITCH_CLIENT_ID,
      },
      data,
    });
    return resp.data;
  } catch (error) {
    //console.error(error);
    console.error(`IGDB Request failed with: ${error.code}`);
  }
}

export { validateToken, requestIGDB };
