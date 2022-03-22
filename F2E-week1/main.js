let navBar = document.querySelector('.navbar');
window.onscroll = () => { 
    if (document.body.scrollTop >= 200 ) {
        navBar.classList.add("navbar-scrolled");
    } 
    else {
        navBar.classList.remove("navbar-scrolled");
    }
};

function renderCityList() {
      axios.get('https://gist.motc.gov.tw/gist_api/V3/Map/Basic/City?$format=JSON')
      .then((res) => {
            let str = '';
            res.data.map(i => {
                  str += `<li><a class="dropdown-item" href="#">${(i.CityName).slice(0,2)}</a></li>`;
            });
            document.querySelector("#city-list").innerHTML = str;
      })
}
 
function renderScenicSpotList(city, num) {
      axios.get(`https://ptx.transportdata.tw/MOTC/v2/Tourism/ScenicSpot/${city}?$top=${num}&$format=JSON`)
      .then((res) => {
            let str = '';
            res.data.forEach(el => {
                  let pic = checkPicture(el);
                  let name = el.Name.split('_');
                  name = name[name.length - 1];
                  str += `
                  <div class="col">
                        <div class="card card-min">
                              <img src="${pic[0]}" class="card-img-top" alt="${pic[1]}">
                              <div class="card-min-title">${name}</div>
                        </div>
                  </div>`;
            });
            document.querySelector('#ScenicSpot-list').innerHTML = str;
      })
}

function renderActivityList(city, num) {
      axios.get(`https://ptx.transportdata.tw/MOTC/v2/Tourism/Activity/${city}?$top=${num}&$format=JSON`)
      .then((res) => {
            let str = '';
            res.data.forEach(el => {
                  let pic = checkPicture(el);
                  let location = el.Address || el.City; 
                  str += `
                  <div class="col-lg-4">
                        <div class="card">
                              <img src="${pic[0]}" class="card-img-top" alt="${pic[1]}">
                              <div class="card-body">
                                    <h5 class="card-title">${el.Name}</h5>
                                    <p class="card-text text-truncate"><i class="bi bi-geo-alt-fill text-warning"></i>  ${location}</p>
                                    <p class="card-text text-truncate"><i class="bi bi-clock-fill text-warning"></i>  ${el.StartTime.slice(0,10)} ~ ${el.EndTime.slice(0,10)}</p>
                                    <a href="#" class="btn btn-success">Detail</a>
                              </div>
                        </div>
                  </div>`;
            });
            document.querySelector('#Activity-list').innerHTML = str;
      })
}

function renderRestaurantList(city, num) {
      axios.get(`https://ptx.transportdata.tw/MOTC/v2/Tourism/Restaurant/${city}?$top=${num}&$format=JSON`)
      .then((res) => {
            let str = '';
            res.data.forEach(el => {
                  let pic = checkPicture(el);
                  let location = el.Address || el.City; 
                  str += `
                  <div class="col-lg-4">
                        <div class="card">
                              <img src="${pic[0]}" class="card-img-top" alt="${pic[1]}">
                              <div class="card-body">
                                    <h5 class="card-title">${el.Name}</h5>
                                    <p class="card-text text-truncate"><i class="bi bi-geo-alt-fill text-warning"></i>  ${location}</p>
                                    <p class="card-text text-truncate"><i class="bi bi-clock-fill text-warning"></i>  ${el.OpenTime}</p>
                                    <a href="#" class="btn btn-success">Detail</a>
                              </div>
                        </div>
                  </div>`;
            });
            document.querySelector('#restaurant-list').innerHTML = str;
      })
}

function renderHotelList(city, num) {
      axios.get(`https://ptx.transportdata.tw/MOTC/v2/Tourism/Hotel/${city}?$top=${num}&$format=JSON`)
      .then((res) => {
            let str = '';
            res.data.forEach(el => {
                  let pic = checkPicture(el);
                  let location = el.Address || el.City; 
                  str += `
                  <div class="col-lg-4">
                        <div class="card">
                              <img src="${pic[0]}" class="card-img-top" alt="${pic[1]}">
                              <div class="card-body">
                                    <h5 class="card-title">${el.Name}</h5>
                                    <p class="card-text text-truncate"><i class="bi bi-geo-alt-fill text-warning"></i>  ${location}</p>
                                    <p class="card-text text-truncate"><i class="bi bi-telephone-fill text-warning"></i>  ${el.Phone}</p>
                                    <a href="#" class="btn btn-success">Detail</a>
                              </div>
                        </div>
                  </div>`;
            });
            document.querySelector('#hotel-list').innerHTML = str;
      })
}

function checkPicture(data) {
      if (typeof(data.Picture) == 'string') return [data.Picture, ''];
      if (typeof(data.Picture.PictureUrl1) == 'string') return [data.Picture.PictureUrl1, data.Picture.PictureDescription1];
      return ['https://ptx.transportdata.tw/PTX/Content/link/link-01.jpg', '店家未提供圖片'];     
} 
renderCityList();
renderScenicSpotList('Taipei', 5);
renderActivityList('Taipei', 3);
renderRestaurantList('NewTaipei', 3);
renderHotelList('Taipei', 3);

