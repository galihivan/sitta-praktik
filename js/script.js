/* =========================================
   SITTA - JAVASCRIPT
   ========================================= */

// Helper untuk mengambil elemen HTML
const $ = (selector) => document.querySelector(selector);

// Mengambil akun yang sedang login
function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem("sittaUser") || "null");
  } catch {
    return null;
  }
}

// Menampilkan pesan
function showMessage(element, message, type = "info") {
  if (!element) return;

  element.textContent = message;
  element.className = `message ${type}`;
  element.hidden = false;
}

// Format angka Indonesia
function formatNumber(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

// Format tanggal
function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value + "T00:00:00");

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

// Memastikan halaman selain login hanya dibuka setelah login
function protectPage() {
  const isLoginPage =
    window.location.pathname.endsWith("/index.html") ||
    window.location.pathname === "/" ||
    !window.location.pathname.split("/").pop();

  if (isLoginPage) return;

  const user = getCurrentUser();

  if (!user) {
    window.location.replace("index.html");
  }
}

// Informasi pengguna di bagian atas halaman
function renderUserInfo() {
  const user = getCurrentUser();
  if (!user) return;

  const name = $("#userName");
  const role = $("#userRole");
  const avatar = $("#userAvatar");

  if (name) name.textContent = user.nama;
  if (role) role.textContent = user.role;
  if (avatar) {
    avatar.textContent = user.nama.charAt(0).toUpperCase();
  }
}

// =========================================
// LOGIN
// =========================================
function initLogin() {
  const form = $("#loginForm");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = $("#email").value.trim().toLowerCase();
    const password = $("#password").value;

    // dataPengguna berasal dari data.js
    const users = typeof dataPengguna !== "undefined"
      ? dataPengguna
      : [];

    const user = users.find((item) =>
      item.email.toLowerCase() === email &&
      item.password === password
    );

    if (!user) {
      alert("email/password yang anda masukkan salah");
      return;
    }

    // Simpan sesi login pada tab browser ini
    sessionStorage.setItem("sittaUser", JSON.stringify({
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      lokasi: user.lokasi
    }));

    window.location.href = "dashboard.html";
  });

  // Modal Lupa Password dan Daftar
  document.querySelectorAll("[data-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      const modal = document.getElementById(button.dataset.modal);
      if (modal) modal.showModal();
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      button.closest("dialog")?.close();
    });
  });

  // Klik di luar kotak modal untuk menutupnya
  document.querySelectorAll("dialog.modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) modal.close();
    });
  });

  // Simulasi lupa password
  const forgotForm = $("#forgotForm");

  if (forgotForm) {
    forgotForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = $("#forgotEmail").value.trim().toLowerCase();
      const users = typeof dataPengguna !== "undefined"
        ? dataPengguna
        : [];

      const found = users.some((user) => user.email.toLowerCase() === email);

      alert(
        found
          ? "Email ditemukan. Fitur pengiriman tautan reset password belum terhubung ke server."
          : "Email tidak ditemukan dalam data demo."
      );

      if (found) $("#forgotModal").close();
    });
  }

  // Simulasi pendaftaran, tanpa menyimpan ke database
  const registerForm = $("#registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = $("#registerName").value.trim();
      const email = $("#registerEmail").value.trim().toLowerCase();
      const password = $("#registerPassword").value;

      if (!name || !email || password.length < 6) {
        alert("Periksa kembali data pendaftaran.");
        return;
      }

      const users = typeof dataPengguna !== "undefined"
        ? dataPengguna
        : [];

      if (users.some((user) => user.email.toLowerCase() === email)) {
        alert("Email sudah terdaftar pada data demo.");
        return;
      }

      alert(
        "Pendaftaran berhasil disimulasikan. " +
        "Akun baru belum disimpan karena aplikasi belum memakai backend."
      );

      registerForm.reset();
      $("#registerModal").close();
    });
  }
}

