import axios from "axios";

const IGDB_URL = "https://api.igdb.com/v4";

/**
 * Checks if the twitch token is valid
 * @returns {boolean}
 */
function validateToken(): boolean {
  axios({
    method: "GET",
    url: `https://id.twitch.tv/oauth2/validate`,
    headers: {
      Authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
    },
  })
    .then((res) => {
      console.log(`Twitch validated with ${res.status}`);
      if (res.status === 401) {
        return false;
      }
    })
    .catch((e) => {
      console.error(e);
    });
  return true;
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
    console.error(error.code);
  }
}

export { validateToken, requestIGDB };