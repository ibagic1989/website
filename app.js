function $(elem) {
  return document.querySelector(elem);
}

let closeSidebarIcon = $(".close-sidebar-icon");
let sidebar = $("header");
let mainContent = $("main");

async function getWorldStatistics(url) {
  try {
    let response = await fetch(url)
    let data = await response.json();

    // Cases
    let cases = $('#cases');
    cases.innerHTML = data.cases.toLocaleString();

    // Deaths
    let deaths = $('#deaths');
    deaths.innerHTML = data.deaths.toLocaleString();

    // Recovered
    let recovered = $('#recovered');
    recovered.innerHTML = data.recovered.toLocaleString();

    // Affected countries
    let affectedCountries = $('#affectedCountries');
    affectedCountries.innerHTML = data.todayCases.toLocaleString();

    // Updated
    let updated = $('#updated');
    updated.innerHTML = new Date(data.updated).toLocaleString();
  }
  catch (err) {
    console.log(err);
  }
}


async function getHRV(url) {
  try {
    let response = await fetch(url)
    let data = await response.json();

    // Cases
    let cases = $('#casesHrv');
    cases.innerHTML = data.cases.toLocaleString();

    // Deaths
    let deaths = $('#deathsHrv');
    deaths.innerHTML = data.deaths.toLocaleString();

    // Recovered
    let recovered = $('#recoveredHrv');
    recovered.innerHTML = data.recovered.toLocaleString();

    // Affected today
    let todayCases = $('#todayCasesHrv');
    todayCases.innerHTML = data.todayCases.toLocaleString();
  }
  catch (err) {
    console.log(err);
  }
}


async function getAllCountries(url) {
  let mapCountry;
  let mapData = [];
  try {
    let res = await fetch(url);
    let countries = await res.json();

    countries.forEach((country) => {
      mapCountry = {
        id: country.countryInfo.iso2,
        name: country.country,
        recovered: country.recovered,
        cases: country.cases,
        deaths: country.deaths
      }
      mapData.push(mapCountry);

      createListElement(country);
    });

    let neighbouringCountries = countries.filter(res =>
      res.country == "Hungary" ||
      res.country == "Bosnia" ||
      res.country == "Slovenia" ||
      res.country == "Serbia" ||
      res.country == "Montenegro");
    createNeighbouringChart(neighbouringCountries);
    createMap(mapData);
  }
  catch (err) {
    console.log(err);
  }
}


async function getHistoricalDataHrv(url) {
  let casesHistory = [];
  let deathsHistory = [];
  let recoveredHistory = [];
  let casesPerDay;
  let deathsPerDay;
  let recoveredPerDay;
  try {
    const res = await fetch(url);
    const data = await res.json();

    Object.keys(data.timeline.cases).forEach(key => {
      casesPerDay = {
        date: key,
        cases: data.timeline.cases[key]
      }
      casesHistory.push(casesPerDay);
    });


    Object.keys(data.timeline.deaths).forEach(key => {
      deathsPerDay = {
        date: key,
        deaths: data.timeline.deaths[key]
      }
      deathsHistory.push(deathsPerDay);
    });

    Object.keys(data.timeline.recovered).forEach(key => {
      recoveredPerDay = {
        date: key,
        recovered: data.timeline.recovered[key]
      }
      recoveredHistory.push(recoveredPerDay);
    });
    createHistoryChartHrv(casesHistory, deathsHistory, recoveredHistory);
  }
  catch (err) {
    console.log(err);
  }
}


async function getHistoricalDataAll(url) {
  let casesHistory = [];
  let deathsHistory = [];
  let recoveredHistory = [];
  let casesPerDay;
  let deathsPerDay;
  let recoveredPerDay;
  try {
    const res = await fetch(url);
    const data = await res.json();

    Object.keys(data.cases).forEach(key => {
      casesPerDay = {
        date: key,
        cases: data.cases[key]
      }
      casesHistory.push(casesPerDay);
    });


    Object.keys(data.deaths).forEach(key => {
      deathsPerDay = {
        date: key,
        deaths: data.deaths[key]
      }
      deathsHistory.push(deathsPerDay);
    });

    Object.keys(data.recovered).forEach(key => {
      recoveredPerDay = {
        date: key,
        recovered: data.recovered[key]
      }
      recoveredHistory.push(recoveredPerDay);
    });
    createHistoryChartAll(casesHistory, deathsHistory, recoveredHistory);
  }
  catch (err) {
    console.log(err);
  }
}


