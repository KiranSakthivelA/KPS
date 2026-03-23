// ============================================================
// FORM SUBMISSION HELPER
// ============================================================
const showToast = (message, isSuccess = true) => {
    // Remove any existing toast
    const existing = document.getElementById('kps-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'kps-toast';
    toast.style.cssText = `
        position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
        background: ${isSuccess ? '#2ecc71' : '#e74c3c'}; color: white;
        padding: 1rem 2rem; border-radius: 8px; font-size: 1rem;
        font-family: 'Outfit', sans-serif; font-weight: 600;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 9999;
        animation: fadeInUp 0.4s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
};

const submitInquiry = async (data, button) => {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    button.disabled = true;

    try {
        const response = await fetch('api/submit_inquiry.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showToast('✅ Enquiry sent! We will contact you shortly.');
            return true;
        } else {
            throw new Error('Server responded with error');
        }
    } catch (error) {
        console.error("Submission error:", error);
        showToast('❌ Something went wrong. Please call us directly.', false);
        return false;
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
};

// ============================================================
// DOM READY
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

    // --- Auto-fill today's date and current time ---
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const timeStr = `${hh}:${min}`;
    ['qb-date', 'mb-date'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = todayStr;
    });
    ['qb-time', 'mb-time'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = timeStr;
    });

    // --- Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navLinksList = document.getElementById('nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinksList.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinksList.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-xmark');
            } else {
                icon.classList.replace('fa-xmark', 'fa-bars');
            }
        });
    }

    // Close mobile menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinksList && navLinksList.classList.contains('active')) {
                navLinksList.classList.remove('active');
                if (mobileMenuBtn) {
                    mobileMenuBtn.querySelector('i').classList.replace('fa-xmark', 'fa-bars');
                }
            }
        });
    });

    // --- Scroll Reveals ---
    const reveals = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        reveals.forEach(reveal => {
            if (reveal.getBoundingClientRect().top < windowHeight - 100) {
                reveal.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    // --- Smart Pre-selection for Fleet Booking ---
    const bookBtns = document.querySelectorAll('.book-btn');
    const contactSection = document.getElementById('contact');
    const carSelect = document.getElementById('mb-car');

    bookBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const carType = btn.getAttribute('data-car');
            if (carSelect) carSelect.value = carType;
            if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // --- ESTIMATE LOGIC (NOMINATIM + OSRM) ---
    const CAR_RATES = {
        'Sedan': {
            oneWay: 14,
            roundTrip: 13,
            minOneWay: 130,
            minRoundTrip: 250,
            driverAllowance: 400
        },
        'SUV': {
            oneWay: 19,
            roundTrip: 18,
            minOneWay: 130,
            minRoundTrip: 250,
            driverAllowance: 400
        },
        'Innova Crysta': {
            oneWay: 23,
            roundTrip: 21,
            minOneWay: 130,
            minRoundTrip: 250,
            driverAllowance: 400
        }
    };

    const getCoordinates = async (cityName) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`);
            const data = await res.json();
            if (data && data.length > 0) {
                return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            }
            return null;
        } catch (e) {
            console.error("Geocoding error:", e);
            return null;
        }
    };

    const getDrivingDistance = async (lat1, lon1, lat2, lon2) => {
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${lon1.toFixed(6)},${lat1.toFixed(6)};${lon2.toFixed(6)},${lat2.toFixed(6)}?overview=false`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (data && data.routes && data.routes.length > 0) {
                    return (data.routes[0].distance / 1000) * 1.05; 
                }
            }
        } catch (e) {
            console.error("Routing error from OSRM:", e);
        }
        
        // Fallback
        const R = 6371; 
        const dLat = (lat2 - lat1) * Math.PI / 180;  
        const dLon = (lon2 - lon1) * Math.PI / 180; 
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        return R * c * 1.35; 
    };

    // Calculate Distance and Fare
    const calculateEstimate = async (pickup, drop, carType, tripType, elements) => {
        if (!pickup || !drop || !carType) {
            elements.error.textContent = "Please fill in all details to get an estimate.";
            elements.error.style.display = 'block';
            return;
        }
        
        elements.btnEstimate.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Calculating...';
        elements.btnEstimate.disabled = true;
        elements.error.style.display = 'none';

        const pickupCoords = await getCoordinates(pickup);
        await new Promise(r => setTimeout(r, 600)); // Nominatim: 1 req/sec
        const dropCoords = await getCoordinates(drop);

        if (!pickupCoords || !dropCoords) {
            elements.btnEstimate.innerHTML = 'Get Estimate <i class="fa-solid fa-calculator"></i>';
            elements.btnEstimate.disabled = false;
            elements.error.textContent = "Could not locate one or both cities. Check spelling.";
            elements.error.style.display = 'block';
            return;
        }

        let distanceValue = await getDrivingDistance(pickupCoords.lat, pickupCoords.lon, dropCoords.lat, dropCoords.lon);
        
        // If it's a round trip, driving distance is technically double
        if (tripType === 'Round Trip') {
            distanceValue *= 2;
        }

        elements.btnEstimate.innerHTML = 'Get Estimate <i class="fa-solid fa-calculator"></i>';
        elements.btnEstimate.disabled = false;

        const rateProfile = CAR_RATES[carType];
        
        let fare = 0;
        let billableDistance = distanceValue;
        
        if (tripType === 'One Way') {
            billableDistance = Math.max(distanceValue, rateProfile.minOneWay);
            fare = (billableDistance * rateProfile.oneWay) + rateProfile.driverAllowance;
        } else {
            // Round Trip
            billableDistance = Math.max(distanceValue, rateProfile.minRoundTrip);
            fare = (billableDistance * rateProfile.roundTrip) + rateProfile.driverAllowance;
        }

        fare = Math.round(fare);

        elements.distance.textContent = Math.round(distanceValue) + ' km (' + tripType + ')';
        elements.fare.textContent = '₹' + fare.toLocaleString('en-IN') + ' *';
        elements.box.style.display = 'block';
        
        elements.btnEstimate.style.display = 'none';
        elements.btnConfirm.style.display = 'block';
    };

    // --- Quick Quote Form (Hero Section) ---
    const quickForm = document.getElementById('quick-booking-form');
    if (quickForm) {
        const els = {
            box: document.getElementById('qb-estimate-box'),
            distance: document.getElementById('qb-distance'),
            fare: document.getElementById('qb-fare'),
            error: document.getElementById('qb-error'),
            btnEstimate: document.getElementById('qb-btn-estimate'),
            btnConfirm: document.getElementById('qb-btn-confirm')
        };

        // Cache last computed raw distance (one-way km) for instant recalc
        let qbCachedRawKm = null;

        const qbRecalcFare = () => {
            if (qbCachedRawKm === null) return;
            const car = document.getElementById('qb-car').value;
            const tripType = document.querySelector('input[name="qb-trip-type"]:checked').value;
            if (!car) return;
            const rateProfile = CAR_RATES[car];
            let distanceValue = qbCachedRawKm;
            if (tripType === 'Round Trip') distanceValue *= 2;
            let billableDistance = tripType === 'One Way'
                ? Math.max(distanceValue, rateProfile.minOneWay)
                : Math.max(distanceValue, rateProfile.minRoundTrip);
            let fare = Math.round((billableDistance * (tripType === 'One Way' ? rateProfile.oneWay : rateProfile.roundTrip)) + rateProfile.driverAllowance);
            els.distance.textContent = Math.round(distanceValue) + ' km (' + tripType + ')';
            els.fare.textContent = '\u20b9' + fare.toLocaleString('en-IN') + ' *';
        };

        els.btnEstimate.addEventListener('click', async () => {
            const pickup = document.getElementById('qb-pickup').value.trim();
            const drop = document.getElementById('qb-drop').value.trim();
            const car = document.getElementById('qb-car').value;
            const tripType = document.querySelector('input[name="qb-trip-type"]:checked').value;
            // Store raw one-way km in cache after calculation
            const origDistance = els.distance;
            await calculateEstimate(pickup, drop, car, tripType, els);
            // Parse the displayed km back to store as raw one-way distance
            const kmText = els.distance.textContent;
            const km = parseInt(kmText);
            if (!isNaN(km)) {
                qbCachedRawKm = tripType === 'Round Trip' ? km / 2 : km;
            }
        });

        // Reset if city/date/time inputs change (need to re-fetch route)
        ['qb-pickup', 'qb-drop', 'qb-date', 'qb-time'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => {
                    qbCachedRawKm = null;
                    els.box.style.display = 'none';
                    els.btnConfirm.style.display = 'none';
                    els.btnEstimate.style.display = 'block';
                    els.error.style.display = 'none';
                });
            }
        });

        // Car type change: instantly recalc fare if we already have a distance
        document.getElementById('qb-car').addEventListener('change', () => {
            if (qbCachedRawKm !== null && els.box.style.display !== 'none') {
                qbRecalcFare();
            } else {
                els.box.style.display = 'none';
                els.btnConfirm.style.display = 'none';
                els.btnEstimate.style.display = 'block';
                els.error.style.display = 'none';
            }
        });
        
        // Trip type change: instantly recalc fare if we already have a distance
        document.querySelectorAll('input[name="qb-trip-type"]').forEach(radio => {
            radio.addEventListener('change', () => {
                if (qbCachedRawKm !== null && els.box.style.display !== 'none') {
                    qbRecalcFare();
                } else {
                    els.box.style.display = 'none';
                    els.btnConfirm.style.display = 'none';
                    els.btnEstimate.style.display = 'block';
                    els.error.style.display = 'none';
                }
            });
        });

        quickForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tripType = document.querySelector('input[name="qb-trip-type"]:checked').value;
            const data = {
                name: document.getElementById('qb-name').value.trim(),
                phone: document.getElementById('qb-phone').value.trim(),
                pickup: document.getElementById('qb-pickup').value.trim(),
                drop: document.getElementById('qb-drop').value.trim(),
                car: document.getElementById('qb-car').value,
                date: document.getElementById('qb-date').value + " " + document.getElementById('qb-time').value,
                message: `Trip: ${tripType}, Estimated distance: ${els.distance.textContent}, Fare: ${els.fare.textContent}`,
                formType: 'Quick Quote'
            };
            const success = await submitInquiry(data, els.btnConfirm);
            if (success) {
                // Formatting WhatsApp message
                const waText = encodeURIComponent(`*New Booking Enquiry*\nName: ${data.name}\nPhone: ${data.phone}\nFrom: ${data.pickup}\nTo: ${data.drop}\nTrip: ${document.querySelector('input[name="qb-trip-type"]:checked').value}\nCar: ${data.car}\nDate: ${data.date}\nEstimate: ${els.fare.textContent}\nDistance: ${els.distance.textContent}`);
                window.open(`https://wa.me/919442173548?text=${waText}`, '_blank');
                quickForm.reset();
                els.box.style.display = 'none';
                els.btnConfirm.style.display = 'none';
                els.btnEstimate.style.display = 'block';
            }
        });
    }

    // --- Main Booking Form (Contact Section) ---
    const mainForm = document.getElementById('main-booking-form');
    if (mainForm) {
        const els = {
            box: document.getElementById('mb-estimate-box'),
            distance: document.getElementById('mb-distance'),
            fare: document.getElementById('mb-fare'),
            error: document.getElementById('mb-error'),
            btnEstimate: document.getElementById('mb-btn-estimate'),
            btnConfirm: document.getElementById('mb-btn-confirm')
        };

        // Cache last computed raw distance (one-way km) for instant recalc
        let mbCachedRawKm = null;

        const mbRecalcFare = () => {
            if (mbCachedRawKm === null) return;
            const car = document.getElementById('mb-car').value;
            const tripType = document.querySelector('input[name="mb-trip-type"]:checked').value;
            if (!car) return;
            const rateProfile = CAR_RATES[car];
            let distanceValue = mbCachedRawKm;
            if (tripType === 'Round Trip') distanceValue *= 2;
            let billableDistance = tripType === 'One Way'
                ? Math.max(distanceValue, rateProfile.minOneWay)
                : Math.max(distanceValue, rateProfile.minRoundTrip);
            let fare = Math.round((billableDistance * (tripType === 'One Way' ? rateProfile.oneWay : rateProfile.roundTrip)) + rateProfile.driverAllowance);
            els.distance.textContent = Math.round(distanceValue) + ' km (' + tripType + ')';
            els.fare.textContent = '\u20b9' + fare.toLocaleString('en-IN') + ' *';
        };

        els.btnEstimate.addEventListener('click', async () => {
            const pickup = document.getElementById('mb-pickup').value.trim();
            const drop = document.getElementById('mb-drop').value.trim();
            const car = document.getElementById('mb-car').value;
            const tripType = document.querySelector('input[name="mb-trip-type"]:checked').value;
            await calculateEstimate(pickup, drop, car, tripType, els);
            const km = parseInt(els.distance.textContent);
            if (!isNaN(km)) {
                mbCachedRawKm = tripType === 'Round Trip' ? km / 2 : km;
            }
        });

        // Reset if city/date/time inputs change
        ['mb-pickup', 'mb-drop', 'mb-date', 'mb-time'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => {
                    mbCachedRawKm = null;
                    els.box.style.display = 'none';
                    els.btnConfirm.style.display = 'none';
                    els.btnEstimate.style.display = 'block';
                    els.error.style.display = 'none';
                });
            }
        });

        // Car type change: instantly recalc fare, no need to re-fetch route
        document.getElementById('mb-car').addEventListener('change', () => {
            if (mbCachedRawKm !== null && els.box.style.display !== 'none') {
                mbRecalcFare();
            } else {
                els.box.style.display = 'none';
                els.btnConfirm.style.display = 'none';
                els.btnEstimate.style.display = 'block';
                els.error.style.display = 'none';
            }
        });

        // Trip type change: instantly recalc fare
        document.querySelectorAll('input[name="mb-trip-type"]').forEach(radio => {
            radio.addEventListener('change', () => {
                if (mbCachedRawKm !== null && els.box.style.display !== 'none') {
                    mbRecalcFare();
                } else {
                    els.box.style.display = 'none';
                    els.btnConfirm.style.display = 'none';
                    els.btnEstimate.style.display = 'block';
                    els.error.style.display = 'none';
                }
            });
        });

        mainForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tripType = document.querySelector('input[name="mb-trip-type"]:checked').value;
            const data = {
                name: document.getElementById('mb-name').value.trim(),
                phone: document.getElementById('mb-phone').value.trim(),
                pickup: document.getElementById('mb-pickup').value.trim(),
                drop: document.getElementById('mb-drop').value.trim(),
                car: document.getElementById('mb-car').value,
                date: document.getElementById('mb-date').value + " " + document.getElementById('mb-time').value,
                message: `Trip: ${tripType}, Estimated distance: ${els.distance.textContent}, Fare: ${els.fare.textContent}. Note: ` + document.getElementById('mb-message').value.trim(),
                formType: 'Booking Request'
            };
            const success = await submitInquiry(data, els.btnConfirm);
            if (success) {
                // Formatting WhatsApp message
                const waText = encodeURIComponent(`*New Full Booking*\nName: ${data.name}\nPhone: ${data.phone}\nDate: ${data.date}\nFrom: ${data.pickup}\nTo: ${data.drop}\nTrip: ${tripType}\nCar: ${data.car}\nEstimate: ${els.fare.textContent}\nDistance: ${els.distance.textContent}\nNote: ${document.getElementById('mb-message').value.trim()}`);
                window.open(`https://wa.me/919442173548?text=${waText}`, '_blank');
                mainForm.reset();
                els.box.style.display = 'none';
                els.btnConfirm.style.display = 'none';
                els.btnEstimate.style.display = 'block';
            }
        });
    }
});
