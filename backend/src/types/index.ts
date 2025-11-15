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
  createdAt?: string;
  updatedAt?: string;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  display_name?: string;
}

export interface MapEntity {
  id: number;
  name: string;
  type: 'school' | 'military' | 'aea';
  latitude: number;
  longitude: number;
  details: School | MilitaryBase | AEAMember;
}