function createListElement(country) {
  let affectedCountriesList = $('#affectedCountries-list');
  let li = document.createElement('li');
  let img = document.createElement('img');
  let div = document.createElement('div');
  let h4 = document.createElement('H4');
  let spanWarning = document.createElement('span');
  let spanDanger = document.createElement('span');
  li.classList.add('affectedCountry');
  img.src = country.countryInfo.flag;
  h4.innerHTML = country.country;
  spanWarning.classList.add('label', 'label-warning');
  spanWarning.innerHTML = country.cases.toLocaleString();
  spanDanger.classList.add('label', 'label-danger');
  spanDanger.innerHTML = country.deaths.toLocaleString();
  affectedCountriesList.appendChild(li);
  li.append(img, div);
  div.append(h4, spanWarning, spanDanger);
}



function createMap(mapData) {

  // Create map instance
  var chart = am4core.create("chartdiv", am4maps.MapChart);

  // Set map definition
  chart.geodata = am4geodata_worldLow;

  // Set projection
  chart.projection = new am4maps.projections.NaturalEarth1();

  // Create map polygon series
  var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

  polygonSeries.tooltip.getFillFromObject = false;
  polygonSeries.tooltip.background.fill = am4core.color("#173753");

  // Make map load polygon (like country names) data from GeoJSON
  polygonSeries.useGeodata = true;

  // Configure series
  var polygonTemplate = polygonSeries.mapPolygons.template;
  polygonTemplate.tooltipText = "{name}:\n [#32d296]Oporavljenih: {recovered}[/] \n [#faa05a]Zaraženih: {cases}[/] \n [#f0506e]Umrlih: {deaths}[/]";
  polygonTemplate.fill = am4core.color("#009ee0");
  // polygonTemplate.propertyFields.fill = "fill";

  // Create hover state and set alternative fill color
  var hs = polygonTemplate.states.create("hover");
  hs.properties.fill = am4core.color("#173753");

  // Remove Antarctica
  polygonSeries.exclude = ["AQ"];

  // Add some data
  polygonSeries.data = JSON.parse(JSON.stringify(mapData));
}


function createNeighbouringChart(neighbouringCountries) {
  am4core.useTheme(am4themes_animated);

  // Create chart instance
  var chart = am4core.create("chartdiv1", am4charts.XYChart);

  chart.responsive.useDefault = false
  chart.responsive.enabled = true;

  chart.responsive.rules.push({
    relevant: function (target) {
      if (target.pixelWidth <= 400) {
        return true;
      }

      return false;
    },
    state: function (target, stateId) {
      if (target instanceof am4charts.Chart) {
        var state = target.states.create(stateId);
        state.properties.paddingBottom = 5;
        state.properties.paddingLeft = 0;
        return state;
      }
      return null;
    }
  });

  chart.marginRight = 400;

  // Add data
  chart.data = JSON.parse(JSON.stringify(neighbouringCountries));

  // Create axes
  var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "country";
  // categoryAxis.title.text = "Susjedne države";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.minGridDistance = 60;
  categoryAxis.renderer.labels.template.fill = am4core.color("#fff");
  // categoryAxis.title.fill = am4core.color("#fff");
  // categoryAxis.title.fillOpacity = 0.2;
  categoryAxis.renderer.grid.template.stroke = am4core.color("#fff");


  var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  // valueAxis.title.text = "Broj zaraženih, umrlih i oporavljenih";
  // valueAxis.title.fill = am4core.color("#fff");
  // valueAxis.title.fillOpacity = 0.2;
  valueAxis.renderer.labels.template.fill = am4core.color("#fff");
  valueAxis.renderer.grid.template.stroke = am4core.color("#fff");

  chart.colors.list = [
    am4core.color("#faa05a"),
    am4core.color("#f0506e"),
    am4core.color("#32d296")
  ];

  // Create series
  var series = chart.series.push(new am4charts.ColumnSeries());
  series.dataFields.valueY = "cases";
  series.dataFields.categoryX = "country";
  series.name = "Zaraženih";
  series.tooltipText = "{name}: [bold]{valueY}[/]";
  series.tooltip.autoTextColor = false;
  series.tooltip.label.fill = am4core.color("#fff");
  series.stacked = true;

  var series2 = chart.series.push(new am4charts.ColumnSeries());
  series2.dataFields.valueY = "deaths";
  series2.dataFields.categoryX = "country";
  series2.name = "Umrlih";
  series2.tooltipText = "{name}: [bold]{valueY}[/]";
  series2.tooltip.autoTextColor = false;
  series2.tooltip.label.fill = am4core.color("#fff");
  series2.stacked = true;

  var series3 = chart.series.push(new am4charts.ColumnSeries());
  series3.dataFields.valueY = "recovered";
  series3.dataFields.categoryX = "country";
  series3.name = "Oporavljenih";
  series3.tooltipText = "{name}: [bold]{valueY}[/]";
  series3.tooltip.autoTextColor = false;
  series3.tooltip.label.fill = am4core.color("#fff");
  series3.stacked = true;

  // Add cursor
  chart.cursor = new am4charts.XYCursor();
}


