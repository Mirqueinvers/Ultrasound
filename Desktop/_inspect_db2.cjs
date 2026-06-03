const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(process.env.APPDATA, "Ultrasound", "ultrasound.db");
const db = new Database(dbPath);

// Сравниваем ID=120 (работает) и ID=82 (не работает)
for (const id of [120, 82]) {
  console.log(`\n=== Research ID=${id} ===`);
  
  const research = db.prepare("SELECT * FROM researches WHERE id = ?").get(id);
  console.log("Research:", JSON.stringify(research, null, 2));
  
  const studies = db.prepare("SELECT * FROM research_studies WHERE research_id = ?").all(id);
  console.log("Studies count:", studies.length);
  for (const s of studies) {
    console.log(`  study_type=${s.study_type}, data_len=${s.study_data.length}`);
    // Покажем первые 200 символов данных
    console.log(`  data_preview: ${s.study_data.substring(0, 200)}`);
  }
  
  const overrides = db.prepare("SELECT * FROM print_block_overrides WHERE research_id = ?").all(id);
  console.log("Print overrides count:", overrides.length);
  for (const o of overrides) {
    console.log(`  block_id=${o.block_id}, text_len=${o.block_text.length}`);
  }
}

db.close();
