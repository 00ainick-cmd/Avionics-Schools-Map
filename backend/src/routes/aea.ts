import { Router, Request, Response } from 'express';
import { aeaMemberDb } from '../services/database';
import { geocodeAddress, geocodeBatch } from '../services/geocoding';
import { AEAMember } from '../types';

const router = Router();

// Get all AEA members
router.get('/', (req: Request, res: Response) => {
  try {
    const members = aeaMemberDb.getAll();
    res.json(members);
  } catch (error) {
    console.error('Error fetching AEA members:', error);
    res.status(500).json({ error: 'Failed to fetch AEA members' });
  }
});

// Get AEA member by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const member = aeaMemberDb.getById(id);

    if (!member) {
      return res.status(404).json({ error: 'AEA member not found' });
    }

    res.json(member);
  } catch (error) {
    console.error('Error fetching AEA member:', error);
    res.status(500).json({ error: 'Failed to fetch AEA member' });
  }
});

// Create new AEA member
router.post('/', async (req: Request, res: Response) => {
  try {
    const member: AEAMember = req.body;

    // Geocode if coordinates not provided
    if (!member.latitude || !member.longitude) {
      const geocoded = await geocodeAddress(member.address, member.city, member.state, member.zipCode);
      if (geocoded) {
        member.latitude = geocoded.latitude;
        member.longitude = geocoded.longitude;
      }
    }

    const id = aeaMemberDb.create(member);
    const created = aeaMemberDb.getById(id as number);

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating AEA member:', error);
    res.status(500).json({ error: 'Failed to create AEA member' });
  }
});

// Update AEA member
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updates: Partial<AEAMember> = req.body;

    // If address changed and no new coordinates provided, geocode
    if ((updates.address || updates.city || updates.state || updates.zipCode) && !updates.latitude && !updates.longitude) {
      const existing = aeaMemberDb.getById(id);
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

    const changes = aeaMemberDb.update(id, updates);

    if (changes === 0) {
      return res.status(404).json({ error: 'AEA member not found' });
    }

    const updated = aeaMemberDb.getById(id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating AEA member:', error);
    res.status(500).json({ error: 'Failed to update AEA member' });
  }
});

// Delete AEA member
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const changes = aeaMemberDb.delete(id);

    if (changes === 0) {
      return res.status(404).json({ error: 'AEA member not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting AEA member:', error);
    res.status(500).json({ error: 'Failed to delete AEA member' });
  }
});

// Bulk import AEA members from CSV
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const members: AEAMember[] = req.body;

    // Geocode members without coordinates
    const membersToGeocode = members.filter(m => !m.latitude || !m.longitude);
    const membersWithCoords = members.filter(m => m.latitude && m.longitude);

    let geocoded: AEAMember[] = [];
    if (membersToGeocode.length > 0) {
      console.log(`Geocoding ${membersToGeocode.length} AEA members...`);
      geocoded = await geocodeBatch(membersToGeocode, (current, total) => {
        console.log(`Geocoded ${current}/${total} AEA members`);
      });
    }

    const allMembers = [...membersWithCoords, ...geocoded];
    const count = aeaMemberDb.bulkInsert(allMembers);

    res.status(201).json({
      message: `Successfully imported ${count} AEA members`,
      count
    });
  } catch (error) {
    console.error('Error bulk importing AEA members:', error);
    res.status(500).json({ error: 'Failed to bulk import AEA members' });
  }
});

export default router;
