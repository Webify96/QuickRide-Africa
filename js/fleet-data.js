/* ─────────────────────────────────────────────────────────────────────────
   QuickRide Africa — Fleet image registry
   To add a new photo: append one object to FLEET_IMAGES, then commit.
   Both fleet.html and index.html render from this list automatically.
───────────────────────────────────────────────────────────────────────── */

var FLEET_IMAGES = [
  { src: 'img/5.jpeg',  alt: 'Mercedes-Benz S-Class executive sedan - QuickRide Africa',               label: 'S-Class Executive Sedan' },
  { src: 'img/1.jpeg',  alt: 'Range Rover executive SUV - QuickRide Africa',                           label: 'Range Rover SUV' },
  { src: 'img/2.jpeg',  alt: 'Mercedes-Benz G-Class AMG - QuickRide Africa',                          label: 'G-Class AMG Executive SUV' },
  { src: 'img/3.jpeg',  alt: 'Mercedes-Benz G-Class Johannesburg - QuickRide Africa',                 label: 'G-Class · Johannesburg' },
  { src: 'img/4.jpeg',  alt: 'Mercedes-Benz G-Class rear - QuickRide Africa corporate transport',     label: 'G-Class Executive SUV' },
  { src: 'img/6.jpeg',  alt: 'Mercedes-Benz V-Class executive MPV - QuickRide Africa',                label: 'V-Class Executive MPV' },
  { src: 'img/7.jpeg',  alt: 'Hyundai Staria executive MPV - QuickRide Africa',                       label: 'Hyundai Staria MPV' },
  { src: 'img/8.jpeg',  alt: 'Mercedes-Benz luxury coach - QuickRide Africa group transport',         label: 'Luxury Coach' },
  { src: 'img/9.jpeg',  alt: 'Mercedes-Benz GLE executive SUV - QuickRide Africa',                    label: 'GLE Executive SUV' },
  { src: 'img/10.jpeg', alt: 'Luxury leather rear cabin interior - QuickRide Africa',                 label: 'Luxury Interior' },
  { src: 'img/11.jpeg', alt: 'Mercedes-Benz Sprinter executive van - QuickRide Africa',               label: 'Sprinter Executive Van' },
  { src: 'img/12.jpeg', alt: 'BMW 7 Series luxury sedan Cape Town - QuickRide Africa',                label: 'BMW 7 Series · Cape Town' },
  { src: 'img/13.jpeg', alt: 'BMW X7 SUV and Mercedes-Benz V-Class - QuickRide Africa fleet',        label: 'BMW X7 & V-Class' },
  { src: 'img/14.jpeg', alt: 'BMW X7 executive SUV with chauffeur - QuickRide Africa',                label: 'BMW X7 Executive SUV' },
  { src: 'img/15.jpeg', alt: 'BMW X7 rear cabin with refreshments - QuickRide Africa',                label: 'Executive Cabin Amenities' },
  { src: 'img/16.jpeg', alt: 'BMW X7 rear cabin leather interior - QuickRide Africa',                 label: 'BMW X7 Rear Cabin' },
  { src: 'img/17.jpeg', alt: 'Mercedes-Benz S-Class rear cabin with tablet screens - QuickRide Africa', label: 'Mercedes-Benz S-Class Cabin' }
];

function buildFleetCards(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = FLEET_IMAGES.map(function (item) {
    return '<div class="fleet-card" role="listitem">' +
      '<img src="' + item.src + '" alt="' + item.alt + '" class="fleet-card__img" loading="lazy">' +
      '<div class="fleet-card__label">' + item.label + '</div>' +
      '</div>';
  }).join('');
}
