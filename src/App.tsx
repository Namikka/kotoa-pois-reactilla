import React, { useState } from 'react';
import './App.css';
import ForecastModel from './models/forecastModel';
import axios, { AxiosError, AxiosResponse } from 'axios';
import * as xml2js from 'xml2js';
import { stripPrefix } from 'xml2js/lib/processors';
import * as _ from "lodash";
import { BsWsfElement } from './models/bsWfsElement';


const kelloNyt = new Date();

// TODO: Daylight savings, should we add it or just IDGAF?
const startTime: string = new Date(kelloNyt.getFullYear(), kelloNyt.getMonth(), kelloNyt.getDate(), kelloNyt.getHours()).toISOString() + "&";
const stopTime: string = new Date(kelloNyt.getFullYear(), kelloNyt.getMonth(), kelloNyt.getDate(), kelloNyt.getHours() + 1).toISOString() + "&";


// Everything is strings even though some values should be numbers but let's not get that gritty yet.
const place: string = "place=Helsinki&"
const ennusteFMIParameters: string = "parameters=Precipitation1h,Temperature,WindDirection,WindSpeedMS,WindGust,WeatherSymbol3&";
const ennusteBaseURL: string = "http://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=fmi::forecast::hirlam::surface::point::simple&";

const forecastBreakPointIndex = ennusteFMIParameters.match(/(\,|\&)/g)?.length || 5;
// const WeatherForeCastElement:  React.FunctionComponent<{ forecast: ForecastModel }> = ({ forecast }) => (
//   <div>
//     Lämpötila: {forecast.Temperature},<br/> 
//     Aika: {forecast.Time},<br/> 
//     Tuulen suunta: {forecast.WindDirection},<br/> 
//     Tuulen nopeus: {forecast.WindSpeedMS},<br/> 
//   </div>
// );

const devElementThingie: React.FC<{ one: "", two: "", three: ""  }> = ({ one, two, three }) => (
  <p>one: {one}, two: {two}, three {three} </p>
);


function App() {
  const [errored, setErroredStatus] = useState(false||"");
  const [weatherDataList, setWeatherDataList] = useState([] as Array<ForecastModel>);
  const [forecastProcessingStatus, setForecastProcessStatus] = useState("init" as string);
  const [resultParameterNames, setResultParameterNames] = useState([] as Array<string>);
  // And a breakPointString to show where the breakpoint is, using string OR undefined because the _.last returns those values
  const [rowBreakPoint, setrowBreakPoint] = useState("");
  const [info, setInfo] = useState(null);
  const ennusteUrlString = ennusteBaseURL + place + "starttime=" + startTime + "endtime=" + stopTime + ennusteFMIParameters;
  
  const getWeatherForecasts = function(forecastString: string) {
    if (forecastString.length < 1) {
      setForecastProcessStatus("failed");
      setErroredStatus("EnnusteStringi olematon :(");
      return;
    }
    setForecastProcessStatus("loading");
    axios.get(forecastString).then((forecastRequestResponse:AxiosResponse) => {
      const forecastResults:string = forecastRequestResponse.data;
      xml2js.parseString(forecastResults, {
        tagNameProcessors: [stripPrefix],
        attrNameProcessors: [stripPrefix]
      }, (error: Error, result: { FeatureCollection: { member: Array<BsWsfElement> } }) => {
        if (error !== null) {
          setErroredStatus("Ennusteen xml -> js käsittelyssä tapahtui virhe.");
          setForecastProcessStatus("failed");
          console.error("xml2js.parseString virhe: ", error);
        } else {
          setForecastProcessStatus("processing");
          setErroredStatus("");
          let forecastForAnHourObject = new ForecastModel();
          result.FeatureCollection.member.forEach((value: any, i: number, wholeList:Array<any>) => {            
            const forecastData: BsWsfElement = value.BsWfsElement[0];
            forecastForAnHourObject = (i % forecastBreakPointIndex === 0) ? new ForecastModel() : forecastForAnHourObject;

            // TODO: Reasearch if this line could replace the whole switch case thingie
            // forecastForAnHourObject[forecastData.ParameterName[0]] = forecastData.ParameterValue[0]

            switch(forecastData.ParameterName[0]) {
              case "Precipitation1h":
                forecastForAnHourObject.Rain = parseFloat(forecastData.ParameterValue[0]);
                break;
              case "Temperature":
                forecastForAnHourObject.Temperature = forecastData.ParameterValue[0];
                break;
              case "WindDirection":
                forecastForAnHourObject.WindDirection = forecastData.ParameterValue[0];
                break;
              case "WindSpeedMS":
                forecastForAnHourObject.WindSpeedMS = forecastData.ParameterValue[0];
                break;
              case "WindGust":
                forecastForAnHourObject.WindGust = forecastData.ParameterValue[0];
                break;
              case "WeatherSymbol3":
                forecastForAnHourObject.WeatherSymbol3 = forecastData.ParameterValue[0];
                break;
            }
            if (i > 0 && i % forecastBreakPointIndex === 0) {
              // console.log("weatherDataList.push when i is ", i);
              // console.log("weatherDataList.length = ", weatherDataList.length);
              forecastForAnHourObject.Time = forecastData.Time[0];          
              weatherDataList.push(forecastForAnHourObject);
            }
          });
        }
      });
    }).then(() => {
      setForecastProcessStatus("processed");
      setWeatherDataList(weatherDataList);
    }).catch((error: AxiosError) => {
      console.error("Sää ennusteen haku epäonnistui koska ", error);
      setErroredStatus("Sää ennusteen haku epäonnistui");
    })
  };
  if (forecastProcessingStatus === "init") {
    getWeatherForecasts(ennusteUrlString);
  }
  return (
    <div className="App">
      {(errored !== "") ?       
        <h1>Ennusteen haussa virhe :(</h1>        
        :        
        <>
          <div>Ennusteita haetaan...</div><br />
          <code>{forecastProcessingStatus}</code>
        </>
      }
    </div>
  );
}

export default App;
