# Tugas Sistem Kehadiran Online
## Kelompok 9

Anggota:
  - Arya Wiranata (05111540000163)
  - Ichsan Sandi Darmawan (05111540000167)
  - Moh. Adam Alfian (05111540007005)

## Prerequisites
Library yang digunakan pada tugas ini yakni:
  - [Express](https://www.npmjs.com/package/express)
  - [Mongoose](https://www.npmjs.com/package/mongoose) (menggunakan database MongoDB)
  - [Express Handlebars](https://www.npmjs.com/package/express-handlebars)

## How to Run
1. Jalankan server mongodb (jika tidak ada silahkan lakukan instalasi terlebih dahulu)
2. Setelah clone repo jalankan `npm install` untuk instalasi *packages* yang sudah disediakan
3. Jalankan `node app.js` atau `nodemon app.js` untuk mengeksekusi project dan buka [localhost:3000](http://localhost:3000)

## Endpoint List
1. POST `/tambahmahasiswa` untuk menambah mahasiswa
- *Send via body:* **String:** ***name***, **Number:** ***noInduk***, **String:** ***password***
2. POST `/tambahjadwal` untuk menambah jadwal kelas
- *Send via body:* **String:** ***idMatkul***, **Number:** ***pertemuanKe***, **String:** ***ruang***, **Date (YYYY-MM-DDThh:mm:ss):** ***jamMasuk***, **Date (YYYY-MM-DDThh:mm:ss):** ***jamSelesai***, **String:** ***tahunAjaran***, **String:** ***semester***
3. POST `/tambahmatkul` untuk menambah mata kuliah
- *Send via body: * **String:** ***matkulID***, **String:** ***name***, **String:** ***kelas***
4. POST `/tambahpeserta/:mataKuliahId/:userId` untuk menambah mahasiswa ke matakuliah tertentu
5. POST `/absen/:ruang/:nrp` untuk melakukan absen
6. GET `rekap/:idmatkul/semester/:idsemester` untuk melihat rekap kuliah per semester
7. GET `rekap/:idmatkul/pertemuan/:pertemuanke` untuk melihat rekap kuliah tiap pertemuan
8. GET `rekapmahasiswa/:nrp/semester/:idsemester` untuk melihat rekap mahasiswa per semester
9. GET `rekapmahasiswa/:nrp/matkul/:idmatkul` untuk melihat rekap mahasiswa tiap mata kuliah