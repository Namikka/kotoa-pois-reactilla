export default class ForecastModel {
    constructor() {
      this.Temperature = "";
      this.WindDirection = "";
      this.BadgeList = [];
      this.WeatherSymbol3 = "";
      this.WindSpeedMS = "";
      this.WindGust = "";
      this.Time = "";
      this.Rain = 0;
    }
  
    public Temperature: string;  
    public WindDirection: string;  
    public BadgeList: Array<object>;  
    public WeatherSymbol3: string;  
    public WindSpeedMS: string;  
    public WindGust: string;  
    public Time: string;
    public Rain: number;
  }
  