// =========================================
// DASHBOARD
// =========================================
function initDashboard() {
  const greeting = $("#greeting");
  if (!greeting) return;

  const hour = new Date().getHours();

  let message = "Selamat malam";

  if (hour >= 4 && hour < 11) {
    message = "Selamat pagi";
  } else if (hour >= 11 && hour < 15) {
    message = "Selamat siang";
  } else if (hour >= 15 && hour < 18) {
    message = "Selamat sore";
  }

  const user = getCurrentUser();

  greeting.textContent =
    `${message}${user ? ", " + user.nama : ""}!`;

  const detail = $("#greetingDetail");
  if (detail) {
    detail.textContent =
      "Selamat datang di Sistem Informasi Tiras dan Transaksi Bahan Ajar.";
  }

  const dateElement = $("#currentDate");
  if (dateElement) {
    dateElement.textContent = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  const books = typeof dataBahanAjar !== "undefined"
    ? dataBahanAjar
    : [];

  const tracking = typeof dataTracking !== "undefined"
    ? Object.keys(dataTracking)
    : [];

  const totalBooks = $("#totalBooks");
  const totalStock = $("#totalStock");
  const totalTracking = $("#totalTracking");

  if (totalBooks) {
    totalBooks.textContent = formatNumber(books.length);
  }

  if (totalStock) {
    totalStock.textContent = formatNumber(
      books.reduce((sum, book) => sum + Number(book.stok || 0), 0)
    );
  }

  if (totalTracking) {
    totalTracking.textContent = formatNumber(tracking.length);
  }
}

// =========================================
// TRACKING PENGIRIMAN
// =========================================
function initTracking() {
  const form = $("#trackingForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const number = $("#nomorDO").value.trim();
    const message = $("#trackingMessage");
    const result = $("#trackingResult");

    result.hidden = true;
    message.hidden = true;

    const trackingData = typeof dataTracking !== "undefined"
      ? dataTracking
      : {};

    const data = trackingData[number];

    if (!data) {
      showMessage(
        message,
        "Nomor DO tidak ditemukan. Periksa kembali nomor yang dimasukkan.",
        "error"
      );
      return;
    }

    $("#resultDO").textContent = data.nomorDO;
    $("#resultName").textContent = data.nama;
    $("#resultCourier").textContent = data.ekspedisi;
    $("#resultDate").textContent = formatDate(data.tanggalKirim);
    $("#resultPackage").textContent = data.paket;
    $("#resultTotal").textContent = data.total;
    $("#trackingStatus").textContent = data.status;

    const timeline = $("#trackingTimeline");
    timeline.replaceChildren();

    (data.perjalanan || []).forEach((item) => {
      const entry = document.createElement("article");
      entry.className = "timeline-item";

      const dot = document.createElement("span");
      dot.className = "timeline-dot";

      const time = document.createElement("time");
      time.textContent = item.waktu;

      const description = document.createElement("h3");
      description.textContent = item.keterangan;

      entry.append(dot, time, description);
      timeline.appendChild(entry);
    });

    result.hidden = false;

    showMessage(
      message,
      "Data pengiriman berhasil ditemukan.",
      "success"
    );
  });
}

