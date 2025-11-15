import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';
import { schoolDb, militaryBaseDb, aeaMemberDb, initDatabase } from '../src/services/database';
import { geocodeBatch } from '../src/services/geocoding';

// Helper function to read and parse CSV
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error)
    });
  });
}

// Convert CSV row to School object
function csvToSchool(row) {
  return {
    name: row.name,
    type: row.type,
    address: row.address,
    city: row.city,
    state: row.state,
    zipCode: row.zipCode,
    latitude: row.latitude ? parseFloat(row.latitude) : undefined,
    longitude: row.longitude ? parseFloat(row.longitude) : undefined,
    email: row.email || undefined,
    phone: row.phone || undefined,
    poc: row.poc || undefined,
    website: row.website || undefined,
  };
}

// Convert CSV row to MilitaryBase object
function csvToMilitaryBase(row) {
  return {
    name: row.name,
    branch: row.branch,
    address: row.address,
    city: row.city,
    state: row.state,
    zipCode: row.zipCode,
    latitude: row.latitude ? parseFloat(row.latitude) : undefined,
    longitude: row.longitude ? parseFloat(row.longitude) : undefined,
    email: row.email || undefined,
    phone: row.phone || undefined,
    poc: row.poc || undefined,
    website: row.website || undefined,
    readinessCenterUrl: row.readinessCenterUrl || undefined,
    hasAvionicsTechs: row.hasAvionicsTechs === 'true' || row.hasAvionicsTechs === '1',
  };
}

// Convert CSV row to AEAMember object
function csvToAEAMember(row) {
  return {
    name: row.name,
    shopType: row.shopType,
    address: row.address,
    city: row.city,
    state: row.state,
    zipCode: row.zipCode,
    latitude: row.latitude ? parseFloat(row.latitude) : undefined,
    longitude: row.longitude ? parseFloat(row.longitude) : undefined,
    email: row.email || undefined,
    phone: row.phone || undefined,
    poc: row.poc || undefined,
    website: row.website || undefined,
    certifications: row.certifications || undefined,
  };
}

async function loadSampleData() {
  console.log('🚀 Starting sample data import...\n');

  try {
    // Initialize database
    console.log('📊 Initializing database...');
    initDatabase();
    console.log('✅ Database initialized\n');

    // Sample data is in the project root, not in backend
    const sampleDataDir = path.join(process.cwd(), '../sample-data');

    // Load Schools
    console.log('🏫 Loading schools...');
    const schoolsCSV = await readCSV(path.join(sampleDataDir, 'schools.csv'));
    const schools = schoolsCSV.map(csvToSchool);

    console.log(`   Found ${schools.length} schools in CSV`);
    console.log('   Geocoding schools (this may take a minute)...');

    const schoolsToGeocode = schools.filter(s => !s.latitude || !s.longitude);
    const schoolsWithCoords = schools.filter(s => s.latitude && s.longitude);

    let geocodedSchools = [];
    if (schoolsToGeocode.length > 0) {
      geocodedSchools = await geocodeBatch(schoolsToGeocode, (current, total) => {
        process.stdout.write(`\r   Geocoded ${current}/${total} schools...`);
      });
      console.log(); // New line after progress
    }

    const allSchools = [...schoolsWithCoords, ...geocodedSchools];
    const schoolCount = schoolDb.bulkInsert(allSchools);
    console.log(`✅ Imported ${schoolCount} schools\n`);

    // Load Military Bases
    console.log('🪖 Loading military bases...');
    const basesCSV = await readCSV(path.join(sampleDataDir, 'military_bases.csv'));
    const bases = basesCSV.map(csvToMilitaryBase);

    console.log(`   Found ${bases.length} military bases in CSV`);
    console.log('   Geocoding military bases (this may take a minute)...');

    const basesToGeocode = bases.filter(b => !b.latitude || !b.longitude);
    const basesWithCoords = bases.filter(b => b.latitude && b.longitude);

    let geocodedBases = [];
    if (basesToGeocode.length > 0) {
      geocodedBases = await geocodeBatch(basesToGeocode, (current, total) => {
        process.stdout.write(`\r   Geocoded ${current}/${total} military bases...`);
      });
      console.log(); // New line after progress
    }

    const allBases = [...basesWithCoords, ...geocodedBases];
    const baseCount = militaryBaseDb.bulkInsert(allBases);
    console.log(`✅ Imported ${baseCount} military bases\n`);

    // Load AEA Members
    console.log('✈️  Loading AEA members...');
    const membersCSV = await readCSV(path.join(sampleDataDir, 'aea_members.csv'));
    const members = membersCSV.map(csvToAEAMember);

    console.log(`   Found ${members.length} AEA members in CSV`);
    console.log('   Geocoding AEA members (this may take a minute)...');

    const membersToGeocode = members.filter(m => !m.latitude || !m.longitude);
    const membersWithCoords = members.filter(m => m.latitude && m.longitude);

    let geocodedMembers = [];
    if (membersToGeocode.length > 0) {
      geocodedMembers = await geocodeBatch(membersToGeocode, (current, total) => {
        process.stdout.write(`\r   Geocoded ${current}/${total} AEA members...`);
      });
      console.log(); // New line after progress
    }

    const allMembers = [...membersWithCoords, ...geocodedMembers];
    const memberCount = aeaMemberDb.bulkInsert(allMembers);
    console.log(`✅ Imported ${memberCount} AEA members\n`);

    // Summary
    console.log('╔════════════════════════════════════════╗');
    console.log('║  🎉 Sample Data Import Complete!      ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║  Schools:        ${schoolCount.toString().padStart(3)} imported          ║`);
    console.log(`║  Military Bases: ${baseCount.toString().padStart(3)} imported          ║`);
    console.log(`║  AEA Members:    ${memberCount.toString().padStart(3)} imported          ║`);
    console.log(`║  Total:          ${(schoolCount + baseCount + memberCount).toString().padStart(3)} entities         ║`);
    console.log('╚════════════════════════════════════════╝');
    console.log('\n✨ Your map is now ready! Start the server and view the data.\n');

  } catch (error) {
    console.error('❌ Error loading sample data:', error);
    process.exit(1);
  }
}

// Run the import
loadSampleData();
