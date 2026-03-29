export interface School {
  id?: number;
  name: string;
  type: 'Part 147' | 'Technical College' | '4-Year Program' | 'High School';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  email?: string;
  phone?: string;
  poc?: string;
  website?: string;
  // HR fields
  annualGraduates?: number;
  programSpecializations?: string;
  placementRate?: number;
  accreditation?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MilitaryBase {
  id?: number;
  name: string;
  branch: 'Air Force' | 'Navy' | 'Army' | 'Marines' | 'Coast Guard' | 'Space Force';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  email?: string;
  phone?: string;
  poc?: string;
  website?: string;
  readinessCenterUrl?: string;
  hasAvionicsTechs: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AEAMember {
  id?: number;
  name: string;
  shopType: 'Repair Station' | 'Airline' | 'OEM' | 'MRO' | 'Other';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  email?: string;
  phone?: string;
  poc?: string;
  website?: string;
  certifications?: string;
  // HR fields
  employeeCount?: number;
  hiringNow?: boolean;
  offersInternships?: boolean;
  typicalPositions?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type EntityType = 'school' | 'military' | 'aea';

export interface MapEntity {
  id: number;
  name: string;
  type: EntityType;
  latitude: number;
  longitude: number;
  details: School | MilitaryBase | AEAMember;
}

export interface FilterState {
  entityTypes: EntityType[];
  schoolTypes: School['type'][];
  searchQuery: string;
}
