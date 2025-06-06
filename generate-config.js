// node generate-config.js

const fs = require('fs');

const config = {
  "url": process.env.NODEBB_URL,
  "secret": process.env.NODEBB_SECRET,
  "database": "mongo",
  "mongo": {
    "uri": process.env.NODEBB_DB_URI,
    "database": process.env.NODEBB_DB_NAME
  }
};

if (process.env.NODEBB_PORT) {
  config.port = process.env.NODEBB_PORT;
} else {
  if (process.env.NODEBB_URL) {
    const url = new URL(process.env.NODEBB_URL);
    if (url.port) {
      config.port = url.port;
    }
  }
}

const configStr = JSON.stringify(config, null, 2);

// Check if config.json exists
if (fs.existsSync('config.json')) {
  // If it exists, rename it to config.json.back
  fs.renameSync('config.json', 'config.json.back');
  console.log('Existing config.json has been renamed to config.json.back.');
}

// Generate config.json
fs.writeFileSync('config.json', configStr);
console.log('config.json has been generated.');

console.log(configStr);
