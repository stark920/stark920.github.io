// 公車站點資料存到本地端
const cityList = [
    {ch: '台北市', en:'Taipei'},
    {ch: '新北市', en:'NewTaipei'},
    {ch: '高雄市', en:'Kaohsiung'},
    {ch: '新竹市', en:'Hsinchu'},
    {ch: '新竹縣', en:'HsinchuCounty'},
    {ch: '苗栗縣', en:'MiaoliCounty'},
    {ch: '彰化縣', en:'ChanghuaCounty'},
    {ch: '南投縣', en:'NantouCounty'},
    {ch: '雲林縣', en:'YunlinCounty'},
    {ch: '嘉義縣', en:'ChiayiCounty'},
    {ch: '嘉義市', en:'Chiayi'},
    {ch: '屏東縣', en:'PingtungCounty'},
    {ch: '宜蘭縣', en:'YilanCounty'},
    {ch: '花蓮縣', en:'HualienCounty'},
    {ch: '台東縣', en:'TaitungCounty'},
    {ch: '澎湖縣', en:'PenghuCounty'},
    {ch: '台南市', en:'Tainan'},
    {ch: '金門縣', en:'KinmenCounty'},
    {ch: '桃園市', en:'Taoyuan'},
    {ch: '台中市', en:'Taichung'}
]
const stationData = {};
cityList.forEach(city => {
    sessionStorage.getItem(`${city.en}BusStation`) ? stationData[city.en] = JSON.parse(sessionStorage.getItem(`${city.en}BusStation`)) : getStationData(city.en);
})
function getStationData(city) {
    //let key = {headers: GetAuthorizationHeader()};
    axios.get(`https://ptx.transportdata.tw/MOTC/v2/Bus/Route/City/${city}?$format=JSON`).then(res => {
        sessionStorage.setItem(`${city}BusStation`, JSON.stringify(res.data));
        return res.data;
    })
}

// 城市快捷按鈕點擊後渲染畫面
const mainIndex = document.querySelector('#main-index');
const mainMap = document.querySelector('#main-map');
const map = L.map('map', {zoomControl: false});
let markers = new L.MarkerClusterGroup();
const myLocationIcon = new L.Icon({iconUrl: 'img/position.png'});
const busStopIcon = new L.Icon({
    iconUrl: 'img/busstop.png',iconSize: [25, 41],
    iconSize: [30, 30],
    iconAnchor: [15, 12],
    popupAnchor: [0, -10],
    shadowSize: [41, 41]
});
// 查詢條件
const citySelector = document.querySelector('#city-selector');
const searchCondition = {city: '', routeID: ''};
const searchBox = document.querySelector('#searchBox');
const messageBox = document.querySelector('#message-box');

