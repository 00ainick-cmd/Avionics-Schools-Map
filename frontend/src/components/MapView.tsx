import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { School, MilitaryBase, AEAMember, EntityType } from '../types';

interface Props {
  schools: School[];
  militaryBases: MilitaryBase[];
  aeaMembers: AEAMember[];
  filters: {
    entityTypes: EntityType[];
    schoolTypes: School['type'][];
    searchQuery: string;
  };
}

// Custom marker icons
const createMarkerIcon = (color: string, symbol: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 16px;
        ">${symbol}</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const schoolIcon = createMarkerIcon('#3B82F6', 'S');
const militaryIcon = createMarkerIcon('#EF4444', 'M');
const aeaIcon = createMarkerIcon('#10B981', 'A');

// Get school type color
const getSchoolColor = (type: School['type']) => {
  switch (type) {
    case 'Part 147': return '#9333EA';
    case 'Technical College': return '#3B82F6';
    case '4-Year Program': return '#0EA5E9';
    case 'High School': return '#06B6D4';
    default: return '#6B7280';
  }
};

export default function MapView({ schools, militaryBases, aeaMembers, filters }: Props) {
  // Filter and prepare markers
  const markers = useMemo(() => {
    const result: Array<{
      id: string;
      lat: number;
      lng: number;
      type: EntityType;
      data: School | MilitaryBase | AEAMember;
    }> = [];

    // Filter schools
    if (filters.entityTypes.includes('school')) {
      schools
        .filter(s => s.latitude && s.longitude)
        .filter(s => filters.schoolTypes.length === 0 || filters.schoolTypes.includes(s.type))
        .filter(s => !filters.searchQuery ||
          s.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          s.city.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          s.state.toLowerCase().includes(filters.searchQuery.toLowerCase())
        )
        .forEach(s => {
          result.push({
            id: `school-${s.id}`,
            lat: s.latitude!,
            lng: s.longitude!,
            type: 'school',
            data: s,
          });
        });
    }

    // Filter military bases
    if (filters.entityTypes.includes('military')) {
      militaryBases
        .filter(b => b.latitude && b.longitude)
        .filter(b => !filters.searchQuery ||
          b.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          b.city.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          b.state.toLowerCase().includes(filters.searchQuery.toLowerCase())
        )
        .forEach(b => {
          result.push({
            id: `military-${b.id}`,
            lat: b.latitude!,
            lng: b.longitude!,
            type: 'military',
            data: b,
          });
        });
    }

    // Filter AEA members
    if (filters.entityTypes.includes('aea')) {
      aeaMembers
        .filter(a => a.latitude && a.longitude)
        .filter(a => !filters.searchQuery ||
          a.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          a.city.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          a.state.toLowerCase().includes(filters.searchQuery.toLowerCase())
        )
        .forEach(a => {
          result.push({
            id: `aea-${a.id}`,
            lat: a.latitude!,
            lng: a.longitude!,
            type: 'aea',
            data: a,
          });
        });
    }

    return result;
  }, [schools, militaryBases, aeaMembers, filters]);

  // Calculate center and zoom based on markers
  const mapCenter: [number, number] = useMemo(() => {
    if (markers.length === 0) return [39.8283, -98.5795]; // Center of USA

    const avgLat = markers.reduce((sum, m) => sum + m.lat, 0) / markers.length;
    const avgLng = markers.reduce((sum, m) => sum + m.lng, 0) / markers.length;

    return [avgLat, avgLng];
  }, [markers]);

  return (
    <div className="h-full w-full">
      <MapContainer
        center={mapCenter}
        zoom={4}
        className="h-full w-full rounded-lg shadow-md"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map(marker => {
          let icon = schoolIcon;
          let popupContent;

          if (marker.type === 'school') {
            const school = marker.data as School;
            icon = createMarkerIcon(getSchoolColor(school.type), 'S');
            popupContent = (
              <div className="p-2 min-w-[250px]">
                <h3 className="font-bold text-lg mb-2 text-gray-800">{school.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Type:</span> {school.type}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Address:</span><br />
                  {school.address}<br />
                  {school.city}, {school.state} {school.zipCode}
                </p>
                {school.poc && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Contact:</span> {school.poc}
                  </p>
                )}
                {school.email && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Email:</span>{' '}
                    <a href={`mailto:${school.email}`} className="text-blue-600 hover:underline">
                      {school.email}
                    </a>
                  </p>
                )}
                {school.phone && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Phone:</span>{' '}
                    <a href={`tel:${school.phone}`} className="text-blue-600 hover:underline">
                      {school.phone}
                    </a>
                  </p>
                )}
                {school.website && (
                  <p className="text-sm text-gray-600 mb-1">
                    <a
                      href={school.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  </p>
                )}
              </div>
            );
          } else if (marker.type === 'military') {
            const base = marker.data as MilitaryBase;
            icon = militaryIcon;
            popupContent = (
              <div className="p-2 min-w-[250px]">
                <h3 className="font-bold text-lg mb-2 text-gray-800">{base.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Branch:</span> {base.branch}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Address:</span><br />
                  {base.address}<br />
                  {base.city}, {base.state} {base.zipCode}
                </p>
                {base.poc && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Contact:</span> {base.poc}
                  </p>
                )}
                {base.email && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Email:</span>{' '}
                    <a href={`mailto:${base.email}`} className="text-blue-600 hover:underline">
                      {base.email}
                    </a>
                  </p>
                )}
                {base.phone && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Phone:</span>{' '}
                    <a href={`tel:${base.phone}`} className="text-blue-600 hover:underline">
                      {base.phone}
                    </a>
                  </p>
                )}
                {base.website && (
                  <p className="text-sm text-gray-600 mb-1">
                    <a
                      href={base.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  </p>
                )}
                {base.readinessCenterUrl && (
                  <p className="text-sm text-gray-600 mb-1">
                    <a
                      href={base.readinessCenterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Family Readiness Center
                    </a>
                  </p>
                )}
              </div>
            );
          } else {
            const member = marker.data as AEAMember;
            icon = aeaIcon;
            popupContent = (
              <div className="p-2 min-w-[250px]">
                <h3 className="font-bold text-lg mb-2 text-gray-800">{member.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Type:</span> {member.shopType}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Address:</span><br />
                  {member.address}<br />
                  {member.city}, {member.state} {member.zipCode}
                </p>
                {member.certifications && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Certifications:</span> {member.certifications}
                  </p>
                )}
                {member.poc && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Contact:</span> {member.poc}
                  </p>
                )}
                {member.email && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Email:</span>{' '}
                    <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">
                      {member.email}
                    </a>
                  </p>
                )}
                {member.phone && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Phone:</span>{' '}
                    <a href={`tel:${member.phone}`} className="text-blue-600 hover:underline">
                      {member.phone}
                    </a>
                  </p>
                )}
                {member.website && (
                  <p className="text-sm text-gray-600 mb-1">
                    <a
                      href={member.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  </p>
                )}
              </div>
            );
          }

          return (
            <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={icon}>
              <Popup maxWidth={350}>{popupContent}</Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
