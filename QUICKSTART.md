# Quick Start Guide

Get your Avionics Schools Map up and running in 3 simple steps!

## Step 1: Install Dependencies

```bash
cd backend
npm install
cd ../frontend
npm install
```

## Step 2: Load Sample Data

This will automatically populate the database with 40 sample locations (schools, military bases, and AEA members):

```bash
cd backend
npm run load-sample-data
```

You'll see progress like this:
```
🚀 Starting sample data import...

📊 Initializing database...
✅ Database initialized

🏫 Loading schools...
   Found 15 schools in CSV
   Geocoding schools (this may take a minute)...
   Geocoded 15/15 schools...
✅ Imported 15 schools

🪖 Loading military bases...
...
```

**⏱️ This takes about 45-60 seconds** (geocoding 40 addresses at 1 request/second)

## Step 3: Start the Application

Open TWO terminal windows:

### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```

Wait for:
```
╔═══════════════════════════════════════════════════════╗
║  Avionics Schools Map API Server                     ║
║  Port: 3001                                           ║
╚═══════════════════════════════════════════════════════╝
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
```

Wait for:
```
  VITE ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

## Step 4: View the Map! 🎉

Open your browser to: **http://localhost:5173/**

You should see:
- Interactive map with 40 markers across the USA
- 🟣 Purple/Blue markers = Schools
- 🔴 Red markers = Military Bases
- 🟢 Green markers = AEA Members

### What You Can Do:

**Explore the Map:**
- Drag to pan around
- Scroll to zoom in/out
- Click markers to see details

**Filter Data:**
- Use the left sidebar to toggle entity types
- Filter schools by type (Part 147, Technical College, etc.)
- Search by name, city, or state

**Upload More Data:**
- Click "Upload CSV" button
- Choose your CSV file
- System will auto-geocode addresses

---

## Troubleshooting

### "No Data Available" on the map?
Make sure you ran `npm run load-sample-data` first!

### Backend won't start?
- Check port 3001 isn't already in use
- Make sure you're in the `/backend` directory
- Try: `rm -rf node_modules && npm install`

### Frontend won't start?
- Check port 5173 isn't already in use
- Make sure you're in the `/frontend` directory
- Try: `rm -rf node_modules && npm install`

### Markers not showing?
- Check browser console (F12) for errors
- Make sure backend is running on port 3001
- Verify data was loaded (check backend/data/ for .db file)

---

## Next Steps

1. **Upload Your Own Data**: Prepare CSV files using the format in `sample-data/` as templates
2. **Customize**: Edit colors, markers, or add new features
3. **Deploy**: Follow the main README.md for deployment instructions

---

Need help? Check the full [README.md](README.md) for detailed documentation.
