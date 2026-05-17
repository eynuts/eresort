document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('payment-form-element');
  const confirmModal = document.getElementById('payment-confirm-modal');
  const successModal = document.getElementById('payment-success-modal');
  const confirmBtn = document.getElementById('payment-confirm-btn');
  const cancelBtn = document.getElementById('payment-cancel-btn');
  const okBtn = document.getElementById('payment-ok-btn');
  const submitBtn = document.getElementById('payment-submit-btn');
  const summaryContent = document.getElementById('summary-content');
  const confirmGcashRef = document.getElementById('confirm-gcash-ref');
  const confirmTotal = document.getElementById('confirm-total');

  let pendingBooking = null;
  let currentGcashRef = '';
  let currentGcashNumber = '';

  try {
    pendingBooking = JSON.parse(localStorage.getItem('eresort_pending_booking'));
  } catch (err) {
    console.warn('Error reading pending booking:', err);
  }

  if (!pendingBooking) {
    alert('No pending booking found. Please complete your booking first.');
    window.location.href = 'booking.html';
    return;
  }

  summaryContent.innerHTML = `
    <div class="summary-item">
      <span>Name</span>
      <span>${pendingBooking.guestName}</span>
    </div>
    <div class="summary-item">
      <span>Email</span>
      <span>${pendingBooking.email}</span>
    </div>
    <div class="summary-item">
      <span>Phone</span>
      <span>${pendingBooking.phone}</span>
    </div>
    <div class="summary-item">
      <span>Room Type</span>
      <span>${pendingBooking.roomType}</span>
    </div>
    <div class="summary-item">
      <span>Check-in</span>
      <span>${pendingBooking.checkIn}</span>
    </div>
    <div class="summary-item">
      <span>Check-out</span>
      <span>${pendingBooking.checkOut}</span>
    </div>
    <div class="summary-item">
      <span>Guests</span>
      <span>${pendingBooking.guests}</span>
    </div>
    <div class="summary-item">
      <span>Nights</span>
      <span>${pendingBooking.nights}</span>
    </div>
    <div class="summary-item">
      <span>Total Price</span>
      <span>P${pendingBooking.totalPrice}</span>
    </div>
  `;

  function getLocalBookings() {
    try {
      const stored = localStorage.getItem('eresort_bookings');
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      return [];
    }
  }

  function saveLocalBooking(bookingData) {
    const bookings = getLocalBookings();
    const id = 'LOCAL_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    bookings.push({ id, ...bookingData, savedAt: new Date().toISOString() });
    try {
      localStorage.setItem('eresort_bookings', JSON.stringify(bookings));
    } catch (err) {
      console.warn('Could not save booking:', err);
    }
    return id;
  }

  // Form submit - show confirmation modal
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    currentGcashNumber = '0917-123-4567';
    currentGcashRef = document.getElementById('gcash-ref').value.trim();

    if (!currentGcashRef) {
      alert('Please enter your GCash Reference Number');
      return;
    }

    // Update confirmation modal
    confirmGcashRef.textContent = currentGcashRef;
    confirmTotal.textContent = 'P' + pendingBooking.totalPrice;

    // Show confirmation modal
    confirmModal.style.display = 'flex';
  });

  // Cancel button
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      confirmModal.style.display = 'none';
    });
  }

  // Confirm button - process payment
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      confirmModal.style.display = 'none';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
      }

      const data = {
        guestName: pendingBooking.guestName,
        email: pendingBooking.email,
        phone: pendingBooking.phone,
        checkIn: pendingBooking.checkIn,
        checkOut: pendingBooking.checkOut,
        guests: pendingBooking.guests,
        roomType: pendingBooking.roomType,
        requests: pendingBooking.requests,
        gcashNumber: currentGcashNumber,
        gcashRef: currentGcashRef,
        nights: pendingBooking.nights,
        pricePerNight: pendingBooking.pricePerNight,
        totalPrice: pendingBooking.totalPrice,
        status: 'pending',
        isPaid: true,
        createdAt: Date.now()
      };

      // Save booking
      saveLocalBooking(data);

      // Clear pending booking
      try {
        localStorage.removeItem('eresort_pending_booking');
      } catch (err) {
        console.warn('Could not clear pending booking:', err);
      }

      // Show success modal
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Complete Payment';
        }
        successModal.style.display = 'flex';
      }, 800);
    });
  }

  // OK button - go back to home
  if (okBtn) {
    okBtn.addEventListener('click', () => {
      successModal.style.display = 'none';
      window.location.href = 'index.html';
    });
  }

  // Close modals when clicking outside
  if (confirmModal) {
    confirmModal.addEventListener('click', (e) => {
      if (e.target === confirmModal) {
        confirmModal.style.display = 'none';
      }
    });
  }

  if (successModal) {
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        successModal.style.display = 'none';
        window.location.href = 'index.html';
      }
    });
  }
});
