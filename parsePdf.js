const fs = require('fs');
const pdf = require('pdf-parse');

const buffer = fs.readFileSync('./file.pdf'); // ganti nama file PDF kamu

pdf(buffer).then(data => {
  const lines = data.text.split('\n').map(x => x.trim()).filter(Boolean);

  const result = [];
  for (let i = 0; i < lines.length; i++) {
    if (/IMEI/i.test(lines[i])) {
      const imei = lines[i].split(':')[1].trim();
      const deskripsi = lines[i - 1];
      const nextLine = lines[i + 1]; // contoh: "AE 2.265.000"
      const [grade, ...hargaArr] = nextLine.split(' ');
      const harga = hargaArr.join('').replace(/\./g, ''); // jadi angka

      result.push({
        deskripsi,
        imei,
        grade,
        harga: parseInt(harga)
      });
    }
  }

  console.log(result);
});
