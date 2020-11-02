import React, { useEffect, useState } from 'react';
import './App.css';
import{Card, CardContent, FormControl, MenuItem, Select} from '@material-ui/core'
import Infobox from './InfoBox'
import Map from './Map'
import Table from './Table'
import {sortData, prettyPrintStat} from './utils'
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";
function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('WorldWide');
  const [countryInfo, setCountryInfo] = useState({});
  const [casesType, setCasesType] = useState("cases");
  const [mapCountries, setMapCountries] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  
  useEffect(() =>{
      const getCountiresData = async()=>{
        await fetch("https://disease.sh/v3/covid-19/countries")
              .then((response) => response.json())
              .then((data)=>{
                const countries = data.map((country)=>(
                  {
                    name: country.country,
                    value: country.countryInfo.iso2
                  })) 

                  const sortedData = sortData(data);
                  setTableData(sortedData);
                  setCountries(countries);  
                  setMapCountries(data);
              })
      }
    getCountiresData();
  },[])

  useEffect(() =>{
    let tempObject = {target:{value:"WorldWide"}};
    onCountryChange(tempObject);
},[])

const onCountryChange = async(event) =>
{
  const countryCode = event.target.value;
  const url = countryCode === "WorldWide" ? "https://disease.sh/v3/covid-19/all" :
                                          `https://disease.sh/v3/covid-19/countries/${countryCode}`;
  await fetch(url)
  .then(response => response.json())
  .then(data => {
    setCountry(countryCode);
    setCountryInfo(data);
    const mapObj = countryCode === "WorldWide" ? { lat: 34.80746, lng: -40.4796 } : { lat: data.countryInfo.lat, lng: data.countryInfo.long };
    setMapCenter(mapObj);
    setMapZoom(4);
  })
}
  return (
    <div className="app">
      <div className = "app__left">
        <div className = "app__header">
          <h1>COVID-19 Tracker</h1>
            <FormControl className = "app__dropdown">
              <Select variant = "outlined" value = {country} onChange = {onCountryChange}>
              <MenuItem value ="WorldWide">World Wide</MenuItem>
              {  countries.map((country) =>(
                  <MenuItem value ={country.value}>{country.name}</MenuItem>
              ))}
              </Select>
            </FormControl>
        </div>
        <div className = "app__stats">
          <Infobox active = {casesType === 'cases'} isRed onClick={(e) => setCasesType("cases")} title = "Coronavirus Cases"  cases = {prettyPrintStat(countryInfo.todayCases)} total = {countryInfo.cases}/>     
          <Infobox active = {casesType === 'recovered'} onClick={(e) => setCasesType("recovered")} title = "Recovered" cases = {prettyPrintStat(countryInfo.todayRecovered)} total = {countryInfo.recovered}/>
          <Infobox active = {casesType === 'deaths'} isRed onClick={(e) => setCasesType("deaths")} title = "Death" cases = {prettyPrintStat(countryInfo.todayDeaths)} total = {countryInfo.deaths}/>   
        </div>  
        <Map countries = {mapCountries} casesType= {casesType} center={mapCenter} zoom = {mapZoom}/>
      </div>
      <Card className = "app__right">
        <CardContent>
          <h3>Live cases by country</h3>
          <Table countries = {tableData}/>
          <h3>Worldwide new {casesType}</h3>
          {/* Graph */}
          <LineGraph casesType = {casesType}/>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
