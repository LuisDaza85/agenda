const bcrypt = require('bcryptjs');

async function generateHashes() {
  const admin123 = await bcrypt.hash('admin123', 12);
  const unit123 = await bcrypt.hash('unit123', 12);
  const viewer123 = await bcrypt.hash('viewer123', 12);
  
  console.log('\nCopia estos hashes:\n');
  console.log('admin123:');
  console.log(admin123);
  console.log('\nunit123:');
  console.log(unit123);
  console.log('\nviewer123:');
  console.log(viewer123);
}

generateHashes();