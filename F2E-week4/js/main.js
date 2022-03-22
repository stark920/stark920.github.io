const ui_url = 'https://raw.githubusercontent.com/hexschool/2021-ui-frontend-job/master/ui_data.json';
const fe_url = 'https://raw.githubusercontent.com/hexschool/2021-ui-frontend-job/master/frontend_data.json';
let data; // api response
let chartObj = {}; // 所有處理過的資料
let chartVariables = []; // 所有產生的圖表
let industryList = {}; // 前十產業 另外處理

// 計算平均薪資用的參考值
const salary_ref = {
    '36 萬以下': 330,
    '36~50 萬': 430,
    '51~60 萬': 550,
    '61~70 萬': 650,
    '71~80 萬': 750,
    '81~90 萬': 850,
    '91~100 萬': 950,
    '101~110 萬': 1050,
    '111~120 萬': 1150,
    '121~130 萬': 1250,
    '131~140 萬': 1350,
    '141~150 萬': 1450,
    '151~160 萬': 1550,
    '161~170 萬': 1650,
    '171~180 萬': 1750,
    '181~190 萬': 1850,
    '191~200 萬': 1950,
    '201~300 萬': 2500,
    '301~400 萬': 3500,
    '400 萬以上': 4000
}

// 上方選單資料切換
const pageTitle = document.querySelector('.js-pagetitle'); // 頁面標題
document.querySelector('.js-datatype').addEventListener('click', e => {
    if (e.target.nodeName === 'A') {
        // 清除圖表
        chartVariables.forEach(el => el.destroy());
        chartVariables = [];
        // 變更標題
        pageTitle.textContent = e.target.textContent;
        // 重置圖表物件
        initChartObj();
        getData(e.target.dataset.type);
    }
})

// 圖表頁面切換
let checkedBtn = 'btnradio1';
const chartpage1 = document.getElementById('chartpage-1');
const chartpage2 = document.getElementById('chartpage-2');
document.querySelector('.js-togglechart').addEventListener('click', e => {
    if (e.target.nodeName === 'INPUT' && e.target.id !== checkedBtn) {
        toggleChartpage();
        checkedBtn = e.target.id;
    }
});

function toggleChartpage() {
    chartpage1.classList.toggle('d-none');
    chartpage2.classList.toggle('d-none');
}

// 薪資總表切換
let scoreSortAsc;
let scoreSortDesc;
let scoreIndex = 0;
let scoreSort = 'Desc';
document.querySelector('.js-score-selection').addEventListener('click', e => {
    e.preventDefault();
    if (e.target.nodeName === 'BUTTON') {
        switch (e.target.value) {
            case 'next': 
                if (scoreIndex + 8 < scoreSortDesc.length) {
                    scoreIndex += 8;
                    redrawScoreChart();
                } else {
                    alert('已經到底了');
                }
                break;
            case 'previous':
                if (scoreIndex - 8 > 0) {
                    scoreIndex -= 8;
                    redrawScoreChart();
                } else {
                    alert('已經到底了');
                }
                break;
        }
    }
    if (e.target.nodeName === 'A') {
        if (e.target.dataset.condition === 'Asc') {
            scoreSort = 'Asc';
            document.querySelector('.js-score-condition-btn').textContent = e.target.textContent;
            redrawScoreChart();
        } else {
            scoreSort = 'Desc';
            document.querySelector('.js-score-condition-btn').textContent = e.target.textContent;
            redrawScoreChart();
        }
    }
})
function redrawScoreChart() {
    chartVariables[chartVariables.length -1].destroy();
    drawChart(chartObj.score.dom, setChartData('score', chartObj.score.data));
}

// 初始化資料
init();
function init() {
    initChartObj();
    getData();
};

// 初始化圖表資料物件
function initChartObj() {
    const chartList = ['area', 'age', 'gender', 'major', 'skill', 'tenure', 'salary', 'industry', 'score'];
    chartList.forEach(el => {
        chartObj[el] = {
            data: {},
            dom: document.getElementById(`${el}-chart`),
        }
    })
    // 前１０多人的企業另外處理
    industryList = {};
}

// 取得 API 資料
function getData(type = 'FE'){
    const url = type === 'FE' ? fe_url : ui_url;
    axios.get(url)
    .then(res => {
        data = res.data;
        createChartData();
        renderChart(); 
    })
    .catch(err => {
        console.log(err);
    })
}

