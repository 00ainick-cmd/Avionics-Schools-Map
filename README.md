# Avionics Schools & Facilities Map

An interactive web application for mapping and connecting aviation education institutions, military bases with avionics technicians, and AEA (Aircraft Electronics Association) member shops across the United States.

## Features

- **Interactive Map**: Built with React-Leaflet, displaying all entities with custom color-coded markers
- **CSV Upload**: Bulk import data for schools, military bases, and AEA members
- **Automatic Geocoding**: Converts addresses to GPS coordinates using Nominatim API (OpenStreetMap)
- **Advanced Filtering**: Filter by entity type, school type, and search by name/location
- **Detailed Information**: Click markers to view contact details, websites, and facility-specific information
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Full-Stack Solution**: React frontend with Node.js/Express backend and SQLite database

## Screenshots

![Map View](docs/map-view.png)
*Interactive map showing schools, military bases, and AEA members*

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- React-Leaflet (interactive maps)
- PapaParse (CSV parsing)
- Tailwind CSS (styling)
- Axios (HTTP client)

### Backend
- Node.js with Express
- TypeScript
- SQLite (database)
- Better-SQLite3 (database driver)
- Nominatim API (geocoding)

## Project Structure

```
Avionics-Schools-Map/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript type definitions
│   │   ├── utils/        # Utility functions
│   │   └── App.tsx       # Main application component
│   ├── public/           # Static assets
│   └── package.json
├── backend/              # Node.js backend API
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic & services
│   │   ├── types/        # TypeScript type definitions
│   │   └── index.ts      # Server entry point
│   ├── data/             # SQLite database storage
│   └── package.json
├── sample-data/          # Sample CSV files
│   ├── schools.csv
│   ├── military_bases.csv
│   └── aea_members.csv
└── .github/workflows/    # GitHub Actions for deployment
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Avionics-Schools-Map.git
   cd Avionics-Schools-Map
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

#### Development Mode

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The API will be available at `http://localhost:3001`

