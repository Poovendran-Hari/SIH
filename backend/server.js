const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" })); // increased limit for large bulk uploads

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",             // 🔹 change if needed
    password: "0000",         // 🔹 replace with your MySQL password
    database: "alumni_db"     // 🔹 must match your DB
});

// Connect DB
db.connect((err) => {
    if (err) {
        console.error("❌ MySQL connection failed:", err);
        return;
    }
    console.log("✅ Connected to MySQL Database");
});

// ================== API ROUTES ================== //

// GET all alumni
app.get("/api/alumni", (req, res) => {
    const sql = "SELECT * FROM ALUMNI ORDER BY alumni_id DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching alumni:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// POST add single alumni
app.post("/api/alumni", (req, res) => {
    const data = req.body;
    const sql = `
    INSERT INTO ALUMNI 
    (name, email, phone_number, branch, batch_year, career_path, job_sector, company_name, job_title, years_of_exp, linkedin, mentorship, mentorship_area, expertise_area, bio) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
    db.query(sql, [
        data.name,
        data.email,
        data.phone_number,
        data.branch,
        data.batch_year,
        data.career_path,
        data.job_sector,
        data.company_name,
        data.job_title,
        data.years_of_exp,
        data.linkedin,
        data.mentorship || "No",
        data.mentorship_area,
        data.expertise_area,
        data.bio,
    ], (err, result) => {
        if (err) {
            console.error("Error inserting alumni:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "✅ Alumni added successfully", id: result.insertId });
    });
});

// PUT update alumni by ID
app.put("/api/alumni/:id", (req, res) => {
    const { id } = req.params;
    const data = req.body;

    const sql = `
    UPDATE ALUMNI 
    SET name=?, email=?, phone_number=?, branch=?, batch_year=?, career_path=?, job_sector=?, company_name=?, job_title=?, years_of_exp=?, linkedin=?, mentorship=?, mentorship_area=?, expertise_area=?, bio=? 
    WHERE alumni_id=?
  `;
    db.query(sql, [
        data.name,
        data.email,
        data.phone_number,
        data.branch,
        data.batch_year,
        data.career_path,
        data.job_sector,
        data.company_name,
        data.job_title,
        data.years_of_exp,
        data.linkedin,
        data.mentorship || "No",
        data.mentorship_area,
        data.expertise_area,
        data.bio,
        id,
    ], (err, result) => {
        if (err) {
            console.error("Error updating alumni:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: `✏️ Alumni ID ${id} updated` });
    });
});

// DELETE alumni by ID
app.delete("/api/alumni/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM ALUMNI WHERE alumni_id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deleting alumni:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: `🗑️ Alumni ID ${id} deleted` });
    });
});

// POST bulk upload alumni (CSV/Excel data)
app.post("/api/alumni/bulk", (req, res) => {
    const alumniArray = req.body; // array of alumni objects
    if (!Array.isArray(alumniArray) || alumniArray.length === 0) {
        return res.status(400).json({ error: "No alumni data provided" });
    }

    const values = alumniArray.map((a) => [
        a.name || "",
        a.email || "",
        a.phone_number || "",
        a.branch || "",
        a.batch_year || "",
        a.career_path || "",
        a.job_sector || "",
        a.company_name || "",
        a.job_title || "",
        a.years_of_exp || "",
        a.linkedin || "",
        a.mentorship || "No",
        a.mentorship_area || "",
        a.expertise_area || "",
        a.bio || "",
    ]);

    const sql = `
    INSERT INTO ALUMNI 
    (name,email,phone_number,branch,batch_year,career_path,job_sector,company_name,job_title,years_of_exp,linkedin,mentorship,mentorship_area,expertise_area,bio)
    VALUES ?
  `;

    db.query(sql, [values], (err, result) => {
        if (err) {
            console.error("Error inserting bulk alumni:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: `✅ Bulk upload successful (${alumniArray.length} records)` });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
