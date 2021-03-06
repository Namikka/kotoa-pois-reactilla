import ForecastModel from './models/forecastModel';

type InfoBadge = {
    name: string;
    level: string;
    type: string;
};
/**
// Return value commented now because I don't want VisualStudioCode to be annoying
function clothingBadgeGenerator (weatherDataObject: ForecastModel) { //: Array<InfoBadge> {}
*/

function forecastObjectHandler(weatherDataList: Array<ForecastModel>): Array<ForecastModel> | null {
    // Just in case we got this 
    if (weatherDataList.length < 1) return null;
    const badgedWeatherDataList = weatherDataList.map((forecast: ForecastModel) => {
        const windSpeed = parseFloat(forecast.WindSpeedMS);
        const temperature = parseFloat(forecast.Temperature);
        const weatherSymbol = forecast.WeatherSymbol3;
        const rainAmount = forecast.Rain; // No need to parsefloat because someone didn't set the proper type;
        const badgeArray: Array<InfoBadge> = [];
        const isItWinter: boolean = temperature < -4;

        // Custom badges for slush and stuff.
        if (weatherSymbol === "82.0") {
            badgeArray.push({ name: "Räntää", level: "warning", type: "condition" });
        } else if (weatherSymbol === "67.0") {
            badgeArray.push({ name: "Raekuuroja", level: "warning", type: "condition" });
        } else if (weatherSymbol === "59.0") {
            badgeArray.push({ name: "Paljon lunta", level: "warning", type: "condition" });
        }
        
        // WIND
        if (windSpeed > 15) {
            badgeArray.push({ name: "KOVAA TUULTA", level: "danger", type: "wind" });
        }
        if (15 >= windSpeed && windSpeed > 8) {
            badgeArray.push({ name: "Aika tuulista", level: "warning", type: "wind"  });
        }
        if (8 >= windSpeed && windSpeed > 4) {
            badgeArray.push({ name: "Tuulista", level: "info", type: "wind" });
        }
        // TEMPERATURE
        if (temperature <= -25) {
            badgeArray.push({ name: "KOVA PAKKANEN", level: "danger", type: "temperature"  });
        }
        if (-25 < temperature && temperature <= -15) {
            badgeArray.push({ name: "Pakkanen", level: "warning", type: "temperature" });
        }
        if (-15 < temperature && temperature <= 0) {
            badgeArray.push({ name: "Kylmä", level: "warning", type: "temperature"  });
        }
        if (0 < temperature && temperature <= 10) {
            badgeArray.push({ name: "Viileää", level: "info", type: "temperature" });
        }
        if (10 < temperature && temperature <= 18) {
            badgeArray.push({ name: "Huppari/Neule keli", level: "info", type: "temperature" });
        }
        if (18 < temperature && temperature <= 23) {
            badgeArray.push({ name: "Lämmintä", level: "info", type: "temperature" });
        }
        if (23 < temperature && temperature <= 27) {
            badgeArray.push({ name: "Helle", level: "warning", type: "temperature"  });
        }
        if (27 < temperature) {
            badgeArray.push({ name: "KOVA HELLE", level: "danger", type: "temperature"  });
        }
        // RAIN / SNOW
        if (rainAmount < 1 && rainAmount > 0) {
            (isItWinter) ? 
            badgeArray.push({ name: "Vähän lunta", level: "info", type: "rain" }) : 
            badgeArray.push({ name: "Tihuttaa", level: "info", type: "rain" });
            
        }
        if (rainAmount < 3 && rainAmount >= 1) {
            (isItWinter) ? 
            badgeArray.push({ name: "Sataa lunta", level: "info", type: "rain" }) : 
            badgeArray.push({ name: "Sataa", level: "info", type: "rain" });
        }
        if (rainAmount < 6 && rainAmount >= 3) {
            (isItWinter) ? 
            badgeArray.push({ name: "Sataa paljon lunta", level: "info", type: "rain" }) : 
            badgeArray.push({ name: "Sataa paljon", level: "info", type: "rain" });
        } 
        if (rainAmount > 6) {
            (isItWinter) ? 
            badgeArray.push({ name: "LUNTA PALJON", level: "danger", type: "rain" }) : 
            badgeArray.push({ name: "VITUSTI VETTÄ", level: "danger", type: "rain" });
        }
        forecast.BadgeList = badgeArray;
        return forecast;
    });
    return badgedWeatherDataList;
}

export default forecastObjectHandler;