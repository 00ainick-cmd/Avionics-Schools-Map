import Papa from 'papaparse';
import { School, MilitaryBase, AEAMember } from '../types';

export interface ParseResult<T> {
  data: T[];
  errors: string[];
  warnings: string[];
}

// Parse schools CSV
export function parseSchoolsCsv(file: File): Promise<ParseResult<School>> {
  return new Promise((resolve) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const schools: School[] = [];

        results.data.forEach((row: any, index: number) => {
          const rowNum = index + 2; // +2 because of 0-index and header row

          // Validate required fields
          if (!row.name) {
            errors.push(`Row ${rowNum}: Missing required field 'name'`);
            return;
          }
          if (!row.type) {
            errors.push(`Row ${rowNum}: Missing required field 'type'`);
            return;
          }
          if (!row.address || !row.city || !row.state || !row.zipCode) {
            errors.push(`Row ${rowNum}: Missing required address fields`);
            return;
          }

          // Validate school type
          const validTypes: School['type'][] = ['Part 147', 'Technical College', '4-Year Program', 'High School'];
          if (!validTypes.includes(row.type)) {
            errors.push(`Row ${rowNum}: Invalid school type '${row.type}'. Must be one of: ${validTypes.join(', ')}`);
            return;
          }

          schools.push({
            name: row.name.trim(),
            type: row.type as School['type'],
            address: row.address.trim(),
            city: row.city.trim(),
            state: row.state.trim(),
            zipCode: row.zipCode.trim(),
            latitude: row.latitude ? parseFloat(row.latitude) : undefined,
            longitude: row.longitude ? parseFloat(row.longitude) : undefined,
            email: row.email?.trim() || undefined,
            phone: row.phone?.trim() || undefined,
            poc: row.poc?.trim() || undefined,
            website: row.website?.trim() || undefined,
          });
        });

        if (schools.length === 0 && errors.length === 0) {
          errors.push('No valid data found in CSV file');
        }

        resolve({ data: schools, errors, warnings });
      },
      error: (error) => {
        errors.push(`Parse error: ${error.message}`);
        resolve({ data: [], errors, warnings });
      },
    });
  });
}

// Parse military bases CSV
export function parseMilitaryBasesCsv(file: File): Promise<ParseResult<MilitaryBase>> {
  return new Promise((resolve) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const bases: MilitaryBase[] = [];

        results.data.forEach((row: any, index: number) => {
          const rowNum = index + 2;

          if (!row.name) {
            errors.push(`Row ${rowNum}: Missing required field 'name'`);
            return;
          }
          if (!row.branch) {
            errors.push(`Row ${rowNum}: Missing required field 'branch'`);
            return;
          }
          if (!row.address || !row.city || !row.state || !row.zipCode) {
            errors.push(`Row ${rowNum}: Missing required address fields`);
            return;
          }

          const validBranches: MilitaryBase['branch'][] = ['Air Force', 'Navy', 'Army', 'Marines', 'Coast Guard', 'Space Force'];
          if (!validBranches.includes(row.branch)) {
            errors.push(`Row ${rowNum}: Invalid branch '${row.branch}'. Must be one of: ${validBranches.join(', ')}`);
            return;
          }

          bases.push({
            name: row.name.trim(),
            branch: row.branch as MilitaryBase['branch'],
            address: row.address.trim(),
            city: row.city.trim(),
            state: row.state.trim(),
            zipCode: row.zipCode.trim(),
            latitude: row.latitude ? parseFloat(row.latitude) : undefined,
            longitude: row.longitude ? parseFloat(row.longitude) : undefined,
            email: row.email?.trim() || undefined,
            phone: row.phone?.trim() || undefined,
            poc: row.poc?.trim() || undefined,
            website: row.website?.trim() || undefined,
            readinessCenterUrl: row.readinessCenterUrl?.trim() || row.readiness_center_url?.trim() || undefined,
            hasAvionicsTechs: row.hasAvionicsTechs === 'true' || row.has_avionics_techs === 'true' || row.hasAvionicsTechs === '1',
          });
        });

        if (bases.length === 0 && errors.length === 0) {
          errors.push('No valid data found in CSV file');
        }

        resolve({ data: bases, errors, warnings });
      },
      error: (error) => {
        errors.push(`Parse error: ${error.message}`);
        resolve({ data: [], errors, warnings });
      },
    });
  });
}

// Parse AEA members CSV
export function parseAEAMembersCsv(file: File): Promise<ParseResult<AEAMember>> {
  return new Promise((resolve) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const members: AEAMember[] = [];

        results.data.forEach((row: any, index: number) => {
          const rowNum = index + 2;

          if (!row.name) {
            errors.push(`Row ${rowNum}: Missing required field 'name'`);
            return;
          }
          if (!row.shopType) {
            errors.push(`Row ${rowNum}: Missing required field 'shopType'`);
            return;
          }
          if (!row.address || !row.city || !row.state || !row.zipCode) {
            errors.push(`Row ${rowNum}: Missing required address fields`);
            return;
          }

          const validShopTypes: AEAMember['shopType'][] = ['Repair Station', 'Airline', 'OEM', 'MRO', 'Other'];
          if (!validShopTypes.includes(row.shopType)) {
            errors.push(`Row ${rowNum}: Invalid shop type '${row.shopType}'. Must be one of: ${validShopTypes.join(', ')}`);
            return;
          }

          members.push({
            name: row.name.trim(),
            shopType: row.shopType as AEAMember['shopType'],
            address: row.address.trim(),
            city: row.city.trim(),
            state: row.state.trim(),
            zipCode: row.zipCode.trim(),
            latitude: row.latitude ? parseFloat(row.latitude) : undefined,
            longitude: row.longitude ? parseFloat(row.longitude) : undefined,
            email: row.email?.trim() || undefined,
            phone: row.phone?.trim() || undefined,
            poc: row.poc?.trim() || undefined,
            website: row.website?.trim() || undefined,
            certifications: row.certifications?.trim() || undefined,
          });
        });

        if (members.length === 0 && errors.length === 0) {
          errors.push('No valid data found in CSV file');
        }

        resolve({ data: members, errors, warnings });
      },
      error: (error) => {
        errors.push(`Parse error: ${error.message}`);
        resolve({ data: [], errors, warnings });
      },
    });
  });
}
