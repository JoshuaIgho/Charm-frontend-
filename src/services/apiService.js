import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  headers: { "Content-Type": "application/json" },
});

// Admin already exists
export default {
  googleAdminLogin: async (idToken) => {
    const res = await api.post("/auth/admin/google", { idToken });
    return res.data;
  },
};
