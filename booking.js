document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('booking-form-element');
  const reviewModal = document.getElementById('booking-review-modal');
  const confirmBtn = document.getElementById('booking-confirm-btn');
  const editBtn = document.getElementById('booking-edit-btn');

  if (!form) {
    console.error('Booking form not found');
    return;
  }

  function parsePriceForRoom(roomType) {
    const prices = {
      standard: 499,
      deluxe: 699,
      family: 799
    };
    return prices[roomType] || 0;
  }

  function calcNights(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const guestName = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const checkIn = document.getElementById('arrival').value;
    const checkOut = document.getElementById('departure').value;
    const guests = document.getElementById('guests').value;
    const roomType = document.getElementById('room-type').value;
    const requests = document.getElementById('requests').value.trim();

    if (!guestName || !email || !phone || !checkIn || !checkOut || !guests || !roomType) {
      alert('Please fill in all required fields');
      return;
    }

    const nights = calcNights(checkIn, checkOut);
    const pricePerNight = parsePriceForRoom(roomType);
    const totalPrice = nights * pricePerNight;

    if (reviewModal) {
      document.getElementById('reviewGuestName').textContent = guestName || '-';
      document.getElementById('reviewEmail').textContent = email || '-';
      document.getElementById('reviewPhone').textContent = phone || '-';
      document.getElementById('reviewRoomType').textContent = roomType || '-';
      document.getElementById('reviewCheckIn').textContent = checkIn || '-';
      document.getElementById('reviewCheckOut').textContent = checkOut || '-';
      document.getElementById('reviewNights').textContent = nights || 0;
      document.getElementById('reviewPricePerNight').textContent = pricePerNight ? `P${pricePerNight}` : '-';
      document.getElementById('reviewTotalPrice').textContent = totalPrice ? `P${totalPrice}` : '-';
      reviewModal.style.display = 'flex';
    }

    if (editBtn) {
      editBtn.onclick = (ev) => {
        ev.preventDefault();
        reviewModal.style.display = 'none';
      };
    }

    if (confirmBtn) {
      confirmBtn.onclick = (ev) => {
        ev.preventDefault();
        const pendingBooking = {
          guestName,
          email,
          phone,
          checkIn,
          checkOut,
          guests,
          roomType,
          requests,
          nights,
          pricePerNight,
          totalPrice
        };
        try {
          localStorage.setItem('eresort_pending_booking', JSON.stringify(pendingBooking));
          console.log('Booking saved to localStorage, redirecting to payment');
        } catch (err) {
          console.warn('Could not save to localStorage:', err);
        }
        window.location.href = 'payment.html';
      };
    }
  });
});
