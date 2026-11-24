
# TraceLab — API Incident & Dependency Explorer

## Deskripsi

TraceLab adalah aplikasi web untuk mengelola daftar service/API,
mencatat incident, dan melihat hubungan dependency antar-service.

Contohnya, jika Payment Service mengalami gangguan, pengguna
dapat mengetahui service lain yang berpotensi terdampak.

Seluruh service merupakan data simulasi, bukan microservices
sungguhan. Project ini bertujuan mempelajari GraphQL melalui
query, mutation, nested resolver, caching, DataLoader,
pagination, dan subscription.

Arsitektur menggunakan modular monolith dengan frontend dan
backend terpisah. Seluruh aplikasi berjalan secara lokal tanpa
Docker, cloud, atau layanan eksternal.

## Teknologi

| Kebutuhan | Teknologi |
|---|---|
| Frontend | React + Vite + TypeScript |
| GraphQL Client | Apollo Client |
| Backend | Node.js + TypeScript |
| GraphQL Server | GraphQL Yoga |
| Database | SQLite |
| ORM | Drizzle ORM |
| Query Optimization | DataLoader |
| Realtime | GraphQL Subscriptions + In-memory PubSub |
| Testing | Node.js Test Runner |
| Package Manager | npm |

## Roadmap — 25 Fase

Setiap fase ditargetkan selesai dalam 30 menit, termasuk
memahami konsep, menulis kode, dan melakukan pengujian.

### Milestone 1 — Foundation

#### Fase 1: Project Initialization
Dikerjakan:
- Membuat struktur frontend dan backend terpisah.
- Menyiapkan konfigurasi dan menjalankan kedua aplikasi.

DoD:
- Frontend dapat dibuka di browser.
- Backend berjalan tanpa error.

#### Fase 2: First GraphQL Server
Dikerjakan:
- Membuat endpoint GraphQL.
- Membuat schema dan resolver untuk query health.

DoD:
- Query health berhasil dijalankan.
- Memahami hubungan schema dan resolver.

#### Fase 3: Local Database
Dikerjakan:
- Menyiapkan database SQLite.
- Membuat model Service dan menjalankan migration.

DoD:
- Database dan tabel Service tersedia.
- Backend dapat mengakses database.

#### Fase 4: Service Query
Dikerjakan:
- Menambahkan beberapa data service contoh.
- Membuat query untuk mengambil daftar service.

DoD:
- Query services mengembalikan data dari database.
- Response mengikuti field yang diminta.

#### Fase 5: Query Arguments
Dikerjakan:
- Membuat query service berdasarkan ID.
- Mengeksplorasi GraphQL arguments dan variables.

DoD:
- Query service(id) berfungsi.
- ID yang tidak ditemukan ditangani dengan baik.

### Milestone 2 — Mutations & Data Modeling

#### Fase 6: Create Service
Dikerjakan:
- Membuat input type dan mutation createService.
- Menambahkan validasi input.

DoD:
- Service dapat dibuat melalui GraphQL.
- Input tidak valid ditolak.

#### Fase 7: Update Service
Dikerjakan:
- Membuat mutation updateService.
- Mendukung perubahan informasi dan status service.

DoD:
- Data service berhasil diperbarui.
- Perubahan terlihat pada query berikutnya.

#### Fase 8: Incident Model
Dikerjakan:
- Membuat model Incident.
- Menghubungkan Incident dengan Service.
- Menambahkan severity dan status incident.

DoD:
- Tabel Incident tersedia.
- Incident dapat dikaitkan dengan Service.

#### Fase 9: Incident Queries
Dikerjakan:
- Membuat query daftar dan detail incident.
- Menambahkan filter berdasarkan status.

DoD:
- Query incidents dan incident(id) berfungsi.
- Filter status memberikan hasil yang benar.

#### Fase 10: Incident Mutations
Dikerjakan:
- Membuat mutation createIncident.
- Membuat mutation updateIncidentStatus.

DoD:
- Incident dapat dibuat dan diperbarui.
- Service yang tidak ditemukan ditolak.

### Milestone 3 — Relationships & Dependencies

#### Fase 11: Nested Service Query
Dikerjakan:
- Menambahkan field incidents pada Service.
- Membuat nested resolver untuk incident terkait.