2. **Start the Frontend (in a new terminal)**
   ```bash
   cd frontend
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

#### Production Build

1. **Build the Backend**
   ```bash
   cd backend
   npm run build
   npm start
   ```

2. **Build the Frontend**
   ```bash
   cd frontend
   npm run build
   ```

## CSV File Formats

### Schools CSV Format

Required columns:
- `name` - School name
- `type` - One of: "Part 147", "Technical College", "4-Year Program", "High School"
- `address` - Street address
- `city` - City name
- `state` - State abbreviation (e.g., "CA", "TX")
- `zipCode` - ZIP code

Optional columns:
- `latitude` - GPS latitude (auto-geocoded if not provided)
- `longitude` - GPS longitude (auto-geocoded if not provided)
- `email` - Contact email
- `phone` - Contact phone number
- `poc` - Point of contact name
- `website` - Website URL

**Example:**
```csv
name,type,address,city,state,zipCode,email,phone,poc,website
Spartan College,Part 147,8820 E Pine St,Tulsa,OK,74115,admissions@spartan.edu,918-836-6886,John Doe,https://www.spartan.edu
```

### Military Bases CSV Format

Required columns:
- `name` - Base name
- `branch` - One of: "Air Force", "Navy", "Army", "Marines", "Coast Guard", "Space Force"
- `address` - Street address
- `city` - City name
- `state` - State abbreviation
- `zipCode` - ZIP code

Optional columns:
- `latitude` - GPS latitude
- `longitude` - GPS longitude
- `email` - Contact email
- `phone` - Contact phone number
- `poc` - Point of contact name
- `website` - Website URL
- `readinessCenterUrl` - Family readiness center URL
- `hasAvionicsTechs` - "true" or "false"

**Example:**
```csv
name,branch,address,city,state,zipCode,email,phone,poc,website,readinessCenterUrl,hasAvionicsTechs
Tinker AFB,Air Force,7437 Arnold St,Oklahoma City,OK,73145,info@tinker.af.mil,405-739-2011,Col. Smith,https://www.tinker.af.mil,https://www.tinker.af.mil/readiness,true
```

### AEA Members CSV Format

Required columns:
- `name` - Company/shop name
- `shopType` - One of: "Repair Station", "Airline", "OEM", "MRO", "Other"
- `address` - Street address
- `city` - City name
- `state` - State abbreviation
- `zipCode` - ZIP code

Optional columns:
- `latitude` - GPS latitude
- `longitude` - GPS longitude
- `email` - Contact email
- `phone` - Contact phone number
- `poc` - Point of contact name
- `website` - Website URL
- `certifications` - Certification numbers (e.g., CRS numbers)

**Example:**
```csv
name,shopType,address,city,state,zipCode,email,phone,poc,website,certifications
Duncan Aviation,MRO,3701 Aviation Rd,Lincoln,NE,68524,info@duncan.com,402-475-2611,Bob Duncan,https://duncan.com,CRS DKSR172D
```

## API Endpoints

### Schools
- `GET /api/schools` - Get all schools
- `GET /api/schools/:id` - Get school by ID
- `POST /api/schools` - Create a new school
- `PUT /api/schools/:id` - Update a school
- `DELETE /api/schools/:id` - Delete a school
- `POST /api/schools/bulk` - Bulk import schools from CSV

### Military Bases
- `GET /api/military` - Get all military bases
- `GET /api/military/:id` - Get military base by ID
- `POST /api/military` - Create a new military base
- `PUT /api/military/:id` - Update a military base
- `DELETE /api/military/:id` - Delete a military base
- `POST /api/military/bulk` - Bulk import military bases from CSV

### AEA Members
- `GET /api/aea` - Get all AEA members
- `GET /api/aea/:id` - Get AEA member by ID
- `POST /api/aea` - Create a new AEA member
- `PUT /api/aea/:id` - Update an AEA member
- `DELETE /api/aea/:id` - Delete an AEA member
- `POST /api/aea/bulk` - Bulk import AEA members from CSV

### Health Check
- `GET /api/health` - Server health check

## Deployment

### GitHub Pages (Frontend Only)

The frontend is configured to deploy to GitHub Pages automatically via GitHub Actions.

1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions"
3. Push to the `main` branch or any `claude/*` branch
4. The workflow will build and deploy automatically

**Note:** For production use, you'll need to deploy the backend separately (see Backend Deployment below).

### Backend Deployment

The backend can be deployed to various platforms:

#### Option 1: Railway
1. Create account at [Railway](https://railway.app)
2. Connect your GitHub repository
3. Deploy the `backend` folder
4. Set environment variable `NODE_ENV=production`

#### Option 2: Render
1. Create account at [Render](https://render.com)
2. Create a new Web Service
3. Connect your repository
4. Set build command: `cd backend && npm install && npm run build`
5. Set start command: `cd backend && npm start`

#### Option 3: DigitalOcean App Platform
1. Create account at [DigitalOcean](https://www.digitalocean.com)
2. Create a new App
3. Connect your GitHub repository
4. Configure the backend as a service

After deploying the backend, update the frontend's `VITE_API_URL` environment variable to point to your backend URL.

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

For production, set to your deployed backend URL:
```
VITE_API_URL=https://your-backend-url.com/api
```

### Backend (.env)
```
PORT=3001
NODE_ENV=development
```

## Usage Guide

1. **Upload CSV Data**
   - Click "Upload CSV" button in the header
   - Select data type (Schools, Military Bases, or AEA Members)
   - Choose your CSV file
   - Click "Upload CSV"
   - The system will automatically geocode addresses if coordinates aren't provided

2. **View Map**
   - Navigate the map by dragging
   - Zoom in/out using mouse wheel or map controls
   - Click markers to view detailed information

3. **Filter Data**
   - Use the sidebar to filter by entity type
   - Filter schools by type (Part 147, Technical College, etc.)
   - Search by name, city, or state

4. **View Details**
   - Click any marker to open a popup
   - View contact information, address, and links
   - Click email/phone to contact directly
   - Click website links to visit official sites

## Marker Color Legend

- **Purple** - Part 147 Schools
- **Blue** - Technical Colleges
- **Sky Blue** - 4-Year Programs
- **Cyan** - High Schools
- **Red** - Military Bases
- **Green** - AEA Members

## Geocoding

The application uses the Nominatim API (OpenStreetMap) for free geocoding. Please note:
- Rate limited to 1 request per second
- CSV uploads with many entries may take time to geocode
- You can pre-geocode your data and include latitude/longitude in CSV for faster imports

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: [your-email@example.com]

## Acknowledgments

- [React-Leaflet](https://react-leaflet.js.org/) for the mapping library
- [OpenStreetMap](https://www.openstreetmap.org/) for map tiles and geocoding
- [Aircraft Electronics Association (AEA)](https://www.aea.net/) for inspiration
- All contributors who help improve this project

## Roadmap

- [ ] Add export functionality (download map data as CSV/JSON)
- [ ] Implement user authentication for data management
- [ ] Add clustering for dense marker areas
- [ ] Distance calculation between entities
- [ ] Advanced analytics and reporting
- [ ] Mobile app version
- [ ] Integration with AEA member database API

---

Made with ❤️ for the Aviation Community
