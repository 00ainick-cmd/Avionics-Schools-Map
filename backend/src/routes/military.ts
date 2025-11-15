import { Router, Request, Response } from 'express';
import { militaryBaseDb } from '../services/database';
import { geocodeAddress, geocodeBatch } from '../services/geocoding';
import { MilitaryBase } from '../types';

const router = Router();

// Get all military bases
router.get('/', (req: Request, res: Response) => {
  try {
    const bases = militaryBaseDb.getAll();
    res.json(bases);
  } catch (error) {
    console.error('Error fetching military bases:', error);
    res.status(500).json({ error: 'Failed to fetch military bases' });
  }
});

// Get military base by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const base = militaryBaseDb.getById(id);

    if (!base) {
      return res.status(404).json({ error: 'Military base not found' });
    }

    res.json(base);
  } catch (error) {
    console.error('Error fetching military base:', error);
    res.status(500).json({ error: 'Failed to fetch military base' });
  }
});

// Create new military base
router.post('/', async (req: Request, res: Response) => {
  try {
    const base: MilitaryBase = req.body;

    // Geocode if coordinates not provided
    if (!base.latitude || !base.longitude) {
      const geocoded = await geocodeAddress(base.address, base.city, base.state, base.zipCode);
      if (geocoded) {
        base.latitude = geocoded.latitude;
        base.longitude = geocoded.longitude;
      }
    }

    const id = militaryBaseDb.create(base);
    const created = militaryBaseDb.getById(id as number);

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating military base:', error);
    res.status(500).json({ error: 'Failed to create military base' });
  }
});

// Update military base
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updates: Partial<MilitaryBase> = req.body;

    // If address changed and no new coordinates provided, geocode
    if ((updates.address || updates.city || updates.state || updates.zipCode) && !updates.latitude && !updates.longitude) {
      const existing = militaryBaseDb.getById(id);
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

    const changes = militaryBaseDb.update(id, updates);

    if (changes === 0) {
      return res.status(404).json({ error: 'Military base not found' });
    }

    const updated = militaryBaseDb.getById(id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating military base:', error);
    res.status(500).json({ error: 'Failed to update military base' });
  }
});

// Delete military base
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const changes = militaryBaseDb.delete(id);

    if (changes === 0) {
      return res.status(404).json({ error: 'Military base not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting military base:', error);
    res.status(500).json({ error: 'Failed to delete military base' });
  }
});

// Bulk import military bases from CSV
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const bases: MilitaryBase[] = req.body;

    // Geocode bases without coordinates
    const basesToGeocode = bases.filter(b => !b.latitude || !b.longitude);
    const basesWithCoords = bases.filter(b => b.latitude && b.longitude);

    let geocoded: MilitaryBase[] = [];
    if (basesToGeocode.length > 0) {
      console.log(`Geocoding ${basesToGeocode.length} military bases...`);
      geocoded = await geocodeBatch(basesToGeocode, (current, total) => {
        console.log(`Geocoded ${current}/${total} military bases`);
      });
    }

    const allBases = [...basesWithCoords, ...geocoded];
    const count = militaryBaseDb.bulkInsert(allBases);

    res.status(201).json({
      message: `Successfully imported ${count} military bases`,
      count
    });
  } catch (error) {
    console.error('Error bulk importing military bases:', error);
    res.status(500).json({ error: 'Failed to bulk import military bases' });
  }
});

export default router;
