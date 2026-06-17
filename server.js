const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "dashboard_energie",
  waitForConnections: true,
  connectionLimit: 10
});

app.post("/api/monthly-consumption", async (req, res) => {
  const { month, targetKwh, totalKwh, percentUsed, weekData, devices } = req.body;

  if (!month || !Array.isArray(weekData) || !Array.isArray(devices)) {
    return res.status(400).json({ message: "Donnees invalides" });
  }

  const sql = `
    INSERT INTO monthly_consumption
      (month_key, target_kwh, total_kwh, percent_used, week_data, devices)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      target_kwh = VALUES(target_kwh),
      total_kwh = VALUES(total_kwh),
      percent_used = VALUES(percent_used),
      week_data = VALUES(week_data),
      devices = VALUES(devices)
  `;

  await pool.execute(sql, [
    month,
    targetKwh,
    totalKwh,
    percentUsed,
    JSON.stringify(weekData),
    JSON.stringify(devices)
  ]);

  res.json({ message: "Sauvegarde reussie" });
});

app.get("/api/monthly-consumption", async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT * FROM monthly_consumption ORDER BY month_key DESC"
  );

  res.json(rows);
});

app.get("/api/monthly-consumption/:month", async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT * FROM monthly_consumption WHERE month_key = ?",
    [req.params.month]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Aucune donnee pour ce mois" });
  }

  res.json(rows[0]);
});

app.listen(port, () => {
  console.log(`Serveur lance sur http://localhost:${port}`);
});
