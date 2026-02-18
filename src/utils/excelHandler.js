import * as XLSX from 'xlsx';

// Columns expected in the import file
const EXPECTED_COLUMNS = [
    'Ushbu qatorni o\'chirmang', // Placeholder for "Do not delete this row" or ID
    'Tartib raqam',
    'Familiya Ism',
    'Tabel raqam',
    'Seh raqami',
    'Razryadi'
];

/**
 * Generates and downloads an Excel template for adding employees.
 */
export const downloadTemplate = () => {
    const headers = [
        ['Tartib raqam', 'Familiya Ism', 'Tabel raqam', 'Seh raqami', 'Razryadi'],
        ['1', 'Aliyev Vali', '1234', '1', '3-toifa'] // Example row
    ];

    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Namuna");
    XLSX.writeFile(wb, "Xodimlar_Namuna.xlsx");
};

/**
 * Parses an uploaded Excel file and returns a list of employees.
 * @param {File} file - The uploaded Excel file.
 * @returns {Promise<Array>} - A promise that resolves to an array of employee objects.
 */
export const parseEmployees = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                // Remove header row and filter empty rows
                const rows = jsonData.slice(1).filter(row => row.length > 0);

                const employees = rows.map((row, index) => {
                    // Map columns based on index (assuming fixed order as per template)
                    // 0: Tartib raqam, 1: Familiya Ism, 2: Tabel raqam, 3: Seh raqami, 4: Razryadi

                    // Basic validation: Ensure minimal required fields are present
                    if (!row[1]) return null; // Name is required

                    return {
                        id: Date.now() + index, // Temporary ID generation
                        name: row[1],
                        tabelId: row[2],
                        sex: row[3] ? `${row[3]}-Sex` : 'Aniqlanmagan', // Format as "1-Sex"
                        razryad: row[4],
                        // Default values for other fields
                        lavozim: 'Ishchi',
                        phone: '',
                        joined: new Date().toISOString().split('T')[0],
                        status: 'Active',
                        lastExamDate: '-',
                        lastExamGrade: '-'
                    };
                }).filter(Boolean); // Remove nulls

                resolve(employees);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);

        reader.readAsArrayBuffer(file);
    });
};

/**
 * Exports data to an Excel file.
 * @param {Array<Object>} data - The data to export.
 * @param {string} fileName - The name of the file to save.
 * @param {string} sheetName - The name of the worksheet.
 */
export const exportToExcel = (data, fileName, sheetName = 'Sheet1') => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
};
