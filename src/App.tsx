import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import "./index.scss";
import React, { useState, useEffect } from 'react';
import ForecastModel from './models/forecastModel';
import axios, { AxiosError, AxiosResponse } from 'axios';
import * as xml2js from 'xml2js';
import { stripPrefix } from 'xml2js/lib/processors';
import Badge from 'react-bootstrap/Badge'
import { BsWsfElement } from './models/bsWfsElement';
import forecastObjectHandler from './forecastHandler';
import { WeatherIconDescriptions } from './components/weatherIconDescriptions';

type InfoBadge = {
  name: string;
  level: string;
  type: string;
};

// I don't know what I'm doing but sure af I try
// type WeatherDescription = { description: string; };
// interface WeatherIconDescription {
//   [key: string]: WeatherDescription;
// }

// let weatherDescriptionList = WeatherIconDescriptions as WeatherIconDescription;

const kelloNyt = new Date();

// TODO: Daylight savings, should we add it or just IDGAF?
const startTime: string = new Date(kelloNyt.getFullYear(), kelloNyt.getMonth(), kelloNyt.getDate(), kelloNyt.getHours()).toISOString() + "&";
const stopTime: string = new Date(kelloNyt.getFullYear(), kelloNyt.getMonth(), kelloNyt.getDate(), kelloNyt.getHours() + 6).toISOString() + "&";

// Everything is strings even though some values should be numbers but let's not get that gritty yet.
const place: string = "geoid=843438&";
const ennusteFMIParameters: string = "parameters=Precipitation1h,Temperature,WindDirection,WindSpeedMS,WindGust,WeatherSymbol3&";
const ennusteBaseURL: string = "http://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=fmi::forecast::hirlam::surface::point::simple&";

// eslint-disable-next-line no-useless-escape
const forecastBreakPointIndex = ennusteFMIParameters.match(/(\,|\&)/g)?.length || 5;



const WeatherForeCastElement: React.FC<{forecast:ForecastModel}> = ({forecast}) => {
  // The slice is for getting rid of the seconds since we don't need them.
  const timeString = new Date(forecast.Time).toLocaleTimeString().slice(0, -3);
  const weatherIconSrc = process.env.PUBLIC_URL + "/weatherIcons/"+forecast.WeatherSymbol3+".svg";
  const badgeElements = forecast.BadgeList.map((badge:any, badgeNumber:number) => {
    return <Badge key={badgeNumber} variant={badge.level}>{badge.name}</Badge>; 
  });
  const roundedTemperature = Math.ceil(parseFloat(forecast.Temperature)).toString();
  return (
    <div className="weatherStatus">
        <div className="weatherIconContainer">
          <img className="weatherIcon" alt={WeatherIconDescriptions[forecast.WeatherSymbol3]} src={weatherIconSrc}></img>
        </div>
        <div className='weatherInfo'>
						<p>
							Kello <strong>{timeString}</strong> lämpötila on <strong>{roundedTemperature}&deg;c</strong>
						</p>
					</div>
        <div className="weatherBadges">
          {badgeElements}
        </div>
      </div>
    )
}

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
                forecastForAnHourObject.WeatherSymbol3 = forecastData.ParameterValue[0].slice(0,-2);
                break;
            }
            if (i > 0 && i % forecastBreakPointIndex === 0) {
              forecastForAnHourObject.Time = forecastData.Time[0];          
              weatherDataList.push(forecastForAnHourObject);
            }
          });
        }
      });
    }).then(() => {
      // Then we add the badges, which is not written using react for now
      const badgedWeatherDatalist = forecastObjectHandler(weatherDataList);
      if (badgedWeatherDatalist === null) {
        return weatherDataList;
      } else {
        return badgedWeatherDatalist;
      }
    }).then((handledWeatherDataList: ForecastModel[]) => {
      setForecastProcessStatus("processed");
      setWeatherDataList(weatherDataList);
    }).catch((error: AxiosError) => {
      console.error("Sää ennusteen haku epäonnistui koska ", error);
      setErroredStatus("Sää ennusteen haku epäonnistui");
    });    
  },[forecastURLString, weatherDataList, timeParameters]);

  return (
    <div className="kotoapois">
      {(errored !== "") ?       
        <h1>Ennusteen haussa virhe :(</h1>        
        :        
        <>
          <div>Ennusteiden hakutilanne {forecastProcessingStatus}</div><br />
          <div className="weatherStatusData">
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
