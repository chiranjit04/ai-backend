import { registerUser, loginUser } from "./auth.service.js";

// ✅ REGISTER
export const register = async (req, res) => {
  try {
    const user = await registerUser({
      ...req.body,
      creator: req.user,
    });

    res.json({
      message: "User created",
      user,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ LOGIN (ADD THIS)
export const login = async (req, res) => {
  try {
    const data = await loginUser(req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};