messageBox.addEventListener('click', e => {
    if (e.target.nodeName === 'BUTTON') {
        searchCondition.city = e.target.value;
        citySelector.value = e.target.value;
        messageBox.classList.add('d-none');
        renderView();
        renderSearchBoard();
        renderStationCard();
    }
})
document.querySelector('#quick-select-city').addEventListener('click', e => {
    if (e.target.nodeName === 'BUTTON') {
        if (e.target.value === "Other") {
            messageBox.classList.remove('d-none');
        } else {
            searchCondition.city = e.target.value;
            citySelector.value = e.target.value;
            renderView();
            renderSearchBoard();
            renderStationCard();
        }
    };
});
citySelector.addEventListener('change', e => {
    searchCondition.city = e.target.value;
    renderSearchBoard();
    renderStationCard();
})
function renderView() {
    // 調整main區塊
    mainIndex.classList.add('d-none');
    mainMap.classList.remove('d-none');
    // 載入地圖
    map.setView([23.4, 120.9], 8);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/light-v10',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiZ2Vub3M5OTkiLCJhIjoiY2t3aGN6cTFsMHd5aDJ3bXA2bHlxYXg4NSJ9.1bz7Nfv2jK4ST--IunBdbQ'
    }).addTo(map);
    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);
    //markers.addTo(map);
}
// 取得定位
function getLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(pos => {
            let lat = pos.coords.latitude;
            let lon = pos.coords.longitude;
            if (lat) {
                L.marker([lat, lon], {icon: myLocationIcon}).addTo(map);
                map.setView([lat, lon], 17);
            }
        })
    }
}
// 各城市搜尋鍵盤客製設定
const searchBoard = {
    Taipei: [
        [['紅','#E87E7E'], ['藍','#3591C5'], [1], [2], [3]],
        [['綠','#5CC1A9'], ['棕','#A86556'], [4], [5], [6]],
        [['橘','#EEA12E'], ['小','#888888'], [7], [8], [9]],
        [['更多','#DEBE4E'], ['幹線','#888888'], ['F','#888888'], [0], ['清除']]
    ],
    Taoyuan: [
        [[1], [2], [3]],
        [[4], [5], [6]],
        [[7], [8], [9]],
        [['L','#DEBE4E'], [0], ['清除']]
    ],
    Taichung: [
        [[1], [2], [3]],
        [[4], [5], [6]],
        [[7], [8], [9]],
        [['專用道','#283C43'], [0], ['清除']]
    ],
    Tainan: [
        [['紅','#E87E7E'], ['藍','#3591C5'], [1], [2], [3]],
        [['綠','#5CC1A9'], ['棕','#A86556'], [4], [5], [6]],
        [['橘','#EEA12E'], ['黃','#DEBE4E'], [7], [8], [9]],
        [['高鐵','#EEA12E'], ['其他','#888888'], [0], ['清除']]
    ],
    Kaohsiung: [
        [['紅','#E87E7E'], ['JOY','#283C43'], [1], [2], [3]],
        [['橘','#EEA12E'], ['幹線','#283C43'], [4], [5], [6]],
        [['黃','#DEBE4E'], ['快線','#283C43'], [7], [8], [9]],
        [['其他','#888888'], [0], ['清除']]
    ],
    Other: [
        [[1], [2], [3]],
        [[4], [5], [6]],
        [[7], [8], [9]],
        [['其他','#888888'], [0], ['清除']]
    ],
}
// 搜尋字串
const filterString = ['',''];
// 渲染左側選單的鍵盤
function renderSearchBoard() {
    let str = '';
    let searchName = '';
    searchBoard.hasOwnProperty(searchCondition.city) ? searchName = searchCondition.city : searchName = 'Other';
    searchBoard[searchName].forEach((el) => {
        str += `<div class="row gx-2 my-1">`;
        el.forEach(value => {
            let style = value[1]? `style="color: #fff;background-color: ${value[1]}"` : '';
            str += `<div class="col"><button type="button" value="${value[0]}" class="w-100 border-0 rounded-3 py-2" ${style}>${value[0]}</button></div>`;
        })
        str += '</div>';
    })
    document.querySelector('#search-board').innerHTML = str;
    
}
// 偵測案鈕鍵盤並變更卡片
document.querySelector('#search-board').addEventListener('click', e => {
    if (e.target.nodeName === 'BUTTON') {
        const value = e.target.value;
        if (value === '清除') {
            filterString[0] = '';
            filterString[1] = '';
        } else if (!isNaN(value)) {
            filterString[0] === '其他' ? filterString[0] = '' : false;
            filterString[1] += value;
        } else if (value === '其他') {
            filterString[0] = '其他';
            filterString[1] = '';
        } else {
            filterString[0] = value;
        }
        searchBox.value = `${filterString[0]}${filterString[1]}`;
        const result = stationData[searchCondition.city].filter(el => el.RouteName['Zh_tw'].indexOf(searchBox.value) >= 0);
        renderStationCard(result);
    }
})
// 手動輸入搜尋列後變更搜尋結果
searchBox.addEventListener('input', e => {
    const result = stationData[searchCondition.city].filter(el => el.RouteName['Zh_tw'].indexOf(searchBox.value) >= 0);
    renderStationCard(result);
})
// 渲染公車列表卡片
function renderStationCard(obj = stationData[searchCondition.city]) {
    let str = '';
    if (searchCondition.city === 'Taipei') {
        obj = obj.concat(stationData['NewTaipei']);
    }
    if (searchCondition.city === 'Chiayi') {
        obj = obj.concat(stationData['ChiayiCounty']);
    }
    if (searchCondition.city === 'Hsinchu') {
        obj = obj.concat(stationData['HsinchuCounty']);
    }
    let city = cityList.find(el => el.en === searchCondition.city).ch.slice(0, 2);
    obj.forEach(data => {
        str += `
        <div class="card-info mx-2 py-2 content-events-none" data-id="${data.RouteName['Zh_tw']}" data-route="${data.DepartureStopNameZh}－${data.DestinationStopNameZh}">
          <div class="d-flex justify-content-between align-items-center">
            <strong>${data.RouteName['Zh_tw']}</strong>
            <input type="checkbox" class="favorite-toggle d-none" name="like" id="${data.RouteID}">
            <label for="${data.RouteID}" class="pointer-events-initial">
              <span class="material-icons">favorite_border</span>
              <span class="material-icons">favorite</span>
            </label>
          </div>
          <div class="d-flex justify-content-between mt-2" style="color: #888;">
            <small>${data.DepartureStopNameZh}－${data.DestinationStopNameZh}</small>
            <small>${city}</small>
        </div>
        </div>`;
    })
    document.querySelector('.bus-list').innerHTML = str;
}
// 點擊卡片檢視內容
document.querySelector('.bus-list').addEventListener('click', e => {
    if (e.target.nodeName === "INPUT") {
        // 收藏功能
    }
    if (e.target.nodeName === "DIV") {
        searchCondition.routeID = e.target.dataset.id;
        document.querySelector('#detail-title strong').textContent = e.target.dataset.id;
        document.querySelector('#detail-title small').textContent = e.target.dataset.route;
        changeBusView();
        getBusData();
    }
})

