export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactNumber(amount: number): string {
  if (amount >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(1) + ' Miliar';
  }
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1) + ' Juta';
  }
  if (amount >= 1_000) {
    return (amount / 1_000).toFixed(0) + ' Ribu';
  }
  return amount.toString();
}

export function generateICS(event: {
  title: string;
  description: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  time: string; // HH:MM
}): string {
  const cleanDate = event.startDate.replace(/-/g, '');
  const startStamp = `${cleanDate}T090000Z`;
  const endStamp = `${cleanDate}T120000Z`;

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//GRIK Kaffah Community//ID
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.location}
DTSTART:${startStamp}
DTEND:${endStamp}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
}

export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((item) =>
    headers
      .map((header) => {
        const val = item[header];
        if (typeof val === 'object' && val !== null) {
          return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        }
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

export function exportToJSON(data: any, filename: string) {
  const jsonString = JSON.stringify(data, null, 2);
  downloadFile(jsonString, filename, 'application/json;charset=utf-8;');
}

// Simple simulation of secure End-to-End Encryption
export function simulateE2EEncrypt(text: string, key = 'GRIK_KAFFAR_SECRET_KEY'): { ciphertext: string; iv: string; hash: string } {
  let cipher = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    cipher += charCode.toString(16).padStart(2, '0');
  }
  const iv = Math.random().toString(36).substring(2, 10);
  const hash = '0x' + Array.from(text).reduce((acc, c) => acc + c.charCodeAt(0), 0).toString(16).padStart(16, '0');
  return {
    ciphertext: 'E2EE:' + btoa(cipher),
    iv,
    hash,
  };
}

export function simulateE2EDecrypt(ciphertext: string, key = 'GRIK_KAFFAR_SECRET_KEY'): string {
  if (!ciphertext.startsWith('E2EE:')) return ciphertext;
  try {
    const raw = atob(ciphertext.replace('E2EE:', ''));
    let result = '';
    for (let i = 0; i < raw.length; i += 2) {
      const hex = raw.substring(i, i + 2);
      const code = parseInt(hex, 16) ^ key.charCodeAt((i / 2) % key.length);
      result += String.fromCharCode(code);
    }
    return result;
  } catch (e) {
    return '[Teks Terenkripsi Aman E2EE]';
  }
}