function createHistoryChartHrv(casesHistory, deathsHistory, recoveredHistory) {
  // Themes begin
  am4core.useTheme(am4themes_animated);

  // Create chart instance
  var chart = am4core.create("chartdiv2", am4charts.XYChart);

  chart.responsive.useDefault = false
  chart.responsive.enabled = true;

  chart.responsive.rules.push({
    relevant: function (target) {
      if (target.pixelWidth <= 400) {
        return true;
      }

      return false;
    },
    state: function (target, stateId) {
      if (target instanceof am4charts.Chart) {
        var state = target.states.create(stateId);
        state.properties.paddingBottom = 5;
        state.properties.paddingLeft = 0;
        return state;
      }
      return null;
    }
  });

  // Create axes
  var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
  dateAxis.renderer.minGridDistance = 60;
  // dateAxis.title.text = "Datum";
  // dateAxis.title.fill = am4core.color("#fff");
  // dateAxis.title.fillOpacity = 0.2;
  dateAxis.renderer.grid.template.location = 0;
  dateAxis.renderer.labels.template.fill = am4core.color("#fff");
  dateAxis.renderer.grid.template.stroke = am4core.color("#fff");

  var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  // valueAxis.renderer.minGridDistance = 60;
  // valueAxis.title.text = "Broj zaraženih, umrlih i oporavljenih";
  // valueAxis.title.fill = am4core.color("#fff");
  // valueAxis.title.fillOpacity = 0.2;
  valueAxis.renderer.grid.template.location = 0;
  valueAxis.renderer.labels.template.fill = am4core.color("#fff");
  valueAxis.renderer.grid.template.stroke = am4core.color("#fff");

  chart.colors.list = [
    am4core.color("#faa05a"),
    am4core.color("#f0506e"),
    am4core.color("#32d296")
  ];

  // Create series
  var cases = chart.series.push(new am4charts.LineSeries());
  cases.dataFields.valueY = "cases";
  cases.dataFields.dateX = "date";
  cases.tensionX = 0.8;
  cases.strokeWidth = 2;
  cases.tooltipText = "Zaraženih: [bold]{valueY}[/]";
  cases.tooltip.autoTextColor = false;
  cases.tooltip.label.fill = am4core.color("#fff");
  cases.data = JSON.parse(JSON.stringify(casesHistory));

  var deaths = chart.series.push(new am4charts.LineSeries());
  deaths.dataFields.valueY = "deaths";
  deaths.dataFields.dateX = "date";
  deaths.tensionX = 0.8;
  deaths.strokeWidth = 2;
  deaths.tooltipText = "Umrlih: [bold]{valueY}[/]";
  deaths.tooltip.autoTextColor = false;
  deaths.tooltip.label.fill = am4core.color("#fff");
  deaths.data = JSON.parse(JSON.stringify(deathsHistory));

  var recovered = chart.series.push(new am4charts.LineSeries());
  recovered.dataFields.valueY = "recovered";
  recovered.dataFields.dateX = "date";
  recovered.tensionX = 0.8;
  recovered.strokeWidth = 2;
  // recovered.stroke = am4core.color("#32d296");
  recovered.tooltipText = "Oporavljenih: [bold]{valueY}[/]";
  recovered.tooltip.autoTextColor = false;
  recovered.tooltip.label.fill = am4core.color("#fff");
  // recovered.tooltip.getFillFromObject = false;
  // recovered.tooltip.background.fill = am4core.color("#32d296");
  recovered.data = JSON.parse(JSON.stringify(recoveredHistory));

  // Add cursor
  chart.cursor = new am4charts.XYCursor();
  chart.cursor.fullWidthLineX = true;
  chart.cursor.xAxis = dateAxis;
  chart.cursor.lineX.strokeWidth = 0;
  chart.cursor.lineX.fill = am4core.color("#fff");
  chart.cursor.lineX.fillOpacity = 0.1;

  // Add scrollbar
  chart.scrollbarX = new am4core.Scrollbar();
  chart.scrollbarX.parent = chart.bottomAxesContainer;
  chart.scrollbarX.background.fill = am4core.color("#009ee0");
  chart.scrollbarX.endGrip.background.fill = am4core.color("#009ee0");
  chart.scrollbarX.endGrip.background.states.getKey('hover').properties.fill = am4core.color("#009ee0");
  chart.scrollbarX.endGrip.background.states.getKey('down').properties.fill = am4core.color("#009ee0");
  chart.scrollbarX.startGrip.background.fill = am4core.color("#009ee0");
  chart.scrollbarX.startGrip.background.states.getKey('hover').properties.fill = am4core.color("#009ee0");
  chart.scrollbarX.startGrip.background.states.getKey('down').properties.fill = am4core.color("#009ee0");
  chart.scrollbarX.thumb.background.fill = am4core.color("#009ee0");
  chart.scrollbarX.thumb.background.states.getKey('hover').properties.fill = am4core.color("#009ee0");
  chart.scrollbarX.thumb.background.states.getKey('down').properties.fill = am4core.color("#009ee0");
  chart.scrollbarX.stroke = am4core.color("#009ee0");
  chart.scrollbarX.minHeight = 6;
}


