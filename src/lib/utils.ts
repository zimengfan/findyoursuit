import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as XLSX from 'xlsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function updateUserExcel({ email, password, plan, monthlyUsage, analytics }: {
  email: string;
  password: string;
  plan: string;
  monthlyUsage: number;
  analytics: string;
}) {
  const fileName = 'user_usage.xlsx';
  let workbook;
  let worksheet;
  try {
    workbook = XLSX.readFile(fileName);
    worksheet = workbook.Sheets[workbook.SheetNames[0]];
  } catch (e) {
    workbook = XLSX.utils.book_new();
    worksheet = XLSX.utils.aoa_to_sheet([
      ['Email', 'Password', 'Plan', 'Monthly Usage', 'Analytics']
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
  }
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  let found = false;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      data[i][1] = password;
      data[i][2] = plan;
      data[i][3] = monthlyUsage;
      data[i][4] = analytics;
      found = true;
      break;
    }
  }
  if (!found) {
    data.push([email, password, plan, monthlyUsage, analytics]);
  }
  const newSheet = XLSX.utils.aoa_to_sheet(data);
  workbook.Sheets[workbook.SheetNames[0]] = newSheet;
  XLSX.writeFile(workbook, fileName);
}
