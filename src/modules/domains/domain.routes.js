import { Router } from "express";
import db from "../../config/db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        BIN_TO_UUID(domain_id) AS domain_id,
        name
      FROM domains
      ORDER BY name ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

export default router;