DoD:
- Service dapat mengembalikan nested incidents.
- Incident sesuai dengan service pemiliknya.

#### Fase 12: Reverse Relationship
Dikerjakan:
- Menambahkan field service pada Incident.
- Membuat resolver untuk mengambil service terkait.

DoD:
- Incident dapat mengembalikan detail service.
- Nested query dua arah berfungsi.

#### Fase 13: Dependency Model
Dikerjakan:
- Membuat model ServiceDependency.
- Mendefinisikan hubungan dependency antar-service.

DoD:
- Dependency dapat disimpan.
- Self-dependency ditolak.

#### Fase 14: Dependency Mutations
Dikerjakan:
- Membuat addDependency dan removeDependency.
- Mencegah dependency duplikat.

DoD:
- Dependency dapat ditambahkan dan dihapus.
- Dependency duplikat ditolak.

#### Fase 15: Dependency Explorer
Dikerjakan:
- Membuat query direct dependencies.
- Membuat query reverse dependencies.
- Mengidentifikasi service yang berpotensi terdampak.

DoD:
- Dependency beserta statusnya dapat ditampilkan.
- Service yang bergantung langsung dapat diketahui.

### Milestone 4 — Frontend Integration

#### Fase 16: GraphQL Client
Dikerjakan:
- Menghubungkan frontend dengan GraphQL API.
- Mengimplementasikan query, loading, dan error state.

DoD:
- Frontend berhasil mengambil data dari backend.
- Loading dan error state berfungsi.

#### Fase 17: Service Dashboard
Dikerjakan:
- Membuat halaman daftar service.
- Menampilkan nama, deskripsi, dan status service.

DoD:
- Dashboard menampilkan data service.
- Empty state tersedia.

#### Fase 18: Service Detail
Dikerjakan:
- Membuat halaman detail service.
- Menampilkan incident dan dependency terkait.

DoD:
- Detail service dapat dibuka.
- Nested data ditampilkan dengan benar.

#### Fase 19: Incident Management UI
Dikerjakan:
- Membuat form pembuatan incident.
- Menambahkan aksi update status incident.

DoD:
- Incident dapat dibuat melalui frontend.
- Status incident dapat diperbarui.

#### Fase 20: Client Cache
Dikerjakan:
- Mengamati perilaku Apollo Client cache.
- Mengimplementasikan cache update atau refetch.

DoD:
- UI menampilkan perubahan setelah mutation.
- Tidak memerlukan refresh browser manual.

### Milestone 5 — Optimization & Testing

#### Fase 21: N+1 Investigation
Dikerjakan:
- Mengaktifkan SQL query logging.
- Mengamati jumlah database query pada nested resolver.

DoD:
- N+1 problem berhasil diidentifikasi.
- Jumlah query sebelum optimasi tercatat.

#### Fase 22: DataLoader Optimization
Dikerjakan:
- Mengimplementasikan batching menggunakan DataLoader.
- Membandingkan jumlah query sebelum dan sesudah.

DoD:
- Jumlah database query berkurang.
- Response GraphQL tetap benar.

#### Fase 23: GraphQL Pagination
Dikerjakan:
- Mengimplementasikan cursor-based pagination incident.
- Menambahkan kontrol untuk mengambil halaman berikutnya.

DoD:
- Incident dapat diambil secara bertahap.
- Pagination tidak menghasilkan data duplikat.

#### Fase 24: GraphQL Subscriptions
Dikerjakan:
- Membuat subscription perubahan status incident.
- Mengirim event melalui in-memory PubSub.
- Menghubungkan subscription dengan frontend.

DoD:
- Dua tab browser menerima update realtime.
- Tidak membutuhkan layanan eksternal.

#### Fase 25: Integration Testing & Review
Dikerjakan:
- Membuat integration test untuk query dan mutation utama.
- Menguji aturan dependency.
- Meninjau struktur kode dan membuat README singkat.

DoD:
- Integration tests berhasil dijalankan.
- Fitur utama berfungsi dari frontend.
- Project dapat dijalankan sepenuhnya secara lokal.
- README menjelaskan cara menjalankan project.