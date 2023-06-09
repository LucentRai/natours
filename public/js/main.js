require("core-js/modules/es.regexp.flags.js");
require("core-js/modules/web.immediate.js");
require("regenerator-runtime/runtime");
var $jqtH7$axios = require("axios");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}




async function $70af9284e599e604$export$596d806903d1f59e(email, password) {
    try {
        const result = await (0, ($parcel$interopDefault($jqtH7$axios)))({
            method: "POST",
            url: "http://localhost:8000/api/v1/users/login",
            data: {
                email: email,
                password: password
            }
        });
        if (result.data.status === "success") location.assign("/");
    } catch (error) {
        console.log(error.response.data);
        alert(error.response.data.message); // response.data is the response from server (read axios docs)
    }
}


function $f60945d37f8e594c$export$4c5dd147b21b9176(locations) {
    mapboxgl.accessToken = "pk.eyJ1IjoibHVjZW50LXJhaSIsImEiOiJjbGhuN3B1bXAxamZuM21waGI5OG5jbGlvIn0.Xef5oLU5PiFGXsaSLyzuZQ";
    var map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/lucent-rai/clhn7vmho01oa01pr9qq98jy5",
        scrollZoom: false
    });
    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach((location)=>{
        // Create Marker
        const element = document.createElement("div");
        element.className = "marker";
        // Add Market
        new mapboxgl.Marker({
            element: element,
            anchor: "bottom"
        }).setLngLat(location.coordinates).addTo(map);
        // Add popup
        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(location.coordinates).setHTML(`<p>Day ${location.day}: ${location.description}</p>`).addTo(map);
        // Extends map bounds to include current location
        bounds.extend(location.coordinates);
    });
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
}


console.log("Hello World");
// DOM ELEMENTS
const $d0f7ce18c37ad6f6$var$mapBox = document.getElementById("map");
// VALUES
const $d0f7ce18c37ad6f6$var$email = document.getElementById("email").value;
const $d0f7ce18c37ad6f6$var$password = document.getElementById("password").value;
// DELEGATION
if ($d0f7ce18c37ad6f6$var$mapBox) {
    const locations = JSON.parse($d0f7ce18c37ad6f6$var$mapBox.dataset.locations);
    (0, $f60945d37f8e594c$export$4c5dd147b21b9176)(locations);
}
document.querySelector(".form").addEventListener("submit", (e)=>{
    e.preventDefault();
    (0, $70af9284e599e604$export$596d806903d1f59e)($d0f7ce18c37ad6f6$var$email, $d0f7ce18c37ad6f6$var$password);
});


//# sourceMappingURL=main.js.map
