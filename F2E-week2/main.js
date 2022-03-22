const msg = document.querySelector('.alert-msg');
const selectCity = document.querySelector('#select-city');
let cityData = localStorage.getItem('PTXcity') ? JSON.parse(localStorage.getItem('PTXcity')) : [];
const stationData = {};
let map, markers;

(function renderDropdown() {
    let str = '<option value="location">現在位置</option>';
    if (cityData.length === 0) {
        let key = {headers: GetAuthorizationHeader()};
        axios.get('https://gist.motc.gov.tw/gist_api/V3/Map/Basic/City?$format=JSON', key).then(res => {
            localStorage.setItem('PTXcity', JSON.stringify(res.data));
            res.data.forEach(el => {
                str += `<option value="${el.City}">${el.CityName}</option>`
            });
            selectCity.innerHTML = str;
        });
    } else {
        cityData.forEach(el => {
            str += `<option value="${el.City}">${el.CityName}</option>`
        });
        selectCity.innerHTML = str;
    }
})();

document.querySelector('#load-map').addEventListener('click', () => {
    renderMap();
    renderStationMark();
});

function renderMap() {
    document.querySelector('#index-main').classList.add('d-none');
    document.querySelector('#map').classList.remove('d-none');
    document.querySelector('#navbarSupportedContent > ul').classList.remove('d-none');
    map = L.map('map').setView([23.4, 120.9], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    markers = new L.MarkerClusterGroup().addTo(map);
}

function renderStationMark() {
    const city = ['Taichung','Hsinchu','MiaoliCounty','NewTaipei','PingtungCounty','KinmenCounty','Taoyuan','Taipei','Kaohsiung','Tainan','Chiayi'];
    let key = {headers: GetAuthorizationHeader()};
    city.forEach(el => {
        axios.get(`https://ptx.transportdata.tw/MOTC/v2/Bike/Station/${el}?$format=JSON`, key)
        .then(res => {
            stationData[el] = res.data;
            res.data.forEach(item => {
                markers.addLayer(
                    L.marker([item.StationPosition.PositionLat, item.StationPosition.PositionLon], {icon: greenIcon})
                    .bindPopup(`<b>${(item.StationName.Zh_tw).split('_')[1]}</b><br />${item.BikesCapacity}`)
                );
            });
            map.addLayer(markers);
        });
    });
}

function getLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(pos => {
            let lon = pos.coords.longitude;
            let lat = pos.coords.latitude;
            if (lo) {
                return [lon, lat];
            }
        })
    }
}

function setViewPoint(location, zoom=13) {
    map.setView(location, zoom);
}

document.querySelector('#search').addEventListener('click', () => {
    const type = document.querySelector('[name=btnradio]:checked');
    msg.innerHTML = '';
    if (selectCity.value === 'location') {
        console.log('in');
        let location = getLocation();
        if(!location) {
            msg.innerHTML = `
            <div class="alert alert-warning slide-out text-center" role="alert">
            無法取得您的位置資訊
            </div>`;
        } else {
            //type.value === 'Station' ? getAreaStation(location) : getAreaRoad(location);
        }
    } else {
        type.value === 'Station' ? console.log(stationData[selectCity.value]) : getCityRoad(selectCity.value);
    }
})



function getCityRoad(city='Taipei') {
    const url = `https://ptx.transportdata.tw/MOTC/v2/Cycling/Shape/${city}?$top=30&$format=JSON`;
    msg.innerHTML = '';
    let key = {headers: GetAuthorizationHeader()};
    axios.get(url, key).then(res => {
        let lineString = res.data[0].Geometry.replace('MULTILINESTRING ((', '').replaceAll(',', ' ').replaceAll('(','').replaceAll(')','').split(' ');
        let lineData = [];
        lineString.forEach((el, index) => {
            if (index % 2 == 0) {
                lineData.push([lineString[index+1], lineString[index]]);
            }
        })
        setViewPoint(lineData[0], 20);
        drawMapLine(lineData);
    }).catch(() => {
        msg.innerHTML = `
        <div class="alert alert-warning" role="alert">
        抱歉！此地區無相關資料
        </div>`;
    })
}

function getAreaStation(location) {
    const url = `https://ptx.transportdata.tw/MOTC/v2/Bike/Station/NearBy?$top=30&$spatialFilter=nearby(${location[0]}%2C%20${location[1]}%2C%201000)&$format=JSON`;
    msg.innerHTML = '';
    let key = {headers: GetAuthorizationHeader()};
    axios.get(url, key).then(res => {
        res.data.forEach(el => {
            drawMapMarker(
                [el.StationPosition.PositionLat, el.StationPosition.PositionLon],
                [(el.StationName.Zh_tw).split('_')[1], el.BikesCapacity]
            );
        });
        //setViewPoint([res.data[0].StationPosition.PositionLat, res.data[0].StationPosition.PositionLon]);
    }).catch((error) => {
        msg.innerHTML = `
        <div class="alert alert-warning" role="alert">
        抱歉！此地區無相關資料
        </div>`;
        console.log(error);
    })
}

function getAreaRoad(location) {
    const url = `https://ptx.transportdata.tw/MOTC/v2/Bike/Station/NearBy?$top=30&$spatialFilter=nearby(${location}%2C%20121.517055%2C%20100)&$format=JSON`;
    msg.innerHTML = '';
    let key = {headers: GetAuthorizationHeader()};
    axios.get(url, key).then(res => {
        let la = res.data[0].StationPosition.PositionLat;
        let lo = res.data[0].StationPosition.PositionLon;
        setViewPoint([la, lo]);
    }).catch((error) => {
        msg.innerHTML = `
        <div class="alert alert-warning" role="alert">
        抱歉！此地區無相關資料
        </div>`;
        console.log(error);
    })
}

function drawMapLine(data) {
    L.polyline(data, {color: 'red', weight: 2}).addTo(map);
}
const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

function drawMapObjects(data) {
    

    L.circle([51.508, -0.11], 500, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5
    }).addTo(map).bindPopup("I am a circle.");

    L.polygon([
        [51.509, -0.08],
        [51.503, -0.06],
        [51.51, -0.047]
    ]).addTo(map).bindPopup("I am a polygon.");


    var popup = L.popup();

    function onMapClick(e) {
        popup
            .setLatLng(e.latlng)
            .setContent("You clicked the map at " + e.latlng.toString())
            .openOn(map);
    }

    map.on('click', onMapClick);
}

function renderCardInfo(data) {

}

function GetAuthorizationHeader() {
    var AppID = '3b0e6aa170094b42bf5016bc66ca88b9';
    var AppKey = '9STPZ0hk8jV8zN22Xah1fLDcUYE';

    var GMTString = new Date().toGMTString();
    var ShaObj = new jsSHA('SHA-1', 'TEXT');
    ShaObj.setHMACKey(AppKey, 'TEXT');
    ShaObj.update('x-date: ' + GMTString);
    var HMAC = ShaObj.getHMAC('B64');
    var Authorization = 'hmac username=\"' + AppID + '\", algorithm=\"hmac-sha1\", headers=\"x-date\", signature=\"' + HMAC + '\"';

    return { 'Authorization': Authorization, 'X-Date': GMTString /*,'Accept-Encoding': 'gzip'*/}; //如果要將js運行在伺服器，可額外加入 'Accept-Encoding': 'gzip'，要求壓縮以減少網路傳輸資料量
}