function createHistoryChartAll(casesHistory, deathsHistory, recoveredHistory) {
  // Themes begin
  am4core.useTheme(am4themes_animated);

  // Create chart instance
  var chart = am4core.create("chartdiv3", am4charts.XYChart);

  chart.responsive.useDefault = false
  chart.responsive.enabled = true;

  chart.responsive.rules.push({
    relevant: function (target) {
      if (target.pixelWidth <= 400) {
        return true;
      }

      return false;
    },
    state: function (target, stateId) {
      if (target instanceof am4charts.Chart) {
        var state = target.states.create(stateId);
        state.properties.paddingBottom = 5;
        state.properties.paddingLeft = 0;
        return state;
      }
      return null;
    }
  });

  // Create axes
  var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
  dateAxis.renderer.minGridDistance = 60;
  // dateAxis.title.text = "Datum";
  // dateAxis.title.fill = am4core.color("#fff");
  // dateAxis.title.fillOpacity = 0.2;
  dateAxis.renderer.grid.template.location = 0;
  dateAxis.renderer.labels.template.fill = am4core.color("#fff");
  dateAxis.renderer.grid.template.stroke = am4core.color("#fff");

  var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  // valueAxis.renderer.minGridDistance = 20;
  // valueAxis.title.text = "Broj zaraženih, umrlih i oporavljenih";
  // valueAxis.title.fill = am4core.color("#fff");
  // valueAxis.title.fillOpacity = 0.2;
  valueAxis.renderer.grid.template.location = 0;
  valueAxis.renderer.labels.template.fill = am4core.color("#fff");
  valueAxis.renderer.grid.template.stroke = am4core.color("#fff");

  chart.colors.list = [
    am4core.color("#faa05a"),
    am4core.color("#f0506e"),
    am4core.color("#32d296")
  ];

  // Create series
  var cases = chart.series.push(new am4charts.LineSeries());
  cases.dataFields.valueY = "cases";
  cases.dataFields.dateX = "date";
  cases.tensionX = 0.8;
  cases.strokeWidth = 2;
  cases.tooltipText = "Zaraženih: [bold]{valueY}[/]";
  cases.tooltip.autoTextColor = false;
  cases.tooltip.label.fill = am4core.color("#fff");
  cases.data = JSON.parse(JSON.stringify(casesHistory));

  var deaths = chart.series.push(new am4charts.LineSeries());
  deaths.dataFields.valueY = "deaths";
  deaths.dataFields.dateX = "date";
  deaths.tensionX = 0.8;
  deaths.strokeWidth = 2;
  deaths.tooltipText = "Umrlih: [bold]{valueY}[/]";
  deaths.tooltip.autoTextColor = false;
  deaths.tooltip.label.fill = am4core.color("#fff");
  deaths.data = JSON.parse(JSON.stringify(deathsHistory));

  var recovered = chart.series.push(new am4charts.LineSeries());
  recovered.dataFields.valueY = "recovered";
  recovered.dataFields.dateX = "date";
  recovered.tensionX = 0.8;
  recovered.strokeWidth = 2;
  // recovered.stroke = am4core.color("#32d296");
  recovered.tooltipText = "Oporavljenih: [bold]{valueY}[/]";
  recovered.tooltip.autoTextColor = false;
  recovered.tooltip.label.fill = am4core.color("#fff");
  // recovered.tooltip.getFillFromObject = false;
  // recovered.tooltip.background.fill = am4core.color("#32d296");
  recovered.data = JSON.parse(JSON.stringify(recoveredHistory));

  // Add cursor
  chart.cursor = new am4charts.XYCursor();
  chart.cursor.fullWidthLineX = true;
  chart.cursor.xAxis = dateAxis;
  chart.cursor.lineX.strokeWidth = 0;
  chart.cursor.lineX.fill = am4core.color("#fff");
  chart.cursor.lineX.fillOpacity = 0.1;

  // Add scrollbar
  chart.scrollbarX = new am4core.Scrollbar();
  chart.scrollbarX.parent = chart.bottomAxesContainer;
  chart.scrollbarX.background.fill = am4core.color("#009ee0");
  chart.scrollbarX.endGrip.background.fill = am4core.color("#009ee0");
  chart.scrollbarX.endGrip.background.states.getKey('hover').properties.fill = am4core.color("#009ee0");
  chart.scrollbarX.endGrip.background.states.getKey('down').properties.fill = am4core.color("#009ee0");
  chart.scrollbarX.startGrip.background.fill = am4core.color("#009ee0");
  chart.scrollbarX.startGrip.background.states.getKey('hover').properties.fill = am4core.color("#009ee0");
  chart.scrollbarX.startGrip.background.states.getKey('down').properties.fill = am4core.color("#009ee0");
  chart.scrollbarX.thumb.background.fill = am4core.color("#009ee0");
  chart.scrollbarX.thumb.background.states.getKey('hover').properties.fill = am4core.color("#009ee0");
  chart.scrollbarX.thumb.background.states.getKey('down').properties.fill = am4core.color("#009ee0");
  chart.scrollbarX.stroke = am4core.color("#009ee0");
  chart.scrollbarX.minHeight = 6;
}



