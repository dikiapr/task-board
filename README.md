# Task Board

Aplikasi manajemen tugas bergaya kanban yang dibangun dengan **Ionic React + TypeScript**, dibuat untuk Take Home Test Frontend Adhivasindo. Semua data disimpan di perangkat (tanpa backend).

Semua fitur wajib dan bonus pada soal sudah diimplementasikan. Di luar fitur, proyek ini dikerjakan dengan standar yang sama seperti kode produksi: **struktur yang jelas, mudah dirawat, mudah dikembangkan, dan diuji secara menyeluruh**.

| Indikator kualitas | Hasil |
| --- | --- |
| Unit & integration test | **179 test** di 24 file, semuanya lulus |
| Code coverage (lines) | **96,67%** |
| Code coverage (statements / functions / branches) | 95,13% / 94,57% / 88,57% |
| TypeScript | `strict: true`, tanpa `any`, `@ts-ignore`, atau `eslint-disable` di kode aplikasi |
| ESLint | 0 error, 0 warning |

---

## Menjalankan proyek

Prasyarat: Node.js 20.19+ atau 22.12+ (kebutuhan Vite 8).

```bash
npm install
npm run dev            # http://localhost:5173
# atau, jika Ionic CLI sudah terpasang (npm install -g @ionic/cli):
ionic serve            # http://localhost:8100
```

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan development server |
| `npm run build` | Type-check lalu build produksi ke `dist/` |
| `npm run preview` | Menjalankan hasil build |
| `npm run test.unit` | Menjalankan test dalam watch mode |
| `npm run test.coverage` | Menjalankan semua test dan membuat laporan coverage (`coverage/index.html`) |
| `npm run lint` | Menjalankan ESLint |

---

## Pemenuhan soal

| Poin soal | Implementasi |
| --- | --- |
| **1. Board & Column** | Lima kolom bawaan (To Do, Doing, Review, Done, Rework). Kolom bisa ditambah, diganti nama (klik dua kali judul), di-collapse, dan dihapus. |
| **2. Task Card** | Judul, deskripsi, assignee (tumpukan avatar), due date, label (Feature, Bug, Issue, Undefined), priority, checklist dengan progress bar, attachments, dan cover image. |
| **3. Filtering & Searching** | Pencarian judul & deskripsi, filter assignee, label, dan due date (Overdue, Due today, Next 7 days, No due date). Filter bisa dikombinasikan, dengan badge jumlah filter aktif. |
| **4. CRUD Task** | Create dari tombol `+` di tiap kolom, Read sebagai card, Update & Delete lewat modal detail yang mengikuti desain referensi. |
| **5. Drag and Drop** | Task dipindah antar kolom dan diurutkan ulang dalam kolom, dengan mouse, sentuhan (mobile), maupun keyboard. |
| **6. Checklist** | Tambah, centang, dan hapus subtask. Progress bar di card dan modal menyesuaikan otomatis. |
| **7. Penyimpanan Data** | Zustand dengan middleware `persist` ke Local Storage, termasuk migrasi data antar versi. |
| **Responsif** | Breakpoint untuk desktop, tablet, dan mobile. Modal menjadi layar penuh di mobile. |
| **Bonus: cover image** | Upload gambar (otomatis diperkecil & dikompres) atau pilih dari gambar contoh. |
| **Bonus: toast** | Muncul saat membuat, mengubah, dan menghapus task. Toast hapus dilengkapi tombol **Undo**. |
| **Bonus: animasi** | Animasi drag & drop, transisi hover, dan dukungan `prefers-reduced-motion`. |

### Fitur tambahan di luar soal

- **Undo** untuk hapus task dan hapus kolom.
- **Mark Complete** memindahkan task ke Done, dan bisa dikembalikan ke kolom asalnya.
- **Activity log** otomatis mencatat setiap perubahan task (pindah kolom, ganti judul, dan lainnya).
- **Export / Import** board dalam format JSON, dengan validasi dan pembersihan data dari file.
- **Konfirmasi** sebelum menutup modal yang belum disimpan dan sebelum aksi yang menghapus data.
- **Error Boundary**: jika terjadi error saat render, pengguna melihat layar pemulihan (Try again / Reset board), bukan halaman kosong.
- **Aksesibilitas**: seluruh tombol dan input punya label yang bisa dibaca screen reader, dan drag & drop bisa dilakukan dengan keyboard.

---

## Kualitas kode

### Testing

Test ditulis dengan **Vitest** dan **React Testing Library**. Prinsipnya: **menguji perilaku yang dilihat dan dilakukan pengguna, bukan detail implementasi**. Test mencari elemen berdasarkan role dan label (`getByRole('button', { name: 'Save' })`), sama seperti pengguna dan screen reader menemukannya. Karena itu, refactor internal tidak membuat test rusak selama perilakunya tetap sama.

Yang diuji mencakup setiap lapisan aplikasi:

| Lapisan | Contoh yang diuji |
| --- | --- |
| **Utils** (fungsi murni) | Logika filter & search, validasi dan pembersihan file import, format attachment yang diizinkan, kompresi gambar |
| **Store** | Semua aksi CRUD, perpindahan task antar kolom, pencatatan activity, undo, migrasi data antar versi |
| **Hooks** | Logika drag & drop (termasuk batal drag), toast, popover |
| **Komponen** | Setiap komponen UI: render, interaksi, validasi form, keadaan kosong |
| **Halaman** | Alur antar komponen: membuka modal, konfirmasi hapus, import/export, reset board, undo |
| **Error handling** | Layar pemulihan Error Boundary, file import rusak, gambar tidak valid |

Laporan coverage lengkap per file tersedia dengan `npm run test.coverage`.

### Struktur proyek

```
src/
├── pages/            # Halaman: menyusun komponen dan menghubungkannya ke store
│   └── KanbanPage.tsx
├── components/       # Komponen UI, dikelompokkan per fitur (tiap folder punya CSS sendiri)
│   ├── board/        # Board & drag-and-drop context
│   ├── column/       # Kolom: rename, collapse, hapus
│   ├── card/         # Task card & progress bar
│   ├── header/       # Search, filter, invite, export/import
│   ├── modal/        # Modal detail task & setiap field-nya
│   ├── avatar/       # Komponen dasar yang dipakai ulang
│   ├── button/
│   └── error/        # Error Boundary
├── hooks/            # Logika UI yang dipakai ulang (useBoardDnd, useToast, usePopover)
├── store/            # State global (Zustand) + persist + migrasi
├── utils/            # Fungsi murni tanpa ketergantungan ke React atau store
├── data/             # Konstanta (kolom, label, anggota tim) & data contoh
├── types/            # Tipe domain (Task, Column, BoardData, ...)
├── theme/            # Variabel tema & style global
└── __tests__/        # Test, dengan struktur folder yang sama seperti src/
```

### Keputusan desain

- **Pemisahan tanggung jawab yang tegas.** Komponen hanya mengurus tampilan. Logika bisnis ada di store, logika interaksi di hooks, dan perhitungan di utils. Contohnya, logika drag & drop dipisah dari `KanbanBoard` ke hook `useBoardDnd`, sehingga bisa diuji tanpa merender board.
- **Arah dependensi satu jalur.** `utils` dan `types` tidak bergantung pada store maupun komponen, jadi bisa dipakai ulang dan diuji secara terpisah.
- **Satu sumber data.** Semua perubahan data melewati aksi di `useBoardStore`, jadi perilakunya konsisten dan mudah dilacak.
- **Validasi di batas sistem.** Data dari luar (file import, data lama di Local Storage) divalidasi dan dibersihkan sebelum masuk ke aplikasi, sehingga data rusak tidak membuat aplikasi crash.
- **Data berversi.** Store memiliki `version` dan fungsi `migrate`, sehingga perubahan struktur data di masa depan tidak merusak data yang sudah tersimpan di perangkat pengguna.
- **Type-safe dari ujung ke ujung.** Tipe domain di `types/` dipakai di seluruh aplikasi, sehingga perubahan struktur data langsung ditandai compiler di semua tempat yang terdampak.

### Mudah dikembangkan

Struktur di atas membuat pengembangan lanjutan bersifat lokal dan tidak menyebar ke banyak file:

- **Menyambungkan ke backend/API:** cukup mengganti aksi di store. Komponen tidak perlu diubah karena tidak mengakses penyimpanan secara langsung.
- **Menambah field task baru:** tambahkan di `types/task.ts`, lalu compiler menunjukkan setiap tempat yang perlu disesuaikan.
- **Menambah jenis filter:** cukup ubah fungsi murni `filterTasks` beserta test-nya.
- **Mengubah tampilan:** warna dan ukuran memakai variabel CSS di `theme/`, dan style tiap komponen berada di foldernya sendiri.

---

## Tech stack

| Kebutuhan | Pilihan | Alasan |
| --- | --- | --- |
| UI framework | Ionic 9 + React 19 | Sesuai soal, komponen siap pakai untuk web & mobile |
| Bahasa | TypeScript (strict) | Kesalahan tertangkap saat kompilasi, bukan saat dipakai |
| State management | Zustand + `persist` | Ringan, tanpa boilerplate, persist ke Local Storage bawaan |
| Drag & drop | dnd-kit | Mendukung mouse, sentuhan, dan keyboard (aksesibel) |
| Build tool | Vite | Dev server dan build yang cepat |
| Testing | Vitest + React Testing Library | Terintegrasi dengan Vite, menguji dari sudut pandang pengguna |
| Linting | ESLint + typescript-eslint + react-hooks | Menjaga konsistensi dan mencegah bug umum pada hooks |

---

## Catatan

- Aplikasi berjalan sepenuhnya di sisi client sesuai soal. Data tersimpan di Local Storage browser, jadi tidak tersinkron antar perangkat.
- Fitur **Invite** dan **Attachments** bersifat simulasi: invite hanya menampilkan notifikasi, dan attachment hanya menyimpan nama serta jenis file (PDF, DOCX, JPG).
- Gambar cover memakai gambar dummy, sesuai ketentuan soal.
