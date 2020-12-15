document.addEventListener('DOMContentLoaded', function (event) {
  fetch(
    // 'https://c19downloads.azureedge.net/downloads/json/coronavirus-deaths_latest.json'

    'https://api.coronavirus.data.gov.uk/v1/data?filters=areaType=overview&structure={"reportingDate":"date","dailyChangeInDeaths":"newDeaths28DaysByPublishDate"}'
  )
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      todaysDate();
      uploadCheck(data);
      dateHeaders(data);
      processData(data);
      rollingAverage(data);

      return maxDeaths(data);
    })
    .then((obj) => {
      minDeaths(obj);
    })
    .catch((error) => {
      console.log(error);
      let status = document.getElementById('status');
      status.innerHTML = 'Something is Wrong';
    });
});

const todaysDate = () => {
  let date = new Date();
  document.getElementById('todaysDate').innerHTML = date
    .toISOString()
    .slice(0, 10);
};

const dateHeaders = (raw) => {
  const info = raw.data;

  const DAYS = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  for (let i = 0; i < 7; i++) {
    // set their text as a date
    let dateForm = new Date(info[i].reportingDate);
    let dayNumber = dateForm.getDay();
    document.getElementById('dayHeader_0' + i).innerHTML = DAYS[dayNumber];
  }
};

const processData = (raw) => {
  const info = raw.data;

  // MOST RECENT UPLOAD DATE
  const uploadDate = document.getElementById('uploadDate');
  uploadDate.innerHTML = info[0].reportingDate;

  // DATA SECTION
  for (let i = 0; i < 7; i++) {
    document.getElementById('date_0' + i).innerHTML = info[i].reportingDate;
    document.getElementById('deaths_0' + i).innerHTML =
      info[i].dailyChangeInDeaths;
  }
};

const rollingAverage = (raw) => {
  const info = raw.data;

  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += info[i].dailyChangeInDeaths;
  }

  let rollAve = sum / 7;
  let rounded = rollAve.toFixed();

  const average = document.getElementById('average');
  average.innerHTML = rounded;
};

const uploadCheck = (raw) => {
  const info = raw.data;

  const recentUploadDate = info[0].reportingDate.slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const upLoadDateEl = document.getElementById('uploadDate');
  const statusMessage = document.getElementById('status');

  if (recentUploadDate === today) {
    upLoadDateEl.style.color = 'green';
    statusMessage.innerHTML = 'Updated Today';
  } else {
    statusMessage.innerHTML = "Awaiting Today's Update";
  }
};

const maxDeaths = (raw) => {
  const info = raw.data;

  let mostDeathsDate = document.querySelector('#date__MostDD');
  let mostDeathsNumber = document.querySelector('#deaths_MostDD');

  let max = info[0];
  let maxIndex = 0;
  for (let i = 1; i < info.length; i++) {
    if (max.dailyChangeInDeaths < info[i].dailyChangeInDeaths) {
      max = info[i];
      maxIndex = i;
    }
  }
  mostDeathsDate.innerHTML = max.reportingDate;
  mostDeathsNumber.innerHTML = max.dailyChangeInDeaths;

  let obj = {
    info,
    maxIndex,
  };
  return obj;
};

const minDeaths = (obj) => {
  let list = obj.info;
  let start = obj.maxIndex;
  let min = list[start];

  let fewestDeathsDate = document.querySelector('#date_FewDD');
  let fewestDeathsNumber = document.querySelector('#deaths_FewDD');

  for (let i = start; i >= 0; i--) {
    if (min.dailyChangeInDeaths > list[i].dailyChangeInDeaths) min = list[i];
  }
  fewestDeathsDate.innerHTML = min.reportingDate;
  fewestDeathsNumber.innerHTML = min.dailyChangeInDeaths;
};
