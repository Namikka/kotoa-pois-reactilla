import React from 'react';
import ForecastModel from './models/forecastModel';
// import * as _ from "lodash";
type Badge = {
    name: string;
    level: string;
    type: string;
};
function forecastObjectHandler(weatherDataList: Array<ForecastModel>): Array<ForecastModel> | null {
    // Just in case we got this 
    if (weatherDataList.length < 1) return null;
    const badgedWeatherDataList = weatherDataList.map((forecast: ForecastModel) => {
        const windSpeed = parseFloat(forecast.WindSpeedMS);
        const temperature = parseFloat(forecast.Temperature);
        const weatherSymbol = forecast.WeatherSymbol3;
        const rainAmount = forecast.Rain; // No need to parsefloat because someone didn't set the proper type;
        const badgeArray: Array<Badge> = [];
        console.log("windSpeed: ", windSpeed);
        console.log("temperature: ", temperature);
        console.log("weatherSymbol: ", weatherSymbol);
        console.log("rainAmount: ", rainAmount);
        if  (weatherSymbol === "82.0") {
            badgeArray.push({ name: "Räntää", level: "badge-warning", type: "condition" });
           } else if (weatherSymbol === "67.0") {
            badgeArray.push({ name: "Raekuuroja", level: "badge-warning", type: "condition" });

           } else if (weatherSymbol === "59.0") {

            badgeArray.push({ name: "Paljon lunta", level: "badge-warning", type: "condition" });
           }
        if (windSpeed > 15) {
            badgeArray.push({ name: "KOVAA TUULTA", level: "badge-danger", type: "wind" });
        }
        else if (15 >= windSpeed && windSpeed > 8) {
            badgeArray.push({ name: "Aika tuulista", level: "badge-warning", type: "wind"  });
        }
        else if (8 >= windSpeed && windSpeed > 4) {
            badgeArray.push({ name: "Tuulista", level: "badge-info", type: "wind" });
        }
        if (temperature <= -25) {
            badgeArray.push({ name: "KOVA PAKKANEN", level: "badge-danger", type: "temperature"  });
        }
        else if (-25 < temperature && temperature <= -15) {
            badgeArray.push({ name: "Pakkanen", level: "badge-warning", type: "temperature" });
        }
        else if (-15 < temperature && temperature <= 0) {
            badgeArray.push({ name: "Kylmä", level: "badge-warning", type: "temperature"  });
        }
        else if (0 < temperature && temperature <= 10) {
            badgeArray.push({ name: "Viileää", level: "badge-info", type: "temperature" });
        }
        else if (10 < temperature && temperature <= 18) {
            badgeArray.push({ name: "Huppari/Neule keli", level: "badge-info", type: "temperature" });
        }
        else if (18 < temperature && temperature >= 23) {
            badgeArray.push({ name: "Lämmintä", level: "badge-info", type: "temperature" });
        }
        else if (23 < temperature && temperature >= 27) {
            badgeArray.push({ name: "Hellettä", level: "badge-warning", type: "temperature"  });
        }
        else if (27 < temperature) {
            badgeArray.push({ name: "KOVA HELLE", level: "badge-danger", type: "temperature"  });
        }
        if (rainAmount < 1 && rainAmount > 0) {
            badgeArray.push({ name: "Tihuttaa", level: "badge-info", type: "rain" });
        }
        else if (rainAmount < 3 && rainAmount > 1) {
            badgeArray.push({ name: "Sataa", level: "badge-info", type: "rain"  });
        }
        else if (rainAmount < 6 && rainAmount > 3) {
            badgeArray.push({ name: "Sataa paljon", level: "badge-warning", type: "rain" });
        } else if (rainAmount > 6) {
            badgeArray.push({ name: "VITUSTI VETTÄ", level: "badge-danger", type: "rain"  });
        }
        console.log("badgeArray: ", badgeArray);
        forecast.BadgeList = badgeArray;
        // Then custom badges for slush and stuff.
        return forecast;
    });
    return badgedWeatherDataList;
}

export default forecastObjectHandler;