// 產出圖表用的資料物件
function createChartData() {
    // 設定各資料類型變數（部分含初始格式）
    const areaData = chartObj.area.data;
    const ageData = chartObj.age.data;
    const genderData = chartObj.gender.data;
    genderData['男'] = 0;
    genderData['女'] = 0;
    const majorData = chartObj.major.data;
    majorData['大學（含）以下'] = {'資訊相關科系': 0, '設計相關科系': 0, '其他科系': 0};
    majorData['碩博士'] = {'資訊相關科系': 0, '設計相關科系': 0, '其他科系': 0};
    const skillData = chartObj.skill.data;
    skill_except = ['測試（Unit Test, E2E Test）', '任務指派工具（Trello, Asana...）','UI Prototype 或設計稿標示工具（Adobe XD, Figma）'];
    const tenureData = chartObj.tenure.data;
    const salaryData = chartObj.salary.data;
    const industryData = chartObj.industry.data;
    industryData['接案公司'] = 0;
    industryData['自有產品'] = 0;
    const scoreData = chartObj.score.data;

    // API 資料處理
    data.forEach(el => {
        // 地區
        const area = el.company.area.replace('台灣 - ', '').split('(')[0];
        areaData[area] === undefined ? areaData[area] = 1 : areaData[area]++;
        // 年齡
        ageData[el.age] === undefined ? ageData[el.age] = 1 : ageData[el.age]++;
        // 性別
        el.gender === '男性' ? genderData['男']++ : genderData['女']++;
        // 教育
        const major_path = (el.education === '碩士畢業' || el.education === '博士畢業') ? majorData['碩博士'] : majorData['大學（含）以下'];
        if (el.major === '資訊科系相關(資工、資管、光電、電機)') {
            major_path['資訊相關科系']++;
        } else if (el.major === '設計科系相關(視覺傳達、工業設計、人機互動、數位設計)') {
            major_path['設計相關科系']++;
        } else {
            major_path['其他科系']++;
        }
        // 第一個工作使用技能，資料用逗點分隔又在括弧裡面放逗點實在惡意滿滿...WTF
        let skills = [];
        let skillStr = el.first_job.skill;
        skill_except.map(el => {
            if (skillStr.indexOf(el) > 0 ) {
                skills.push(el);
                skillStr = skillStr.replace(el, '');
            }
        })
        skills = skills.concat(skillStr.split(', ').filter(el => el));
        skills.map(el => skillData[el] === undefined ? skillData[el] = 1 : skillData[el]++);
        // 現職年資、年薪
        if (el.company.job_tenure) {
            // 現職年資
            tenureData[el.company.job_tenure] === undefined ? tenureData[el.company.job_tenure] = 1 : tenureData[el.company.job_tenure]++;
            // 現職年薪
            let salary_key = el.company.job_tenure.split(' ')[0].split('~')[1] ?? el.company.job_tenure.split(' ')[0].split('~')[0];
            if (salaryData[salary_key] === undefined) {
                salaryData[salary_key] = {
                    title: el.company.job_tenure,
                    salary: [salary_ref[el.company.salary]]
                }
            } else {
                salaryData[salary_key].salary.push(salary_ref[el.company.salary]);
            }
        } 
        // 產業
        if (el.company.industry === '接案公司') {
            industryData['接案公司']++;
        } else {
            industryData['自有產品']++;
        }
        industryList[el.company.industry] === undefined ? industryList[el.company.industry] = 1 : industryList[el.company.industry]++;
        // 產業薪資滿意度
        if (scoreData[el.company.industry] === undefined) {
            scoreData[el.company.industry] = {
                score: [parseInt(el.company.salary_score)],
                salary: [salary_ref[el.company.salary]]
            }
        } else {
            scoreData[el.company.industry].score.push(parseInt(el.company.salary_score));
            scoreData[el.company.industry].salary.push(salary_ref[el.company.salary]);
        }
    })

    // 滿意度資料處理，提供事件觸發使用
    const score_ref = [];
    Object.keys(scoreData).forEach(el => {
        score_ref.push([el, scoreData[el].score.length]);
        scoreData[el].score = Math.floor(([...scoreData[el].score].reduce((a,b) => a+b)) / scoreData[el].score.length);
        scoreData[el].salary = Math.floor(([...scoreData[el].salary].reduce((a,b) => a+b)) / scoreData[el].salary.length);
    })
    scoreSortDesc = score_ref.sort((a,b) => b[1] - a[1]);
    scoreSortAsc = [...scoreSortDesc].reverse();
}

function renderChart() {
    Object.keys(chartObj).forEach(el => {
        drawChart(chartObj[el].dom, setChartData(el, chartObj[el].data));
    });
}

