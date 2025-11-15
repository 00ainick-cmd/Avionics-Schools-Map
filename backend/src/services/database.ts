import Database from 'better-sqlite3';
import path from 'path';
import { School, MilitaryBase, AEAMember } from '../types';

const dbPath = path.join(__dirname, '../../data/avionics-map.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initDatabase() {
  // Schools table
  db.exec(`
    CREATE TABLE IF NOT EXISTS schools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('Part 147', 'Technical College', '4-Year Program', 'High School')),
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip_code TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      email TEXT,
      phone TEXT,
      poc TEXT,
      website TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Military bases table
  db.exec(`
    CREATE TABLE IF NOT EXISTS military_bases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      branch TEXT NOT NULL CHECK(branch IN ('Air Force', 'Navy', 'Army', 'Marines', 'Coast Guard', 'Space Force')),
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip_code TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      email TEXT,
      phone TEXT,
      poc TEXT,
      website TEXT,
      readiness_center_url TEXT,
      has_avionics_techs INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // AEA members table
  db.exec(`
    CREATE TABLE IF NOT EXISTS aea_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      shop_type TEXT NOT NULL CHECK(shop_type IN ('Repair Station', 'Airline', 'OEM', 'MRO', 'Other')),
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip_code TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      email TEXT,
      phone TEXT,
      poc TEXT,
      website TEXT,
      certifications TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database initialized successfully');
}

// School operations
export const schoolDb = {
  getAll: () => {
    return db.prepare('SELECT * FROM schools').all() as School[];
  },

  getById: (id: number) => {
    return db.prepare('SELECT * FROM schools WHERE id = ?').get(id) as School | undefined;
  },

  create: (school: School) => {
    const stmt = db.prepare(`
      INSERT INTO schools (name, type, address, city, state, zip_code, latitude, longitude, email, phone, poc, website)
      VALUES (@name, @type, @address, @city, @state, @zipCode, @latitude, @longitude, @email, @phone, @poc, @website)
    `);
    const result = stmt.run(school);
    return result.lastInsertRowid;
  },

  update: (id: number, school: Partial<School>) => {
    const fields = Object.keys(school).filter(k => k !== 'id').map(k => {
      const dbKey = k.replace(/([A-Z])/g, '_$1').toLowerCase();
      return `${dbKey} = @${k}`;
    }).join(', ');

    const stmt = db.prepare(`UPDATE schools SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    const result = stmt.run({ ...school, id });
    return result.changes;
  },

  delete: (id: number) => {
    const stmt = db.prepare('DELETE FROM schools WHERE id = ?');
    const result = stmt.run(id);
    return result.changes;
  },

  bulkInsert: (schools: School[]) => {
    const insert = db.prepare(`
      INSERT INTO schools (name, type, address, city, state, zip_code, latitude, longitude, email, phone, poc, website)
      VALUES (@name, @type, @address, @city, @state, @zipCode, @latitude, @longitude, @email, @phone, @poc, @website)
    `);

    const insertMany = db.transaction((schools: School[]) => {
      for (const school of schools) insert.run(school);
    });

    insertMany(schools);
    return schools.length;
  }
};

// Military base operations
export const militaryBaseDb = {
  getAll: () => {
    return db.prepare('SELECT * FROM military_bases').all() as MilitaryBase[];
  },

  getById: (id: number) => {
    return db.prepare('SELECT * FROM military_bases WHERE id = ?').get(id) as MilitaryBase | undefined;
  },

  create: (base: MilitaryBase) => {
    const stmt = db.prepare(`
      INSERT INTO military_bases (name, branch, address, city, state, zip_code, latitude, longitude, email, phone, poc, website, readiness_center_url, has_avionics_techs)
      VALUES (@name, @branch, @address, @city, @state, @zipCode, @latitude, @longitude, @email, @phone, @poc, @website, @readinessCenterUrl, @hasAvionicsTechs)
    `);
    const result = stmt.run({ ...base, hasAvionicsTechs: base.hasAvionicsTechs ? 1 : 0 });
    return result.lastInsertRowid;
  },

  update: (id: number, base: Partial<MilitaryBase>) => {
    const fields = Object.keys(base).filter(k => k !== 'id').map(k => {
      const dbKey = k.replace(/([A-Z])/g, '_$1').toLowerCase();
      return `${dbKey} = @${k}`;
    }).join(', ');

    const stmt = db.prepare(`UPDATE military_bases SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    const result = stmt.run({ ...base, id });
    return result.changes;
  },

  delete: (id: number) => {
    const stmt = db.prepare('DELETE FROM military_bases WHERE id = ?');
    const result = stmt.run(id);
    return result.changes;
  },

  bulkInsert: (bases: MilitaryBase[]) => {
    const insert = db.prepare(`
      INSERT INTO military_bases (name, branch, address, city, state, zip_code, latitude, longitude, email, phone, poc, website, readiness_center_url, has_avionics_techs)
      VALUES (@name, @branch, @address, @city, @state, @zipCode, @latitude, @longitude, @email, @phone, @poc, @website, @readinessCenterUrl, @hasAvionicsTechs)
    `);

    const insertMany = db.transaction((bases: MilitaryBase[]) => {
      for (const base of bases) {
        insert.run({ ...base, hasAvionicsTechs: base.hasAvionicsTechs ? 1 : 0 });
      }
    });

    insertMany(bases);
    return bases.length;
  }
};

// AEA member operations
export const aeaMemberDb = {
  getAll: () => {
    return db.prepare('SELECT * FROM aea_members').all() as AEAMember[];
  },

  getById: (id: number) => {
    return db.prepare('SELECT * FROM aea_members WHERE id = ?').get(id) as AEAMember | undefined;
  },

  create: (member: AEAMember) => {
    const stmt = db.prepare(`
      INSERT INTO aea_members (name, shop_type, address, city, state, zip_code, latitude, longitude, email, phone, poc, website, certifications)
      VALUES (@name, @shopType, @address, @city, @state, @zipCode, @latitude, @longitude, @email, @phone, @poc, @website, @certifications)
    `);
    const result = stmt.run(member);
    return result.lastInsertRowid;
  },

  update: (id: number, member: Partial<AEAMember>) => {
    const fields = Object.keys(member).filter(k => k !== 'id').map(k => {
      const dbKey = k.replace(/([A-Z])/g, '_$1').toLowerCase();
      return `${dbKey} = @${k}`;
    }).join(', ');

    const stmt = db.prepare(`UPDATE aea_members SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    const result = stmt.run({ ...member, id });
    return result.changes;
  },

  delete: (id: number) => {
    const stmt = db.prepare('DELETE FROM aea_members WHERE id = ?');
    const result = stmt.run(id);
    return result.changes;
  },

  bulkInsert: (members: AEAMember[]) => {
    const insert = db.prepare(`
      INSERT INTO aea_members (name, shop_type, address, city, state, zip_code, latitude, longitude, email, phone, poc, website, certifications)
      VALUES (@name, @shopType, @address, @city, @state, @zipCode, @latitude, @longitude, @email, @phone, @poc, @website, @certifications)
    `);

    const insertMany = db.transaction((members: AEAMember[]) => {
      for (const member of members) insert.run(member);
    });

    insertMany(members);
    return members.length;
  }
};

export default db;