// =========================================
// STOK BAHAN AJAR
// =========================================
function initStock() {
  const tableBody = $("#stockTableBody");
  if (!tableBody) return;

  // Salin data dummy agar data awal tidak dimodifikasi langsung
  const initialData = typeof dataBahanAjar !== "undefined"
    ? dataBahanAjar
    : [];

  const stockData = initialData.map((item) => ({ ...item }));

  const searchInput = $("#stockSearch");
  const addForm = $("#addStockForm");
  const message = $("#stockMessage");
  const coverModal = $("#coverModal");

  function updateStockSummary() {
    const count = $("#stockBookCount");
    const total = $("#stockTotal");
    const low = $("#lowStockCount");

    if (count) count.textContent = formatNumber(stockData.length);

    if (total) {
      total.textContent = formatNumber(
        stockData.reduce((sum, item) => sum + Number(item.stok || 0), 0)
      );
    }

    if (low) {
      low.textContent = formatNumber(
        stockData.filter((item) => Number(item.stok) < 200).length
      );
    }
  }

  // Buka modal detail cover
  function openCoverModal(item) {
    if (!coverModal) return;

    const coverImage = $("#coverImage");
    const coverName = $("#coverName");
    const coverCode = $("#coverCode");
    const coverLocation = $("#coverLocation");
    const coverType = $("#coverType");
    const coverEdition = $("#coverEdition");
    const coverStock = $("#coverStock");

    if (coverName) coverName.textContent = item.namaBarang || "-";
    if (coverCode) coverCode.textContent = item.kodeBarang || "-";
    if (coverLocation) coverLocation.textContent = item.kodeLokasi || "-";
    if (coverType) coverType.textContent = item.jenisBarang || "-";
    if (coverEdition) coverEdition.textContent = item.edisi || "-";
    if (coverStock) coverStock.textContent = formatNumber(item.stok);

    if (coverImage) {
      // Jika ada URL cover di data, pakai itu. Jika tidak, pakai placeholder.
      if (item.cover && item.cover.trim() !== "") {
        coverImage.src = item.cover;
        coverImage.alt = `Cover ${item.namaBarang}`;
      } else {
        // Placeholder sederhana (bisa diganti path gambar sendiri)
        coverImage.src =
          "https://via.placeholder.com/280x400?text=" +
          encodeURIComponent(item.namaBarang || "Cover");
        coverImage.alt = "Cover belum tersedia";
      }
    }

    coverModal.showModal();
  }

  function renderTable() {
    const keyword = (searchInput?.value || "").trim().toLowerCase();

    const filtered = stockData.filter((item) =>
      [
        item.kodeLokasi,
        item.kodeBarang,
        item.namaBarang,
        item.jenisBarang
      ].some((value) =>
        String(value || "").toLowerCase().includes(keyword)
      )
    );

    tableBody.replaceChildren();

    if (filtered.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");

      cell.colSpan = 7;
      cell.className = "empty-row";
      cell.textContent = "Data bahan ajar tidak ditemukan.";

      row.appendChild(cell);
      tableBody.appendChild(row);
    } else {
      filtered.forEach((item, index) => {
        const row = document.createElement("tr");

        // No.
        const cellNo = document.createElement("td");
        cellNo.textContent = index + 1;
        row.appendChild(cellNo);

        // Kode Lokasi
        const cellLokasi = document.createElement("td");
        cellLokasi.textContent = item.kodeLokasi;
        row.appendChild(cellLokasi);

        // Kode Barang
        const cellKode = document.createElement("td");
        cellKode.textContent = item.kodeBarang;
        row.appendChild(cellKode);

        // Nama Bahan Ajar (bisa diklik)
        const cellNama = document.createElement("td");
        const nameLink = document.createElement("button");
        nameLink.type = "button";
        nameLink.className = "link-button";
        nameLink.textContent = item.namaBarang;
        nameLink.title = "Klik untuk melihat detail dan cover";
        nameLink.addEventListener("click", () => openCoverModal(item));
        cellNama.appendChild(nameLink);
        row.appendChild(cellNama);

        // Jenis
        const cellJenis = document.createElement("td");
        cellJenis.textContent = item.jenisBarang;
        row.appendChild(cellJenis);

        // Edisi
        const cellEdisi = document.createElement("td");
        cellEdisi.textContent = item.edisi;
        row.appendChild(cellEdisi);

        // Stok
        const cellStok = document.createElement("td");
        cellStok.textContent = formatNumber(item.stok);
        cellStok.className =
          Number(item.stok) < 200
            ? "stock-number low"
            : "stock-number normal";
        row.appendChild(cellStok);

        tableBody.appendChild(row);
      });
    }

    const count = $("#stockTableCount");
    if (count) {
      count.textContent = `${filtered.length} dari ${stockData.length} data`;
    }

    updateStockSummary();
  }

  // Pencarian data tabel
  searchInput?.addEventListener("input", renderTable);

  // Buka dan tutup formulir penambahan
  $("#showAddForm")?.addEventListener("click", () => {
    addForm.hidden = !addForm.hidden;

    if (!addForm.hidden) {
      $("#kodeLokasi").focus();
    }
  });

  $("#cancelAddForm")?.addEventListener("click", () => {
    addForm.reset();
    addForm.hidden = true;
    message.hidden = true;
  });

  // Menambahkan baris menggunakan JavaScript DOM
  addForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const newItem = {
      kodeLokasi: $("#kodeLokasi").value.trim(),
      kodeBarang: $("#kodeBarang").value.trim(),
      namaBarang: $("#namaBarang").value.trim(),
      jenisBarang: $("#jenisBarang").value,
      edisi: $("#edisi").value,
      stok: Number($("#stokBaru").value),
      cover: ""
    };

    if (
      !newItem.kodeLokasi ||
      !newItem.kodeBarang ||
      !newItem.namaBarang ||
      !Number.isFinite(newItem.stok) ||
      newItem.stok < 0
    ) {
      showMessage(message, "Lengkapi data dengan benar.", "error");
      return;
    }

    const duplicate = stockData.some(
      (item) =>
        String(item.kodeBarang).toLowerCase() ===
        newItem.kodeBarang.toLowerCase()
    );

    if (duplicate) {
      showMessage(
        message,
        "Kode barang sudah ada. Gunakan kode yang berbeda.",
        "error"
      );
      return;
    }

    stockData.push(newItem);

    addForm.reset();
    addForm.hidden = true;

    if (searchInput) searchInput.value = "";

    renderTable();

    showMessage(
      message,
      "Bahan ajar berhasil ditambahkan ke tabel.",
      "success"
    );
  });

  // Tutup modal cover
  $("#closeCoverModal")?.addEventListener("click", () => {
    coverModal?.close();
  });

  // Klik di luar modal cover untuk menutup
  coverModal?.addEventListener("click", (event) => {
    if (event.target === coverModal) {
      coverModal.close();
    }
  });

  renderTable();
}

// =========================================
// NAVIGASI, MENU DEMO, DAN LOGOUT
// =========================================
function initNavigation() {
  $("#menuToggle")?.addEventListener("click", () => {
    $("#sidebar")?.classList.toggle("open");
  });

  document.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", () => {
      const confirmed = confirm("Apakah kamu yakin ingin keluar?");

      if (!confirmed) return;

      sessionStorage.removeItem("sittaUser");
      window.location.href = "index.html";
    });
  });

  // Laporan dan histori hanya berupa simulasi menu
  document.querySelectorAll("[data-demo-menu]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();

      alert(
        `Menu "${element.dataset.demoMenu}" merupakan simulasi. ` +
        "Data khusus untuk halaman ini belum tersedia dalam file dummy."
      );
    });
  });
}

// =========================================
// JALANKAN FITUR
// =========================================
document.addEventListener("DOMContentLoaded", () => {
  protectPage();
  renderUserInfo();
  initLogin();
  initDashboard();
  initTracking();
  initStock();
  initNavigation();
});