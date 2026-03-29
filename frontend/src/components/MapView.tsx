import { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { School, MilitaryBase, AEAMember, EntityType } from '../types';

// Extended types with distance
interface SchoolWithDistance extends School {
  distance: number | null;
}

interface MilitaryBaseWithDistance extends MilitaryBase {
  distance: number | null;
}

interface AEAMemberWithDistance extends AEAMember {
  distance: number | null;
}

interface ReferencePoint {
  lat: number;
  lng: number;
  label: string;
}

interface Props {
  schools: SchoolWithDistance[];
  militaryBases: MilitaryBaseWithDistance[];
  aeaMembers: AEAMemberWithDistance[];
  filters: {
    entityTypes: EntityType[];
    schoolTypes: School['type'][];
    searchQuery: string;
  };
  referencePoint?: ReferencePoint | null;
}

// Custom marker icons
const createMarkerIcon = (color: string, symbol: string, hasHiringBadge = false) => {
  const badgeHtml = hasHiringBadge ? `
    <div style="
      position: absolute;
      top: -8px;
      right: -8px;
      background-color: #DC2626;
      color: white;
      font-size: 8px;
      font-weight: bold;
      padding: 2px 4px;
      border-radius: 4px;
      border: 1px solid white;
      white-space: nowrap;
    ">HIRING</div>
  ` : '';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative;">
        ${badgeHtml}
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
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Reference point marker (star icon)
const referencePointIcon = L.divIcon({
  className: 'reference-marker',
  html: `
    <div style="
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="#DC2626" stroke="white" stroke-width="1.5">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
      </svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

const schoolIcon = createMarkerIcon('#3B82F6', 'S');
const militaryIcon = createMarkerIcon('#EF4444', 'M');

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

// Format distance for display
const formatDistance = (distance: number | null): string => {
  if (distance === null) return '';
  if (distance < 1) return `${(distance * 5280).toFixed(0)} ft`;
  return `${distance.toFixed(1)} mi`;
};

// Generate request info email link
const generateEmailLink = (entity: School | MilitaryBase | AEAMember, type: 'school' | 'military' | 'aea') => {
  const subject = encodeURIComponent(`Information Request: ${entity.name}`);
  let body = '';

  if (type === 'school') {
    body = encodeURIComponent(`Dear ${entity.poc || 'Admissions Team'},\n\nI am interested in learning more about ${entity.name} and your aviation programs.\n\nPlease send me information about:\n- Program curriculum and duration\n- Enrollment requirements\n- Tuition and financial aid options\n- Job placement assistance\n\nThank you for your time.\n\nBest regards,\n[Your Name]\n[Your Contact Information]`);
  } else if (type === 'aea') {
    const member = entity as AEAMember;
    body = encodeURIComponent(`Dear ${entity.poc || 'Hiring Manager'},\n\nI am interested in ${member.hiringNow ? 'employment opportunities' : 'learning more about career opportunities'} at ${entity.name}.\n\nI would like to discuss:\n- Current or future job openings\n${member.offersInternships ? '- Internship programs\n' : ''}- Required qualifications and experience\n- Application process\n\nThank you for your time.\n\nBest regards,\n[Your Name]\n[Your Contact Information]`);
  } else {
    body = encodeURIComponent(`Dear ${entity.poc || 'Information Office'},\n\nI am interested in learning more about aviation opportunities at ${entity.name}.\n\nPlease send me information about available programs and resources.\n\nThank you for your time.\n\nBest regards,\n[Your Name]\n[Your Contact Information]`);
  }

  return `mailto:${entity.email}?subject=${subject}&body=${body}`;
};

// Component to handle map view changes
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  return null;
}

export default function MapView({ schools, militaryBases, aeaMembers, filters, referencePoint }: Props) {
  // Filter and prepare markers
  const markers = useMemo(() => {
    const result: Array<{
      id: string;
      lat: number;
      lng: number;
      type: EntityType;
      data: SchoolWithDistance | MilitaryBaseWithDistance | AEAMemberWithDistance;
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

  // Calculate center and zoom based on markers or reference point
  const { mapCenter, mapZoom } = useMemo(() => {
    // If reference point exists, center on it
    if (referencePoint) {
      return {
        mapCenter: [referencePoint.lat, referencePoint.lng] as [number, number],
        mapZoom: 8,
      };
    }

    // Otherwise, center on markers
    if (markers.length === 0) {
      return {
        mapCenter: [39.8283, -98.5795] as [number, number], // Center of USA
        mapZoom: 4,
      };
    }

    const avgLat = markers.reduce((sum, m) => sum + m.lat, 0) / markers.length;
    const avgLng = markers.reduce((sum, m) => sum + m.lng, 0) / markers.length;

    return {
      mapCenter: [avgLat, avgLng] as [number, number],
      mapZoom: 4,
    };
  }, [markers, referencePoint]);

  return (
    <div className="h-full w-full">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full rounded-lg shadow-md"
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Reference Point Marker */}
        {referencePoint && (
          <>
            <Marker
              position={[referencePoint.lat, referencePoint.lng]}
              icon={referencePointIcon}
              zIndexOffset={1000}
            >
              <Popup>
                <div className="p-2 text-center">
                  <p className="font-bold text-red-600">Your Location</p>
                  <p className="text-sm text-gray-600">{referencePoint.label}</p>
                </div>
              </Popup>
            </Marker>
            {/* Optional: show a circle for context */}
            <Circle
              center={[referencePoint.lat, referencePoint.lng]}
              radius={8047} // 5 miles in meters
              pathOptions={{
                color: '#DC2626',
                fillColor: '#DC2626',
                fillOpacity: 0.05,
                weight: 1,
                dashArray: '5, 5',
              }}
            />
          </>
        )}

        {markers.map(marker => {
          let icon = schoolIcon;
          let popupContent;

          if (marker.type === 'school') {
            const school = marker.data as SchoolWithDistance;
            icon = createMarkerIcon(getSchoolColor(school.type), 'S');
            popupContent = (
              <div className="p-2 min-w-[280px] max-w-[320px]">
                <h3 className="font-bold text-lg mb-2 text-gray-800">{school.name}</h3>
                {school.distance !== null && (
                  <span className="text-sm font-semibold text-blue-600 mb-2 bg-blue-50 px-2 py-1 rounded inline-block mr-2">
                    {formatDistance(school.distance)} away
                  </span>
                )}
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Type:</span> {school.type}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Address:</span><br />
                  {school.address}<br />
                  {school.city}, {school.state} {school.zipCode}
                </p>

                {/* HR Info Section */}
                <div className="bg-purple-50 rounded p-2 mb-2">
                  <p className="text-xs font-semibold text-purple-800 mb-1">Program Info</p>
                  {school.annualGraduates && (
                    <p className="text-xs text-gray-700">
                      <span className="font-medium">Annual Graduates:</span> {school.annualGraduates}
                    </p>
                  )}
                  {school.placementRate && (
                    <p className="text-xs text-gray-700">
                      <span className="font-medium">Placement Rate:</span> {school.placementRate}%
                    </p>
                  )}
                  {school.programSpecializations && (
                    <p className="text-xs text-gray-700">
                      <span className="font-medium">Programs:</span> {school.programSpecializations}
                    </p>
                  )}
                  {school.accreditation && (
                    <p className="text-xs text-gray-700">
                      <span className="font-medium">Accreditation:</span> {school.accreditation}
                    </p>
                  )}
                </div>

                {school.poc && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Contact:</span> {school.poc}
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

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3 pt-2 border-t border-gray-200">
                  {school.email && (
                    <a
                      href={generateEmailLink(school, 'school')}
                      className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                    >
                      Request Info
                    </a>
                  )}
                  {school.website && (
                    <a
                      href={school.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-3 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded hover:bg-gray-300"
                    >
                      Website
                    </a>
                  )}
                </div>
              </div>
            );
          } else if (marker.type === 'military') {
            const base = marker.data as MilitaryBaseWithDistance;
            icon = militaryIcon;
            popupContent = (
              <div className="p-2 min-w-[280px] max-w-[320px]">
                <h3 className="font-bold text-lg mb-2 text-gray-800">{base.name}</h3>
                {base.distance !== null && (
                  <span className="text-sm font-semibold text-red-600 mb-2 bg-red-50 px-2 py-1 rounded inline-block">
                    {formatDistance(base.distance)} away
                  </span>
                )}
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Branch:</span> {base.branch}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Address:</span><br />
                  {base.address}<br />
                  {base.city}, {base.state} {base.zipCode}
                </p>
                {base.hasAvionicsTechs && (
                  <p className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded inline-block mb-2">
                    Has Avionics Technicians
                  </p>
                )}
                {base.poc && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Contact:</span> {base.poc}
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

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3 pt-2 border-t border-gray-200">
                  {base.email && (
                    <a
                      href={generateEmailLink(base, 'military')}
                      className="flex-1 text-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700"
                    >
                      Request Info
                    </a>
                  )}
                  {base.website && (
                    <a
                      href={base.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-3 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded hover:bg-gray-300"
                    >
                      Website
                    </a>
                  )}
                </div>
              </div>
            );
          } else {
            const member = marker.data as AEAMemberWithDistance;
            icon = createMarkerIcon('#10B981', 'A', member.hiringNow);
            popupContent = (
              <div className="p-2 min-w-[280px] max-w-[320px]">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{member.name}</h3>
                  {member.hiringNow && (
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                      HIRING
                    </span>
                  )}
                </div>
                {member.distance !== null && (
                  <span className="text-sm font-semibold text-green-600 mb-2 bg-green-50 px-2 py-1 rounded inline-block">
                    {formatDistance(member.distance)} away
                  </span>
                )}
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Type:</span> {member.shopType}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Address:</span><br />
                  {member.address}<br />
                  {member.city}, {member.state} {member.zipCode}
                </p>

                {/* HR Info Section */}
                <div className="bg-green-50 rounded p-2 mb-2">
                  <p className="text-xs font-semibold text-green-800 mb-1">Company Info</p>
                  {member.employeeCount && (
                    <p className="text-xs text-gray-700">
                      <span className="font-medium">Employees:</span> {member.employeeCount.toLocaleString()}
                    </p>
                  )}
                  {member.offersInternships && (
                    <p className="text-xs text-blue-700">
                      Offers Internships
                    </p>
                  )}
                  {member.typicalPositions && (
                    <p className="text-xs text-gray-700">
                      <span className="font-medium">Positions:</span> {member.typicalPositions}
                    </p>
                  )}
                </div>

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
                {member.phone && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Phone:</span>{' '}
                    <a href={`tel:${member.phone}`} className="text-blue-600 hover:underline">
                      {member.phone}
                    </a>
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3 pt-2 border-t border-gray-200">
                  {member.email && (
                    <a
                      href={generateEmailLink(member, 'aea')}
                      className="flex-1 text-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700"
                    >
                      {member.hiringNow ? 'Apply Now' : 'Request Info'}
                    </a>
                  )}
                  {member.website && (
                    <a
                      href={member.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-3 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded hover:bg-gray-300"
                    >
                      Website
                    </a>
                  )}
                </div>
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
