const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Define input folder and output zip file
const sourceDir = path.join(__dirname, 'Firefox');
const outPath = path.join(__dirname, 'firefox-extension.zip');

// Create a file to stream archive data to
const output = fs.createWriteStream(outPath);
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level to maximum
});

// Listen for all archive data to be written
output.on('close', () => {
  console.log(`✅ Successfully created ${outPath}`);
  console.log(`📦 Total bytes: ${archive.pointer()}`);
});

// Catch warnings and errors
archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn('Warning:', err);
  } else {
    throw err;
  }
});

archive.on('error', (err) => {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Append files from the Firefox directory, placing them at the root of the zip
archive.directory(sourceDir, false);

// Finalize the archive (we are done appending files)
archive.finalize();