// Close sidebar
function openSidebar() {
  sidebar.style.left = "0";
  closeSidebarIcon.style.right = "0";
}

function closeSidebar() {
  sidebar.style.left = "-320px";
  closeSidebarIcon.style.right = "-40px";
}

function toggleSidebar() {
  return sidebar.style.left == "-320px" ? openSidebar() : closeSidebar();
}

closeSidebarIcon.addEventListener("click", function () {
  this.classList.toggle("fa-angle-right");
  toggleSidebar();
  mainContent.classList.toggle("ml-0");
});


function mediaQueryMatches(x) {
  if (x.matches) { // If media query matches
    closeSidebarIcon.classList.toggle("fa-angle-right");
    sidebar.style.left = "-320px";
    closeSidebarIcon.style.right = "-40px";
  } else {
    sidebar.style.left = "0";
    closeSidebarIcon.style.right = "0";
  }
}

var x = window.matchMedia("(max-width: 1024px)");
mediaQueryMatches(x);
x.addListener(mediaQueryMatches);



getAllCountries("https://corona.lmao.ninja/countries?sort=cases");
getWorldStatistics("https://corona.lmao.ninja/all");
getHRV("https://corona.lmao.ninja/countries/HRV");
getHistoricalDataHrv("https://corona.lmao.ninja/v2/historical/HRV");
getHistoricalDataAll("https://corona.lmao.ninja/v2/historical/all");