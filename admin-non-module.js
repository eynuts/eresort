
function checkAdminAuth() {
  if (localStorage.getItem("adminAuth") !== "true") {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function logoutAdmin() {
  localStorage.removeItem("adminAuth");
  window.location.href = "login.html";
}

const SAMPLE_BOOKINGS = [
  { id: "BK001", guestName: "Juan ", email: "juan@email.com", phone: "09123456789", roomType: "deluxe", checkIn: "2024-03-10", checkOut: "2024-03-12", guests: 2, totalPrice: "P1,398", status: "confirmed", isPaid: true, requests: "Late check-in requested.", gcashNumber: "0917-123-4567", gcashRef: "REF123456" },
  { id: "BK002", guestName: "Maria Santos", email: "maria@email.com", phone: "09234567890", roomType: "standard", checkIn: "2024-03-15", checkOut: "2024-03-17", guests: 1, totalPrice: "P998", status: "pending", isPaid: false, requests: "None", gcashNumber: "0917-987-6543", gcashRef: "REF789012" }
];

let bookingsData = SAMPLE_BOOKINGS.slice();
let currentBooking = null;

const bookingsTableBody = document.getElementById("bookingsTableBody");
const searchInput = document.getElementById("searchBooking");
const filterStatus = document.getElementById("filterStatus");
const filterRoom = document.getElementById("filterRoom");
const bookingModal = document.getElementById("bookingModal");
const closeBookingModal = document.getElementById("closeBookingModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const saveChanges = document.getElementById("saveChanges");
const deleteBookingBtn = document.getElementById("deleteBooking");
const exportBookingsBtn = document.getElementById("exportBookings");
const confirmBookingEmailBtn = document.getElementById("confirmBookingEmail");
const markPaidBtn = document.getElementById("markPaidBtn");
const logoutBtn = document.getElementById("logoutBtn");

function loadLocalBookings() {
  const localBookings = JSON.parse(localStorage.getItem('eresort_bookings') || '[]');
  bookingsData = [...SAMPLE_BOOKINGS, ...localBookings];
  renderBookingsTable(bookingsData);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatRoomType(roomType) {
  const roomTypes = {
    standard: "Standard Room",
    deluxe: "Deluxe Room",
    family: "Family Room"
  };
  return roomTypes[roomType] || roomType;
}

function renderBookingsTable(bookings) {
  if (bookings.length === 0) {
    bookingsTableBody.innerHTML = '<tr><td colspan="12" style="text-align: center; padding: 2rem; color: var(--text-light);">No bookings found</td></tr>';
    return;
  }

  bookingsTableBody.innerHTML = bookings.map(booking => `
    <tr>
      <td>${booking.id}</td>
      <td>${booking.guestName}</td>
      <td>${booking.email}</td>
      <td>${booking.phone}</td>
      <td>${formatRoomType(booking.roomType)}</td>
      <td>${formatDate(booking.checkIn)}</td>
      <td>${formatDate(booking.checkOut)}</td>
      <td>${booking.gcashNumber || '-'}</td>
      <td>${booking.gcashRef || '-'}</td>
      <td>
        <span class="booking__status status__${booking.status}">
          ${booking.status}
        </span>
      </td>
      <td>
        <span class="booking__payment ${booking.isPaid ? 'paid' : 'unpaid'}" style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
          ${booking.isPaid ? '✓ Paid' : 'Unpaid'}
        </span>
      </td>
      <td>
        <div class="table__actions">
          <button class="action__btn btn__view" onclick="openBookingModal('${booking.id}')">
            View
          </button>
          <button class="action__btn btn__delete" onclick="deleteBookingDirect('${booking.id}')">
            Delete
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

function filterBookings() {
  const searchTerm = searchInput.value.toLowerCase();
  const statusFilter = filterStatus.value;
  const roomFilter = filterRoom.value;

  const filtered = bookingsData.filter(booking => {
    const matchesSearch = 
      booking.guestName.toLowerCase().includes(searchTerm) ||
      booking.email.toLowerCase().includes(searchTerm) ||
      booking.id.toLowerCase().includes(searchTerm);
    
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    const matchesRoom = !roomFilter || booking.roomType === roomFilter;

    return matchesSearch && matchesStatus && matchesRoom;
  });

  renderBookingsTable(filtered);
}

function openBookingModal(bookingId) {
  const booking = bookingsData.find(b => b.id === bookingId);
  if (!booking) return;

  currentBooking = booking;

  document.getElementById("modalGuestName").textContent = booking.guestName;
  document.getElementById("modalGuestEmail").textContent = booking.email;
  document.getElementById("modalGuestPhone").textContent = booking.phone;
  document.getElementById("modalGuestCount").textContent = booking.guests;
  document.getElementById("modalRoomType").textContent = formatRoomType(booking.roomType);
  document.getElementById("modalCheckIn").textContent = formatDate(booking.checkIn);
  document.getElementById("modalCheckOut").textContent = formatDate(booking.checkOut);
  document.getElementById("modalPrice").textContent = booking.totalPrice;
  document.getElementById("modalGcashNumber").textContent = booking.gcashNumber || '-';
  document.getElementById("modalGcashRef").textContent = booking.gcashRef || '-';
  document.getElementById("modalPaymentStatus").textContent = booking.isPaid ? '✓ Paid' : 'Unpaid';
  document.getElementById("modalPaymentStatus").style.color = booking.isPaid ? '#10b981' : '#ef4444';
  document.getElementById("modalRequests").textContent = booking.requests || "No special requests";
  document.getElementById("modalStatus").value = booking.status;

  bookingModal.classList.add("active");
}

function closeModal() {
  bookingModal.classList.remove("active");
  currentBooking = null;
}

function updateBooking() {
  if (!currentBooking) return;
  const newStatus = document.getElementById("modalStatus").value;
  const bookingIndex = bookingsData.findIndex(b => b.id === currentBooking.id);

  if (bookingIndex !== -1) {
    bookingsData[bookingIndex].status = newStatus;
    alert(`Booking ${currentBooking.id} updated successfully!`);
    filterBookings();
    closeModal();
  }
}

function markBookingAsPaid() {
  if (!currentBooking) return;
  const bookingId = currentBooking.id;
  const newPaidStatus = !currentBooking.isPaid;
  const bookingIndex = bookingsData.findIndex(b => b.id === bookingId);

  if (bookingIndex !== -1) {
    bookingsData[bookingIndex].isPaid = newPaidStatus;
    const statusMessage = newPaidStatus ? 'marked as paid' : 'marked as unpaid';
    alert(`Booking ${bookingId} has been ${statusMessage}.`);
    openBookingModal(bookingId);
    filterBookings();
  }
}

function removeBooking() {
  if (!currentBooking) return;
  if (confirm(`Are you sure you want to delete booking ${currentBooking.id}?`)) {
    const bookingIndex = bookingsData.findIndex(b => b.id === currentBooking.id);
    if (bookingIndex !== -1) {
      const deletedBooking = bookingsData.splice(bookingIndex, 1)[0];
      alert(`Booking ${deletedBooking.id} has been deleted.`);
      filterBookings();
      closeModal();
    }
  }
}

function deleteBookingDirect(bookingId) {
  if (!confirm(`Are you sure you want to delete booking ${bookingId}?`)) return;
  const bookingIndex = bookingsData.findIndex(b => b.id === bookingId);
  
  if (bookingIndex !== -1) {
    bookingsData.splice(bookingIndex, 1);
    alert(`Booking ${bookingId} has been deleted.`);
    filterBookings();
  }
}

function confirmBookingAndEmail() {
  if (!currentBooking) return;
  const bookingId = currentBooking.id;
  const newStatus = "confirmed";
  const bookingIndex = bookingsData.findIndex(b => b.id === bookingId);

  if (bookingIndex !== -1) {
    bookingsData[bookingIndex].status = newStatus;
    alert(`Booking ${bookingId} has been confirmed.`);
    filterBookings();
    closeModal();
  }
}

function exportBookingsData() {
  let csvContent = "Booking ID,Guest Name,Email,Phone,Room Type,Check-in,Check-out,GCash Number,Reference Number,Guests,Status,Special Requests\n";
  bookingsData.forEach(booking => {
    csvContent += `"${booking.id}","${booking.guestName}","${booking.email}","${booking.phone}","${formatRoomType(booking.roomType)}","${booking.checkIn}","${booking.checkOut}","${booking.gcashNumber || ''}","${booking.gcashRef || ''}","${booking.guests}","${booking.status}","${booking.requests || ''}"\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `bookings_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  alert("Bookings exported successfully!");
}

function setupEventListeners() {
  searchInput.addEventListener("input", filterBookings);
  filterStatus.addEventListener("change", filterBookings);
  filterRoom.addEventListener("change", filterBookings);
  closeBookingModal.addEventListener("click", () => closeModal());
  closeModalBtn.addEventListener("click", () => closeModal());
  bookingModal.addEventListener("click", (e) => {
    if (e.target === bookingModal) {
      closeModal();
    }
  });
  saveChanges.addEventListener("click", updateBooking);
  deleteBookingBtn.addEventListener("click", removeBooking);
  exportBookingsBtn.addEventListener("click", exportBookingsData);
  
  if (confirmBookingEmailBtn) {
    confirmBookingEmailBtn.addEventListener("click", confirmBookingAndEmail);
  }
  if (markPaidBtn) {
    markPaidBtn.addEventListener("click", markBookingAsPaid);
  }
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logoutAdmin);
  }
}

function initAdmin() {
  loadLocalBookings();
  setupEventListeners();
}

window.openBookingModal = openBookingModal;
window.deleteBookingDirect = deleteBookingDirect;

document.addEventListener("DOMContentLoaded", function() {
  if (checkAdminAuth()) {
    initAdmin();
  }
});
