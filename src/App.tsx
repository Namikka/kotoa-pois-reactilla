import React, { useState, useEffect } from 'react';
import './App.css';
import ForecastModel from './models/forecastModel';
import axios, { AxiosError, AxiosResponse } from 'axios';
import * as xml2js from 'xml2js';
import { stripPrefix } from 'xml2js/lib/processors';
import * as _ from "lodash";
import { BsWsfElement } from './models/bsWfsElement';
import "./index.scss";

const kelloNyt = new Date();

// TODO: Daylight savings, should we add it or just IDGAF?
const startTime: string = new Date(kelloNyt.getFullYear(), kelloNyt.getMonth(), kelloNyt.getDate(), kelloNyt.getHours()).toISOString() + "&";
const stopTime: string = new Date(kelloNyt.getFullYear(), kelloNyt.getMonth(), kelloNyt.getDate(), kelloNyt.getHours() + 6).toISOString() + "&";


// Everything is strings even though some values should be numbers but let's not get that gritty yet.
const place: string = "place=Helsinki&"
const ennusteFMIParameters: string = "parameters=Precipitation1h,Temperature,WindDirection,WindSpeedMS,WindGust,WeatherSymbol3&";
const ennusteBaseURL: string = "http://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=fmi::forecast::hirlam::surface::point::simple&";

const forecastBreakPointIndex = ennusteFMIParameters.match(/(\,|\&)/g)?.length || 5;


const WeatherForeCastElement: React.FC<{forecast:ForecastModel}> = ({forecast}) => (
  <div>
    <span>{forecast.Time}</span><br/>
    <span>{forecast.Temperature} c</span><br/>
    <span>{forecast.WeatherSymbol3}</span><br/>
  </div>
);


function App() {
  const [errored, setErroredStatus] = useState(false||"");
  const [weatherDataList, setWeatherDataList] = useState([] as Array<ForecastModel>);
  const [forecastProcessingStatus, setForecastProcessStatus] = useState("init" as string);
  const [forecastURLString, setForecastURLString] = useState("");
  const [timeParameters, setTimeParameters] = useState({start:startTime, stop:stopTime});

  useEffect(() => {
    const ennusteUrlString = ennusteBaseURL + place + "starttime=" + timeParameters.start + "endtime=" + timeParameters.stop + ennusteFMIParameters;
    setForecastURLString(ennusteUrlString);
    if (forecastURLString.length < 1) {
      setForecastProcessStatus("failed");
      setErroredStatus("EnnusteStringi olematon :(");
      return;
    }
    setForecastProcessStatus("loading");
    console.debug("API CALL");
    axios.get(forecastURLString).then((forecastRequestResponse:AxiosResponse) => {
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
    });    
  },[forecastURLString, weatherDataList, timeParameters]);

  return (
    <div className="App">
      {(errored !== "") ?       
        <h1>Ennusteen haussa virhe :(</h1>        
        :        
        <>
          <div>Ennusteiden hakutilanne {forecastProcessingStatus}</div><br />
          <div>
            {(forecastProcessingStatus === "processed") &&
              weatherDataList.map((forecastItem: ForecastModel, i:number) => <WeatherForeCastElement forecast={forecastItem} key={i} /> )              
            }
          </div>
        </>
        
      }
    </div>
  );
}

export default App;
