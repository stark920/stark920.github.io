// 公車站點資料存到本地端
const cityList = [
    {ch: '臺北市', en:'Taipei'},
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
    {ch: '臺東縣', en:'TaitungCounty'},
    {ch: '澎湖縣', en:'PenghuCounty'},
    {ch: '臺南市', en:'Tainan'},
    {ch: '金門縣', en:'KinmenCounty'},
    {ch: '桃園市', en:'Taoyuan'},
    {ch: '臺中市', en:'Taichung'}
]
const stationData = {};
cityList.forEach(city => {
    localStorage.getItem(`${city.en}BusStation`) ? stationData[city.en] = JSON.parse(localStorage.getItem(`${city.en}BusStation`)) : getStationData(city.en);
})
function getStationData(city) {
    let key = {headers: GetAuthorizationHeader()};
    axios.get(`https://ptx.transportdata.tw/MOTC/v2/Bus/Route/City/${city}?$format=JSON`, key).then(res => {
        localStorage.setItem(`${city}BusStation`, JSON.stringify(res.data));
        return res.data;
    })
}

// 城市快捷按鈕點擊後渲染畫面
const mainIndex = document.querySelector('#main-index');
const mainMap = document.querySelector('#main-map');
const map = L.map('map', {zoomControl: false});
let markers = new L.MarkerClusterGroup();
const myLocationIcon = new L.Icon({iconUrl: 'img/position.png'});
// 查詢條件
const searchCondition = {city: '', routeID: ''};
const searchBox = document.querySelector('input.searchBox');
document.querySelector('#quick-select-city').addEventListener('click', e => {
    if (e.target.nodeName === 'BUTTON') {
        // 調整main區塊
        mainIndex.classList.add('d-none');
        mainMap.classList.remove('d-none');
        // 顯示路徑
        document.querySelector('.page-location').textContent = `首頁 / ${e.target.value}`
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
        markers.addTo(map);
        // 抓取定位資訊
        getLocation();
        // 設定當前查詢城市
        searchCondition.city = e.target.value;
        // 產生對應搜尋鍵盤
        renderSearchBoard();
        // 產生站點資訊卡
        renderStationCard();
    };
});
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
function renderSearchBoard() {
    // 生成鍵盤
    let str = '';
    let searchName = '';
    searchBoard.hasOwnProperty(searchCondition.city) ? searchName = searchCondition.city : searchName = 'Other';
    searchBoard[searchName].forEach((el) => {
        str += `<div class="d-flex justify-content-center">`;
        el.forEach(value => {
            let style = value[1]? `style="color: #fff;background-color: ${value[1]}"` : '';
            str += `<button type="button" value="${value[0]}" class="flex-1" ${style}>${value[0]}</button>`;
        })
        str += '</div>';
    })
    document.querySelector('#search-board').innerHTML = str;
    // 偵測鍵盤並即時變更
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
    searchBox.addEventListener('change', e => {
        const result = stationData[searchCondition.city].filter(el => el.RouteName['Zh_tw'].indexOf(searchBox.value) >= 0);
        renderStationCard(result);
    })
    // 點擊卡片檢視內容
    document.querySelector('.bus-list').addEventListener('click', e => {
        searchCondition.routeID = e.target.dataset.id;
        getBusData();
    })
}
// 抓站點資料
function renderStationCard(obj = stationData[searchCondition.city]) {
    let str = '';
    let city = cityList.find(el => el.en === searchCondition.city).ch.slice(0,2);
    obj.forEach(data => {
        str += `
        <div class="card-info" data-id="${data.RouteName['Zh_tw']}">
        <div class="d-flex pointer-events-none justify-content-between align-items-center">
            <strong>${data.RouteName['Zh_tw']}</strong>
            <input type="checkbox" class="d-none pointer-events-initial like-button-input" name="like" id="${data.RouteID}">
            <label for="${data.RouteID}" class="like-button pointer-events-initial">
                <span class="empty-heart">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                        <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
                    </svg>
                </span>
                <span class="filled-heart">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
                    </svg>
                </span>
            </label>
        </div>
        <div class="d-flex justify-content-between pointer-events-none" style="margin-top: 0.5rem; color: #888;">
            <small>${data.DepartureStopNameZh}－${data.DestinationStopNameZh}</small>
            <small>${city}</small>
        </div>
        </div>`;
    })
    document.querySelector('.bus-list').innerHTML = str;
}
// 顯示路線
let busLine;
function getBusData() {
    let key = {headers: GetAuthorizationHeader()};
    axios.get(`https://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/${searchCondition.city}/${searchCondition.routeID}?$format=JSON`, key).then(res => {
        console.log(res.data);
    })
    axios.get(`https://ptx.transportdata.tw/MOTC/v2/Bus/DisplayStopOfRoute/City/${searchCondition.city}/${searchCondition.routeID}?$format=JSON`, key).then(res => {
        const data = res.data[0].Stops;
        const route = [];
        data.forEach(el => route.push([el.StopPosition.PositionLat, el.StopPosition.PositionLon]));
        if (busLine) {busLine.remove(map);};
        busLine = L.polyline(route, {color: '#355F8B'}).addTo(map);
        map.setView(route[Math.round(route.length / 2)], 12);
    })
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