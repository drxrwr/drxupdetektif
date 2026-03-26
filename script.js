// FORMAT NOMOR
function formatPhoneNumber(input) {
  let number = input.trim();

  // Hapus selain angka dan +
  number = number.replace(/[^0-9+]/g, '');

  // 0 ➜ +62
  if (number.startsWith('0')) {
    number = '+62' + number.slice(1);
  }

  // Tambah + kalau belum ada
  if (!number.startsWith('+')) {
    number = '+' + number;
  }

  // Validasi min 10 digit
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
  let index = 1;

  let adminVcf = '';
  let anggotaVcf = '';

  lines.forEach(line => {
    let l = line.trim().toLowerCase();

    // DETEKSI KATEGORI
    if (l === 'admin') {
      current = adminName;
      index = 1;
      return;
    }
    if (l === 'navy') {
      current = navyName;
      index = 1;
      return;
    }
    if (l === 'anggota') {
      current = anggotaName;
      index = 1;
      return;
    }

    if (!line.trim()) return;

    let phone = formatPhoneNumber(line);
    if (!phone) return; // skip invalid

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

    index++;
  });

  // DOWNLOAD
  if (mode === 'pisah') {

    if (adminVcf) {
      download(adminVcf, filename + '_admin.vcf');
    }

    if (anggotaVcf) {
      download(anggotaVcf, filename + '.vcf');
    }

  } else {
    download(adminVcf + anggotaVcf, filename + '.vcf');
  }
}

// DOWNLOAD FUNCTION
function download(content, filename) {
  const blob = new Blob([content], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
