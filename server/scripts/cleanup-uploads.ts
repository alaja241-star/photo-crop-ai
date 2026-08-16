#!/usr/bin/env tsx

/**
 * Cleanup script to remove old uploaded files.
 * Run periodically to clean up any orphaned files.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '../uploads');

function cleanupDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory ${dirPath} does not exist.`);
    return;
  }

  const files = fs.readdirSync(dirPath);
  let deletedCount = 0;

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile()) {
      try {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`Deleted: ${file}`);
      } catch (error) {
        console.error(`Error deleting ${file}:`, (error as Error).message);
      }
    }
  });

  console.log(`Cleanup complete. Deleted ${deletedCount} files from ${dirPath}`);
}

function main(): void {
  console.log('Starting cleanup of uploaded files...');

  const cropsDir = path.join(uploadsDir, 'crops');
  console.log('\nCleaning crop images...');
  cleanupDirectory(cropsDir);

  const soilDir = path.join(uploadsDir, 'soil');
  console.log('\nCleaning soil images...');
  cleanupDirectory(soilDir);

  console.log('\nCleanup process completed.');
}

main();
