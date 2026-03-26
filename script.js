// FORMAT NOMOR
function formatPhoneNumber(input) {
  let number = input.trim();

  number = number.replace(/[^0-9+]/g, '');

  if (number.startsWith('0')) {
    number = '+62' + number.slice(1);
  }

  if (!number.startsWith('+')) {
    number = '+' + number;
  }

  const digits = number.replace(/\D/g, '');
  if (digits.length < 10) return null;

  return number;
}

// LOAD FILE TXT
document.getElementById('fileInput').addEventListener('change', function(e) {
  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('text').value = e.target.result;
  };
  reader.readAsText(e.target.files[0]);
});

// CONVERT
function convert() {
  const text = document.getElementById('text').value.trim();
  const extra = document.getElementById('extraNumbers').value.trim();

  const adminName = document.getElementById('adminName').value || 'ADMIN';
  const navyName = document.getElementById('navyName').value || 'NAVY';
  const anggotaName = document.getElementById('anggotaName').value || 'ANGGOTA';
  const filename = document.getElementById('filename').value || 'kontak';
  const mode = document.getElementById('mode').value;

  if (!text) {
    alert('Isi dulu datanya!');
    return;
  }

  const lines = text.split('\n');

  let current = anggotaName;

  let adminIndex = 1;
  let navyIndex = 1;
  let anggotaIndex = 1;

  let adminVcf = '';
  let anggotaVcf = '';

  let hasNavy = false;

  function processLine(line) {
    let l = line.trim().toLowerCase();

    if (l === 'admin') {
      current = adminName;
      return;
    }
    if (l === 'navy') {
      current = navyName;
      hasNavy = true;
      return;
    }
    if (l === 'anggota') {
      current = anggotaName;
      return;
    }

    if (!line.trim()) return;

    let phone = formatPhoneNumber(line);
    if (!phone) return;

    let index;

    if (current === adminName) {
      index = adminIndex++;
    } else if (current === navyName) {
      index = navyIndex++;
    } else {
      index = anggotaIndex++;
    }

    const vcf =
`BEGIN:VCARD
VERSION:3.0
FN:${current} ${index}
TEL:${phone}
END:VCARD

`;

    if (current === adminName || current === navyName) {
      adminVcf += vcf;
    } else {
      anggotaVcf += vcf;
    }
  }

  // DATA UTAMA
  lines.forEach(processLine);

  // DATA TAMBAHAN (lanjut index, bukan reset)
  if (extra) {
    const extraLines = extra.split('\n');
    extraLines.forEach(processLine);
  }

  // NAMA FILE BARU
  let adminFileName = '';
  if (hasNavy) {
    adminFileName = `ADMIN NAVY ${filename}.vcf`;
  } else {
    adminFileName = `ADMIN ${filename}.vcf`;
  }

  // DOWNLOAD
  if (mode === 'pisah') {

    if (adminVcf) {
      download(adminVcf, adminFileName);
    }

    if (anggotaVcf) {
      download(anggotaVcf, filename + '.vcf');
    }

  } else {
    download(adminVcf + anggotaVcf, filename + '.vcf');
  }
}

// DOWNLOAD
function download(content, filename) {
  const blob = new Blob([content], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
