const fs = require("fs");
const path = require("path");

// Define source and destination paths
const sourceFile = path.join(__dirname, "report.pdf");
const backupDir = path.join(__dirname, "backups");
const destinationFile = path.join(backupDir, "report.pdf");

// Step 1: Check if source file exists
if (!fs.existsSync(sourceFile)) {
  console.error(
    '❌ Error: Source file "report.pdf" not found in the root directory.'
  );
  process.exit(1);
}

// Step 2: Create backups folder if it doesn't exist
if (!fs.existsSync(backupDir)) {
  try {
    fs.mkdirSync(backupDir);
    console.log('📁 Created "backups" folder.');
  } catch (err) {
    console.error("❌ Error creating backups folder:", err.message);
    process.exit(1);
  }
}

// Step 3: Copy the file
try {
  fs.copyFileSync(sourceFile, destinationFile);
  console.log(`✅ File copied successfully to backups/report.pdf`);
} catch (err) {
  console.error("❌ Error copying file:", err.message);
}
