import React, { useState } from 'react';
import { parseSchoolsCsv, parseMilitaryBasesCsv, parseAEAMembersCsv } from '../utils/csvParser';
import { schoolsApi, militaryApi, aeaApi } from '../services/api';

type UploadType = 'schools' | 'military' | 'aea';

interface Props {
  onUploadSuccess: () => void;
}

export default function CSVUploader({ onUploadSuccess }: Props) {
  const [uploadType, setUploadType] = useState<UploadType>('schools');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
      setParseErrors([]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setParseErrors([]);

    try {
      let result;
      let uploadPromise;

      switch (uploadType) {
        case 'schools':
          result = await parseSchoolsCsv(file);
          if (result.errors.length > 0) {
            setParseErrors(result.errors);
            setError('Failed to parse CSV. Please check the errors below.');
            return;
          }
          uploadPromise = schoolsApi.bulkImport(result.data);
          break;

        case 'military':
          result = await parseMilitaryBasesCsv(file);
          if (result.errors.length > 0) {
            setParseErrors(result.errors);
            setError('Failed to parse CSV. Please check the errors below.');
            return;
          }
          uploadPromise = militaryApi.bulkImport(result.data);
          break;

        case 'aea':
          result = await parseAEAMembersCsv(file);
          if (result.errors.length > 0) {
            setParseErrors(result.errors);
            setError('Failed to parse CSV. Please check the errors below.');
            return;
          }
          uploadPromise = aeaApi.bulkImport(result.data);
          break;
      }

      const response = await uploadPromise;
      setSuccess(response.message);
      setFile(null);

      // Reset file input
      const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Notify parent to refresh data
      onUploadSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to upload CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Upload CSV Data</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data Type
        </label>
        <select
          value={uploadType}
          onChange={(e) => setUploadType(e.target.value as UploadType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="schools">Schools</option>
          <option value="military">Military Bases</option>
          <option value="aea">AEA Members</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CSV File
        </label>
        <input
          id="csv-file-input"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {file && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className={`w-full py-2 px-4 rounded-md font-medium ${
          !file || loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {loading ? 'Uploading...' : 'Upload CSV'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {parseErrors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded">
          <p className="font-medium text-red-800 mb-2">Parse Errors:</p>
          <ul className="list-disc list-inside text-sm text-red-700 max-h-40 overflow-y-auto">
            {parseErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm font-medium text-blue-900 mb-2">CSV Format Requirements:</p>
        <ul className="text-xs text-blue-800 space-y-1">
          {uploadType === 'schools' && (
            <>
              <li>Required: name, type, address, city, state, zipCode</li>
              <li>Optional: latitude, longitude, email, phone, poc, website</li>
              <li>Valid types: Part 147, Technical College, 4-Year Program, High School</li>
            </>
          )}
          {uploadType === 'military' && (
            <>
              <li>Required: name, branch, address, city, state, zipCode</li>
              <li>Optional: latitude, longitude, email, phone, poc, website, readinessCenterUrl, hasAvionicsTechs</li>
              <li>Valid branches: Air Force, Navy, Army, Marines, Coast Guard, Space Force</li>
            </>
          )}
          {uploadType === 'aea' && (
            <>
              <li>Required: name, shopType, address, city, state, zipCode</li>
              <li>Optional: latitude, longitude, email, phone, poc, website, certifications</li>
              <li>Valid shop types: Repair Station, Airline, OEM, MRO, Other</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
