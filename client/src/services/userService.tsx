import axios from "axios";
import axiosWithAuth from "../utils/axiosWithAuth";
import { API_BASE_URL, CLOUD_NAME, UPLOAD_PRESET } from "../utils/constants";
import Cookies from "js-cookie";

export const getUser = async (id: string) => {
  const { data } = await axios.get(`${API_BASE_URL}/users/${id}`);
  return data;
};

// Update these functions with try/catch blocks

export const getUsersBySearch = async (search: string) => {
  try {
    const { data } = await axiosWithAuth.get(`/users/?search=${search}`);
    return data;
  } catch (error: any) {
    console.error("Error searching users:", error);
    return {
      statusCode: error.response?.status || "500",
      message: error.response?.data?.message || "Failed to search users",
      users: [],
    };
  }
};

export const updateUser = async (id: string, user: any) => {
  try {
    const token = Cookies.get("access_token");
    if (!token) {
      return {
        statusCode: "401",
        message: "No authentication token found. Please log in again.",
      };
    }

    const { data } = await axiosWithAuth.put(`/users/${id}`, user);
    return data;
  } catch (error: any) {
    console.error("Error updating user:", error);
    if (error.response && error.response.status === 401) {
      return {
        statusCode: "401",
        message: "Your session has expired. Please log in again.",
      };
    }
    return {
      statusCode: error.response?.status || "500",
      message: error.response?.data?.message || "Failed to update user",
    };
  }
};

// FRIENDS
export const getFriends = async (id: string) => {
  try {
    const { data } = await axiosWithAuth.get(`/users/${id}/friend`);
    return data;
  } catch (error: any) {
    console.error("Error fetching friends:", error);
    return {
      statusCode: error.response?.status || "500",
      message: error.response?.data?.message || "Failed to fetch friends",
      friends: [],
    };
  }
};

export const setFriend = async (
  id: string,
  otherId: string,
  status: boolean
) => {
  try {
    const token = Cookies.get("access_token");
    if (!token) {
      return {
        statusCode: "401",
        message: "No authentication token found. Please log in again.",
      };
    }

    const { data } = await axiosWithAuth.put(`/users/${id}/friend`, {
      otherId,
      status,
    });
    return data;
  } catch (error: any) {
    console.error("Error updating friend status:", error);
    if (error.response && error.response.status === 401) {
      return {
        statusCode: "401",
        message: "Your session has expired. Please log in again.",
      };
    }
    return {
      statusCode: error.response?.status || "500",
      message:
        error.response?.data?.message || "Failed to update friend status",
    };
  }
};

export const checkFriend = async (userId: string, id: string) => {
  const { data } = await axiosWithAuth.get(`/users/${userId}`);
  const friends: string[] = data.user.friends;
  if (!friends) return false;

  const isFriend = friends.includes(id);
  return isFriend;
};

// REQUESTS
export const getRequests = async (id: string) => {
  try {
    const { data } = await axiosWithAuth.get(`/users/${id}/request`);
    return data;
  } catch (error) {
    console.error("Error fetching requests:", error);
    return {
      statusCode: "401",
      message: "Authentication failed. Please log in again.",
    };
  }
};

export const setRequest = async (
  id: string,
  otherId: string,
  status: boolean
) => {
  try {
    // Ensure the token is included in the request
    const token = Cookies.get("access_token");
    if (!token) {
      return {
        statusCode: "401",
        message: "No authentication token found. Please log in again.",
      };
    }

    const { data } = await axiosWithAuth.put(
      `/users/${id}/request`,
      {
        otherId,
        status,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error: any) {
    console.error("Error setting request:", error);
    if (error.response && error.response.status === 401) {
      // Handle token expiration
      return {
        statusCode: "401",
        message: "Your session has expired. Please log in again.",
      };
    }
    return {
      statusCode: error.response?.status || "500",
      message:
        error.response?.data?.message ||
        "An error occurred while processing your request.",
    };
  }
};

// BLOCK
export const getBlocked = async (id: string) => {
  try {
    const { data } = await axiosWithAuth.get(`/users/${id}/block`);
    return data;
  } catch (error: any) {
    console.error("Error fetching blocked users:", error);
    return {
      statusCode: error.response?.status || "500",
      message: error.response?.data?.message || "Failed to fetch blocked users",
      blocked: [],
    };
  }
};

export const setBlocked = async (
  id: string,
  otherId: string,
  status: boolean
) => {
  try {
    const token = Cookies.get("access_token");
    if (!token) {
      return {
        statusCode: "401",
        message: "No authentication token found. Please log in again.",
      };
    }

    const { data } = await axiosWithAuth.put(`/users/${id}/block`, {
      otherId,
      status,
    });
    return data;
  } catch (error: any) {
    console.error("Error updating block status:", error);
    if (error.response && error.response.status === 401) {
      return {
        statusCode: "401",
        message: "Your session has expired. Please log in again.",
      };
    }
    return {
      statusCode: error.response?.status || "500",
      message: error.response?.data?.message || "Failed to update block status",
    };
  }
};

export const checkBlock = async (userId: string, id: string) => {
  const { data } = await axiosWithAuth.get(`/users/${userId}`);
  const blocked: string[] = data.user.blocked;
  if (!blocked) return false;

  const isBlocked = blocked.includes(id);
  return isBlocked;
};
