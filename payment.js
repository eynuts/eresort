import { database, firebaseTimestamp } from './firebase.js';
import { ref, push } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

function createBookingData(guestName, email, phone, checkIn, checkOut, guests, roomType, requests, gcashNumber, gcashRef, nights, pricePerNight, totalPrice) {
  return {
    guestName,
    email,
    phone,
    checkIn,
    checkOut,
    guests,
    roomType,
    requests,
    gcashNumber,
    gcashRef,
    nights,
    pricePerNight,
    totalPrice,
    status: 'pending',
    isPaid: false,
    createdAt: firebaseTimestamp ? firebaseTimestamp() : Date.now()
  };
}

async function submitBookingToRealtime(data) {
  const bookingsRef = ref(database, 'bookings');
  return push(bookingsRef, data);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('payment-form-element');
  const overlay = document.getElementById('payment-loading');
  const submitBtn = document.getElementById('payment-submit-btn');
  const summaryContent = document.getElementById('summary-content');

  let pendingBooking = null;
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
    <p style="margin: 0.5rem 0; color: var(--white);"><strong>Name:</strong> ${pendingBooking.guestName}</p>
    <p style="margin: 0.5rem 0; color: var(--white);"><strong>Email:</strong> ${pendingBooking.email}</p>
    <p style="margin: 0.5rem 0; color: var(--white);"><strong>Phone:</strong> ${pendingBooking.phone}</p>
    <p style="margin: 0.5rem 0; color: var(--white);"><strong>Room:</strong> ${pendingBooking.roomType}</p>
    <p style="margin: 0.5rem 0; color: var(--white);"><strong>Check-in:</strong> ${pendingBooking.checkIn}</p>
    <p style="margin: 0.5rem 0; color: var(--white);"><strong>Check-out:</strong> ${pendingBooking.checkOut}</p>
    <p style="margin: 0.5rem 0; color: var(--white);"><strong>Guests:</strong> ${pendingBooking.guests}</p>
    <p style="margin: 0.5rem 0; color: var(--white);"><strong>Nights:</strong> ${pendingBooking.nights}</p>
    <p style="margin: 0.5rem 0; color: var(--white);"><strong>Total Price:</strong> P${pendingBooking.totalPrice}</p>
  `;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const gcashNumber = '0917-123-4567'; // Your resort's GCash number
    const gcashRef = document.getElementById('gcash-ref').value.trim();

    if (overlay) overlay.classList.add('active');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';
    }

    const data = createBookingData(
      pendingBooking.guestName,
      pendingBooking.email,
      pendingBooking.phone,
      pendingBooking.checkIn,
      pendingBooking.checkOut,
      pendingBooking.guests,
      pendingBooking.roomType,
      pendingBooking.requests,
      gcashNumber,
      gcashRef,
      pendingBooking.nights,
      pendingBooking.pricePerNight,
      pendingBooking.totalPrice
    );

    try {
      const submissionPromise = submitBookingToRealtime(data);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      );
      const bookingRef = await Promise.race([submissionPromise, timeoutPromise]);
      alert(`🎉 Booking Confirmed!\n\nThank you for choosing Kamayan Beach Resort.\n\nYour booking has been successfully submitted.\nReference ID: ${bookingRef.key}\n\nYou will receive a confirmation email shortly with all the details.\n\nWe look forward to welcoming you!`);
      try {
        localStorage.removeItem('eresort_pending_booking');
      } catch (err) {
        console.warn('Could not clear pending booking:', err);
      }
      window.location.href = 'index.html';
    } catch (err) {
      console.error('Booking submission failed:', err);
      alert(`❌ Booking Failed\n\n${err.message}\n\nPlease ensure you are running the app on a web server (not file://) and that Firebase is accessible.`);
    } finally {
      if (overlay) overlay.classList.remove('active');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Complete Payment';
      }
    }
  });
});
