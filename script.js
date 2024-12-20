 let map;
    let markersArray = [];

    // Firebase Configuration
    const firebaseConfig = {
      apiKey: "AIzaSyDjkwSIZcaUg_oGQI3E4E-2XLix9c_jubo",
      authDomain: "amb-button-451ba.firebaseapp.com",
      databaseURL: "https://amb-button-451ba-default-rtdb.firebaseio.com",
      projectId: "amb-button-451ba",
      storageBucket: "amb-button-451ba.firebasestorage.app",
      messagingSenderId: "1039530574079",
      appId: "1:1039530574079:web:3d5a290ccfef2588a50cca",
      measurementId: "G-3T4NLT6DX6"
    };

    // Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig);
    const analytics = firebase.analytics();
    const auth = firebase.auth();
    const database = firebase.database();

    // Initialize Map
    function initMap() {
      const bounds = new google.maps.LatLngBounds();
      
      map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 55.53, lng: 9.4 },
        zoom: 10,
      });

      // Initialize services
      const geocoder = new google.maps.Geocoder();
      const service = new google.maps.DistanceMatrixService();
      
      // Set up Autocomplete for the search bar
      const input = document.getElementById("search-bar");
      const autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.bindTo("bounds", map);

      // Listen for place selection
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry || !place.geometry.location) {
          window.alert("No details available for input: '" + place.name + "'"); 
          return;
        }

        // Center the map on the selected place
        map.panTo(place.geometry.location);
        map.setZoom(14);

        // Clear out any old markers
        deleteMarkers();

        // Place a marker at the searched location
        markersArray.push(new google.maps.Marker({
          map: map,
          position: place.geometry.location,
        }));
      });

      // Distance Matrix request
      const origin1 = { lat: 24.9225, lng: 67.062 };
      const origin2 = "Karachi, Pakistan";
      const destinationA = "Punjab, Pakistan";
      const destinationB = { lat: 31.17, lng: 72.709 };
      const request = {
        origins: [origin1, origin2],
        destinations: [destinationA, destinationB],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
      };

      document.getElementById("request").innerText = JSON.stringify(request, null, 2);

      service.getDistanceMatrix(request).then((response) => {
        document.getElementById("response").innerText = JSON.stringify(response, null, 2);
        
        const originList = response.originAddresses;
        const destinationList = response.destinationAddresses;
        deleteMarkers();

        const showGeocodedAddressOnMap = (asDestination) => {
          const handler = ({ results }) => {
            map.fitBounds(bounds.extend(results[0].geometry.location));
            markersArray.push(
              new google.maps.Marker({
                map,
                position: results[0].geometry.location,
                label: asDestination ? "D" : "O",
              })
            );
          };
          return handler;
        };

        for (let i = 0; i < originList.length; i++) {
          const results = response.rows[i].elements;
          geocoder.geocode({ address: originList[i] }).then(showGeocodedAddressOnMap(false));
          for (let j = 0; j < results.length; j++) {
            geocoder.geocode({ address: destinationList[j] }).then(showGeocodedAddressOnMap(true));
          }
        }
      });

      // Add event listener to the "Center on My Location" button
      document.getElementById("my-location-btn").addEventListener("click", centerOnMyLocation);
    }

    // Function to center map on user's location
    function centerOnMyLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            // Center the map and add a marker at the user's location
            map.setCenter(userLocation);
            map.setZoom(14);

            // Clear out any old markers
            deleteMarkers();

            // Place a marker at the user's location
            markersArray.push(new google.maps.Marker({
              map: map,
              position: userLocation,
              label: "You",
            }));
          },
          () => {
            alert("Error: Unable to retrieve your location.");
          }
        );
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    }

    function deleteMarkers() {
      for (let i = 0; i < markersArray.length; i++) {
        markersArray[i].setMap(null);
      }
      markersArray = [];
    }

    window.initMap = initMap;