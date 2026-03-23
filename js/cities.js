// js/cities.js

const southIndianCities = [
    // Tamil Nadu (Extensive)
    "Chennai, Tamil Nadu", "Coimbatore, Tamil Nadu", "Madurai, Tamil Nadu", "Tiruchirappalli, Tamil Nadu", 
    "Salem, Tamil Nadu", "Tirunelveli, Tamil Nadu", "Tiruppur, Tamil Nadu", "Vellore, Tamil Nadu", 
    "Erode, Tamil Nadu", "Thoothukudi, Tamil Nadu", "Dindigul, Tamil Nadu", "Thanjavur, Tamil Nadu", 
    "Ranipet, Tamil Nadu", "Sivakasi, Tamil Nadu", "Karur, Tamil Nadu", "Ooty, Tamil Nadu", 
    "Kodaikanal, Tamil Nadu", "Kanyakumari, Tamil Nadu", "Rameshwaram, Tamil Nadu", "Kancheepuram, Tamil Nadu",
    "Nagercoil, Tamil Nadu", "Cuddalore, Tamil Nadu", "Kumbakonam, Tamil Nadu", "Rajapalayam, Tamil Nadu",
    "Pudukkottai, Tamil Nadu", "Hosur, Tamil Nadu", "Ambur, Tamil Nadu", "Karaikudi, Tamil Nadu", 
    "Neyveli, Tamil Nadu", "Nagapattinam, Tamil Nadu", "Viluppuram, Tamil Nadu", "Tiruvannamalai, Tamil Nadu",
    "Pollachi, Tamil Nadu", "Gudiyatham, Tamil Nadu", "Vaniyambadi, Tamil Nadu", "Tenkasi, Tamil Nadu",

    // Kerala (Extensive)
    "Thiruvananthapuram, Kerala", "Kochi, Kerala", "Kozhikode, Kerala", "Kollam, Kerala", 
    "Thrissur, Kerala", "Kannur, Kerala", "Alappuzha, Kerala", "Palakkad, Kerala", 
    "Malappuram, Kerala", "Manjeri, Kerala", "Munnar, Kerala", "Wayanad, Kerala",
    "Kottayam, Kerala", "Kasaragod, Kerala", "Pathanamthitta, Kerala", "Idukki, Kerala",
    "Thalassery, Kerala", "Ponnani, Kerala", "Vatakara, Kerala", "Kanhangad, Kerala",
    "Payyanur, Kerala", "Koyilandy, Kerala", "Neyyattinkara, Kerala", "Taliparamba, Kerala",

    // Karnataka (Extensive)
    "Bengaluru, Karnataka", "Mysuru, Karnataka", "Hubballi-Dharwad, Karnataka", "Mangaluru, Karnataka", 
    "Belagavi, Karnataka", "Kalaburagi, Karnataka", "Davanagere, Karnataka", "Ballari, Karnataka", 
    "Vijayapura, Karnataka", "Shivamogga, Karnataka", "Tumakuru, Karnataka", "Udupi, Karnataka", 
    "Coorg, Karnataka", "Raichur, Karnataka", "Bidar, Karnataka", "Hospet, Karnataka",
    "Gadag-Betageri, Karnataka", "Robertsonpet, Karnataka", "Hassan, Karnataka", "Bhadravati, Karnataka",
    "Chitradurga, Karnataka", "Kolar, Karnataka", "Mandya, Karnataka", "Chikkamagaluru, Karnataka",
    "Gangavati, Karnataka", "Bagalkot, Karnataka", "Ranebennuru, Karnataka",

    // Andhra Pradesh (Extensive)
    "Visakhapatnam, Andhra Pradesh", "Vijayawada, Andhra Pradesh", "Guntur, Andhra Pradesh", 
    "Nellore, Andhra Pradesh", "Kurnool, Andhra Pradesh", "Rajahmundry, Andhra Pradesh", 
    "Tirupati, Andhra Pradesh", "Kakinada, Andhra Pradesh", "Kadapa, Andhra Pradesh", 
    "Anantapur, Andhra Pradesh", "Eluru, Andhra Pradesh", "Vizianagaram, Andhra Pradesh",
    "Ongole, Andhra Pradesh", "Nandyal, Andhra Pradesh", "Machilipatnam, Andhra Pradesh",
    "Adoni, Andhra Pradesh", "Tenali, Andhra Pradesh", "Proddatur, Andhra Pradesh",
    "Chittoor, Andhra Pradesh", "Hindupur, Andhra Pradesh", "Bhimavaram, Andhra Pradesh",
    "Madanapalle, Andhra Pradesh", "Guntakal, Andhra Pradesh", "Srikakulam, Andhra Pradesh",
    "Dharmavaram, Andhra Pradesh", "Gudivada, Andhra Pradesh", "Narasaraopet, Andhra Pradesh",

    // Telangana (Extensive)
    "Hyderabad, Telangana", "Warangal, Telangana", "Nizamabad, Telangana", "Karimnagar, Telangana", 
    "Ramagundam, Telangana", "Khammam, Telangana", "Mahbubnagar, Telangana", "Nalgonda, Telangana", 
    "Adilabad, Telangana", "Suryapet, Telangana", "Miryalaguda, Telangana", "Siddipet, Telangana",
    "Jagtial, Telangana", "Mancherial, Telangana", "Kothagudem, Telangana", "Bodhan, Telangana",
    "Palwancha, Telangana", "Mandamarri, Telangana", "Koratla, Telangana", "Zahirabad, Telangana",
    "Sangareddy, Telangana", "Wanaparthy, Telangana", "Kagaznagar, Telangana", "Jangaon, Telangana"
];

const loadCities = async () => {
    // Create the datalist element
    const list = document.createElement("datalist");
    list.id = "city-list";
    document.body.appendChild(list);

    let fetchedAny = false;
    const states = ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana"];

    try {
        // Fetch all cities dynamically via countriesnow API
        const promises = states.map(async (state) => {
            const res = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ country: "India", state: state })
            });

            if (!res.ok) throw new Error("API response not OK");

            const data = await res.json();
            if (data && data.data && data.data.length > 0) {
                // To avoid blocking the UI, we batch DOM appends using fragment
                const fragment = document.createDocumentFragment();
                data.data.forEach(city => {
                    const option = document.createElement("option");
                    // countriesnow returns "Coimbatore" for example
                    option.value = `${city}, ${state}`;
                    fragment.appendChild(option);
                });
                list.appendChild(fragment);
                fetchedAny = true;
            }
        });
        
        // Timeout safeguard
        await Promise.race([
            Promise.all(promises),
            new Promise(resolve => setTimeout(resolve, 3500))
        ]);

    } catch (e) {
        console.warn("Failed to retrieve real-time data from API, defaulting to the robust static list.", e);
    }

    // Fallback if API fails or blocks CORS (loads local list instantly)
    if (!fetchedAny || list.options.length < 50) {
        list.innerHTML = '';
        southIndianCities.forEach(city => {
            const val = document.createElement("option");
            val.value = city;
            list.appendChild(val);
        });
    }
};

document.addEventListener("DOMContentLoaded", loadCities);