const busListCard = document.querySelector('#bus-list-card');
const busStateCard = document.querySelector('#bus-State-card');
const closeStateCard = document.querySelector('#close-state-card');
closeStateCard.addEventListener('click', () => {
    changeBusView();
})
function changeBusView() {
    busListCard.classList.toggle('d-none');
    busStateCard.classList.toggle('d-none');
}
// 顯示路線
let busLine;
let busMarkers;
let normalPopupStyle = {'className': 'popupNormal'};
let busDetail = {};
function getBusData() {
    //let key = {headers: GetAuthorizationHeader()};
    axios.get(`https://ptx.transportdata.tw/MOTC/v2/Bus/DisplayStopOfRoute/City/${searchCondition.city}/${searchCondition.routeID}?$format=JSON`).then(res => {
        let data = res.data;
        data.forEach((el) => {
            busDetail[el.Direction] = {};
            busDetail[`line${el.Direction}`] = [];
            el.Stops.forEach(stop => {
                busDetail[el.Direction][stop.StopName['Zh_tw']] = {
                    sequance: stop.StopSequence,
                    position: [stop.StopPosition.PositionLat, stop.StopPosition.PositionLon]
                };
                busDetail[`line${el.Direction}`].push([stop.StopPosition.PositionLat, stop.StopPosition.PositionLon]);
            })
            // 畫線

        });  
        axios.get(`https://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/${searchCondition.city}/${searchCondition.routeID}?$format=JSON`).then(res => {
            let data= res.data;
            data.forEach(el => {
                busDetail[el.Direction][el.StopName['Zh_tw']].time = el.EstimateTime ?? String(el.StopStatus);
            })
            console.log(busDetail);
            if (busLine) {busLine.remove(map);};
            busLine = L.polyline(busDetail.line0, {color: '#355F8B'}).addTo(map);
            // 畫點
            let stops = [];
            Object.keys(busDetail['0']).forEach(el => {
                stops[busDetail['0'][el].sequance - 1] = [el, busDetail['0'][el].position, busDetail['0'][el].time];
            })
            if (busMarkers) {busMarkers.remove(map);};
            let cardString = '';
            let markersObj = stops.map((el, index) => {
                let leftTime = Math.round(el[2] / 60); 
                let status;
                if (el[2] === '1') {
                    status = ['over', '尚未發車'];
                } else if (el[2] < 30) {
                    status = ['coming', '進站中'];
                } else if (el[2] < 60) {
                    status = ['next', '即將進站'];
                } else {
                    status = ['continue', leftTime + ' 分'];
                }
                cardString += 
                `<div class="${status[0]}"><div>
                    <span>${status[1]}</span>
                    <span>${el[0]}</span>
                </div></div>`;
                return L.marker(el[1], {icon: busStopIcon}).bindPopup(`<b>${el[0]}</b><p>${leftTime} 分</p>`, normalPopupStyle);
            });
            document.querySelector('#bus-state-list').innerHTML = cardString;
            busMarkers = L.layerGroup(markersObj);
            map.addLayer(busMarkers);
            // 變更視角
            map.setView(stops[Math.round(stops.length / 2)][1], 13);
        })
    })
}

// 搜尋附近車站 https://ptx.transportdata.tw/MOTC/v2/Bus/Stop/NearBy?$spatialFilter=nearby(25.047675%2C%20121.517055%2C%20100)&$format=JSON


// function GetAuthorizationHeader() {
//     var AppID = '3b0e6aa170094b42bf5016bc66ca88b9';
//     var AppKey = '9STPZ0hk8jV8zN22Xah1fLDcUYE';

//     var GMTString = new Date().toGMTString();
//     var ShaObj = new jsSHA('SHA-1', 'TEXT');
//     ShaObj.setHMACKey(AppKey, 'TEXT');
//     ShaObj.update('x-date: ' + GMTString);
//     var HMAC = ShaObj.getHMAC('B64');
//     var Authorization = 'hmac username=\"' + AppID + '\", algorithm=\"hmac-sha1\", headers=\"x-date\", signature=\"' + HMAC + '\"';

//     return { 'Authorization': Authorization, 'X-Date': GMTString /*,'Accept-Encoding': 'gzip'*/}; //如果要將js運行在伺服器，可額外加入 'Accept-Encoding': 'gzip'，要求壓縮以減少網路傳輸資料量
// }