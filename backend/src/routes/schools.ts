import { Router, Request, Response } from 'express';
import { schoolDb } from '../services/database';
import { geocodeAddress, geocodeBatch } from '../services/geocoding';
import { School } from '../types';

const router = Router();

// Get all schools
router.get('/', (req: Request, res: Response) => {
  try {
    const schools = schoolDb.getAll();
    res.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

// Get school by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const school = schoolDb.getById(id);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json(school);
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({ error: 'Failed to fetch school' });
  }
});

// Create new school
router.post('/', async (req: Request, res: Response) => {
  try {
    const school: School = req.body;

    // Geocode if coordinates not provided
    if (!school.latitude || !school.longitude) {
      const geocoded = await geocodeAddress(school.address, school.city, school.state, school.zipCode);
      if (geocoded) {
        school.latitude = geocoded.latitude;
        school.longitude = geocoded.longitude;
      }
    }

    const id = schoolDb.create(school);
    const created = schoolDb.getById(id as number);

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating school:', error);
    res.status(500).json({ error: 'Failed to create school' });
  }
});

// Update school
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updates: Partial<School> = req.body;

    // If address changed and no new coordinates provided, geocode
    if ((updates.address || updates.city || updates.state || updates.zipCode) && !updates.latitude && !updates.longitude) {
      const existing = schoolDb.getById(id);
      if (existing) {
        const address = updates.address || existing.address;
        const city = updates.city || existing.city;
        const state = updates.state || existing.state;
        const zipCode = updates.zipCode || existing.zipCode;

        const geocoded = await geocodeAddress(address, city, state, zipCode);
        if (geocoded) {
          updates.latitude = geocoded.latitude;
          updates.longitude = geocoded.longitude;
        }
      }
    }

    const changes = schoolDb.update(id, updates);

    if (changes === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    const updated = schoolDb.getById(id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating school:', error);
    res.status(500).json({ error: 'Failed to update school' });
  }
});

// Delete school
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const changes = schoolDb.delete(id);

    if (changes === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting school:', error);
    res.status(500).json({ error: 'Failed to delete school' });
  }
});

// Bulk import schools from CSV
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const schools: School[] = req.body;

    // Geocode schools without coordinates
    const schoolsToGeocode = schools.filter(s => !s.latitude || !s.longitude);
    const schoolsWithCoords = schools.filter(s => s.latitude && s.longitude);

    let geocoded: School[] = [];
    if (schoolsToGeocode.length > 0) {
      console.log(`Geocoding ${schoolsToGeocode.length} schools...`);
      geocoded = await geocodeBatch(schoolsToGeocode, (current, total) => {
        console.log(`Geocoded ${current}/${total} schools`);
      });
    }

    const allSchools = [...schoolsWithCoords, ...geocoded];
    const count = schoolDb.bulkInsert(allSchools);

    res.status(201).json({
      message: `Successfully imported ${count} schools`,
      count
    });
  } catch (error) {
    console.error('Error bulk importing schools:', error);
    res.status(500).json({ error: 'Failed to bulk import schools' });
  }
});

export default router;
