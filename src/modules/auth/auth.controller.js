import { registerUser, loginUser, resetPasswordService, forgotPasswordService } from "./auth.service.js";

export const forgotPassword = async (req, res) => {
  try {
    const result = await forgotPasswordService(req.body.email);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

export const resetPassword =
  async (
    req,
    res
  ) => {

    try {

      const result =
        await resetPasswordService(
          req.body.token,
          req.body.password
        );

      res.status(200).json(
        result
      );

    } catch (err) {

      res.status(400).json({
        error:
          err.message,
      });
    }
  };

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
    const { password, ...safeUser } = data.user;
    res.json({
      token: data.token,
      user: safeUser,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};