import { useRef } from 'react';
import * as XLSX from 'xlsx';
import type { BracketState, PotId, Team } from '../types';

interface ExcelUploadProps {
  onDataLoaded: (state: BracketState) => void;
}

function ExcelUpload({ onDataLoaded }: ExcelUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPotId = (no: number): PotId => {
    if (no >= 1 && no <= 6) return 'pot1';
    if (no >= 7 && no <= 12) return 'pot2';
    if (no >= 13 && no <= 18) return 'pot3';
    return 'pot1'; // default fallback
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Read as array of arrays (no headers assumed)
        const rawData = XLSX.utils.sheet_to_json<any[]>(worksheet, {
          header: 1,
          defval: '',
          raw: false
        });

        console.log('Parsed Excel data:', rawData);

        if (rawData.length === 0) {
          alert('The Excel file is empty. Please add data.');
          return;
        }

        // Organize teams by pot
        const potData: Record<PotId, Team[]> = {
          pot1: [],
          pot2: [],
          pot3: [],
        };

        rawData.forEach((row, index) => {
          // Skip empty rows
          if (!row || row.length < 2) {
            return;
          }

          const noValue = row[0]; // First column is 'no'
          const teamValue = row[1]; // Second column is 'college name'

          // Skip empty rows
          if (!teamValue || teamValue.toString().trim() === '') {
            return;
          }

          // Parse the number
          let no: number;
          if (typeof noValue === 'number') {
            no = noValue;
          } else {
            no = parseInt(String(noValue).trim());
          }

          if (isNaN(no)) {
            console.warn(`Skipping row ${index + 1}: invalid number "${noValue}"`);
            return;
          }

          const potId = getPotId(no);
          const team: Team = {
            id: `${potId}-${potData[potId].length}`,
            name: String(teamValue).trim(),
            potId,
          };
          potData[potId].push(team);
        });

        // Validate that we have some teams
        const totalTeams = potData.pot1.length + potData.pot2.length + potData.pot3.length;
        if (totalTeams === 0) {
          alert('No valid teams found in the Excel file. Please check your data.');
          return;
        }

        // Create bracket state
        const bracketState: BracketState = {
          pots: potData,
          groups: {
            A: [],
            B: [],
            C: [],
            D: [],
            E: [],
            F: [],
          },
        };

        console.log('Created bracket state:', bracketState);

        // Save to localStorage
        localStorage.setItem('bracketState', JSON.stringify(bracketState));

        // Notify parent component
        onDataLoaded(bracketState);

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        alert(`Successfully loaded ${totalTeams} teams!\nPot 1: ${potData.pot1.length} teams\nPot 2: ${potData.pot2.length} teams\nPot 3: ${potData.pot3.length} teams`);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert(`Error parsing Excel file: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease ensure it has team numbers and names.`);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <label
        htmlFor="excel-upload"
        className="inline-block px-5 py-2.5 bg-[#6366F1] text-white rounded hover:bg-[#4F46E5] transition-colors duration-200 shadow font-semibold uppercase text-sm tracking-wide cursor-pointer"
      >
        Upload Excel
      </label>
      <input
        id="excel-upload"
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="hidden"
      />
    </>
  );
}

export default ExcelUpload;