function setChartData(key, data) {
    // 共同設定
    let type = 'bar';
    let col = Object.keys(data);
    let row = [{
        data: Object.values(data),
        backgroundColor: '#8E7DFA'
    }];
    const basic_option = {
        indexAxis: 'x',
        scales: {
            x: {
                ticks: {
                    color: '#F2F2F4'
                },
                grid: {
                    borderColor: '#6B6783'
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#F2F2F4'
                },
                grid: {
                    color: '#6B6783',
                    borderColor: '#6B6783'
                }
            }
        },
        plugins: {
            legend: {
              display: false
            }
        }
    };

    // 個別設定
    switch (key) {
        case 'gender':
            type = 'pie';
            row[0].backgroundColor = ['#8E7DFA', '#D2CBFD'];
            delete basic_option.scales;
            delete basic_option.indexAxis;
            let genderNum = Object.values(data);
            let genderPercentage = (genderNum[0] / (genderNum[0] + genderNum[1]) * 100).toFixed(0);
            document.querySelector('.male-percentage').textContent = genderPercentage + '%';
            document.querySelector('.female-percentage').textContent =  (100 - genderPercentage) + '%';
            break;
        case 'major':
            col = Object.keys(data['碩博士']);
            row = [];
            let colors = ['#8E7DFA', '#D2CBFD']
            Object.keys(data).forEach((el, index) => {
                row.push(
                    {
                        label: el,
                        data: Object.values(data[el]),
                        backgroundColor: colors[index],
                    },
                )
            })
            basic_option.scales.x.stacked = true;
            basic_option.scales.y.stacked = true;
            basic_option.plugins.legend.display = true;
            basic_option.plugins.legend.position = 'bottom';
            basic_option.indexAxis = 'y';
            break;
        case 'skill':
            let skill_arr = Object.entries(data).sort((a,b) => b[1] - a[1]).splice(0, 8);
            col = [];
            row.data = [];
            let skillDetailStr = '';
            skill_arr.map((el) => {
                if (el[0].indexOf('（') > 0) {
                    let skill_str = el[0].split('（');
                    col.push(skill_str[0]);
                    skillDetailStr += `<div>
                        <strong>${skill_str[0]}</strong>
                        <p>${skill_str[1].replace('）', '')}</p>
                    </div>`;
                } else if (el[0].indexOf('(') > 0) {
                    let skill_str = el[0].split('(');
                    col.push(skill_str[0]);
                    skillDetailStr += `<div>
                        <strong>${skill_str[0]}</strong>
                        <p>${skill_str[1].replace(')', '')}</p>
                    </div>`;
                } else {
                    col.push(el[0]);
                }
                row.data.push(el[1]);
            })
            document.querySelector('.js-skill-detail').innerHTML = skillDetailStr;
            basic_option.indexAxis = 'y';
            break;
        case 'tenure':
            col = [];
            row.data = [];
            let tenureSort = Object.keys(data).map(el => [el.split(' 年')[0].split('~')[1] ?? el.split(' 年')[0].split('~')[0], el]).sort((a,b) => a[0] - b[0]);
            tenureSort.map(el => {
                col.push(el[1]);
                row.data.push(data[el[1]]);
            })
            break;
        case 'salary':
            col = [];
            let salary_avg = [];
            Object.keys(data).forEach(el => {
                col.push(data[el].title)
                salary_avg.push(data[el].salary = Math.floor(([...data[el].salary].reduce((a,b) => a+b)) / data[el].salary.length));
            })
            row = [{
                type: 'line',
                data:  salary_avg,
                borderColor: '#F2F2F4',
                borderWidth: 1,
                pointBorderColor: '#F2F2F4',
                pointBackgroundColor: '#8E7DFA'
            },{
                type: 'bar',
                data:  salary_avg,
                backgroundColor: '#8E7DFA'
            }];
            break;
        case 'industry':
            // 頁面顯示前１０多人的企業（非圖表）
            let industry_top10 = Object.entries(industryList).sort((a,b) => b[1] - a[1]).splice(0, 10);
            let industry_str = '';
            industry_top10.forEach(el => industry_str += `<li class="col">${el[0]}</li>`);
            document.querySelector('.js-industry').innerHTML = industry_str;
            type = 'pie';
            row[0].backgroundColor = ['#8E7DFA', '#D2CBFD'];
            delete basic_option.scales;
            delete basic_option.indexAxis;
            let industryNum = Object.values(data);
            let industryPercentage = (industryNum[0] / (industryNum[0] + industryNum[1]) * 100).toFixed(0);
            document.querySelector('.case-industry-percentage').textContent = industryPercentage + '%';
            document.querySelector('.self-industry-percentage').textContent =  (100 - industryPercentage) + '%';
            break;
        case 'score':
            col = scoreSort === 'Desc' ? scoreSortDesc.map(el => el[0]).slice(scoreIndex, scoreIndex + 8) : scoreSortAsc.map(el => el[0]).slice(scoreIndex, scoreIndex + 8);
            row = [{
                type: 'line',
                data:  col.map(el => data[el].score),
                borderColor: '#F2F2F4',
                borderWidth: 1,
                pointBorderColor: '#F2F2F4',
                pointBackgroundColor: '#8E7DFA',
                yAxisID: 'y1'
            },{
                type: 'bar',
                data:  col.map(el => data[el].salary),
                backgroundColor: '#8E7DFA',
                yAxisID: 'y'
            }];
            basic_option.scales.y1 = {
                type: 'linear',
                display: true,
                position: 'right',
                max: 10,
                grid: {
                    drawOnChartArea: false,
                },
            }
            break;
    }

    return {
        type: type,
        data: {
            labels: col,
            datasets: row
        },
        options: basic_option
    }
}

function drawChart(renderDom, data) {
    chartVariables.push(new Chart(renderDom, data));
}