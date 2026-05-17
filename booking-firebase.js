import { database, firebaseTimestamp } from './firebase.js';
import { ref, push } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

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
    console.warn('Could not save booking to localStorage:', err);
  }
  return id;
}

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
  const form = document.getElementById('booking-form-element');
  if (!form) return;

  const isFileProtocol = window.location.protocol === 'file:';
  if (isFileProtocol) {
    console.log('File protocol detected - basic booking flow handled by booking.js');
  }

  const pendingBooking = JSON.parse(localStorage.getItem('eresort_pending_booking'));
  if (pendingBooking && !isFileProtocol && database) {
    console.log('Firebase available - will handle booking submission via payment page');
  }
});
