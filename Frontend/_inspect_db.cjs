const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(process.env.APPDATA, "Ultrasound", "ultrasound.db");
console.log("DB path:", dbPath);

const db = new Database(dbPath);

// Смотрим все исследования с их типами
const rows = db
  .prepare(
    `SELECT r.id, r.research_date, r.patient_id, rs.study_type, length(rs.study_data) as data_len
     FROM researches r
     LEFT JOIN research_studies rs ON rs.research_id = r.id
     ORDER BY r.id`,
  )
  .all();

// Группируем по research_id
const grouped = {};
for (const row of rows) {
  if (!grouped[row.id]) {
    grouped[row.id] = { id: row.id, date: row.research_date, patient_id: row.patient_id, studies: [] };
  }
  if (row.study_type) {
    grouped[row.id].studies.push({ type: row.study_type, data_len: row.data_len });
  }
}

console.log("\n=== Все исследования в БД ===");
for (const [id, g] of Object.entries(grouped)) {
  console.log(`ID=${id} date=${g.date} patient=${g.patient_id} studies=${JSON.stringify(g.studies)}`);
}

// Проверим, есть ли протоколы с несколькими исследованиями
console.log("\n=== Исследования с несколькими study_types ===");
for (const [id, g] of Object.entries(grouped)) {
  if (g.studies.length > 1) {
    console.log(`ID=${id}: ${JSON.stringify(g.studies)}`);
  }
}

db.close();
