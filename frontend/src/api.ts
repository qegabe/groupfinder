import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

class GroupFinderApi {
  static token: string | undefined;

  static async request(endpoint: string, data = {}, method: Method = "GET") {
    const url = `${BASE_URL}/${endpoint}`;
    const headers = { Authorization: `Bearer ${this.token}` };
    const params = method === "GET" ? data : {};

    try {
      return (await axios({ url, method, data, params, headers })).data;
    } catch (error: any) {
      let message = error.response.data.error.message;
      throw message;
    }
  }

  static async register(username: string, password: string) {
    const res = await this.request(
      "auth/register",
      { username, password },
      "POST"
    );
    return res.token;
  }

  static async login(username: string, password: string) {
    const res = await this.request(
      "auth/login",
      { username, password },
      "POST"
    );
    return res.token;
  }

  static async getGroups(filter = {}) {
    const res = await this.request("api/groups", filter);
    return res.groups;
  }

  static async createGroup(data: IGroup) {
    const newData: any = { ...data };

    if (data.maxMembers) newData.maxMembers = +data.maxMembers;
    if (isNaN(newData.maxMembers)) {
      delete newData.maxMembers;
    }

    if (data.startTime) {
      newData.startTime = data.startTime.toISOString();
    }
    if (data.endTime) {
      newData.endTime = data.endTime.toISOString();
    }

    const res = await this.request("api/groups", data, "POST");
    return res.group;
  }

  static async getUser(username: string) {
    const res = await this.request(`api/users/${username}`);
    return res.user;
  }
}

export default GroupFinderApi;
