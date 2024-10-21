import dotenv from 'dotenv';
dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object
class Weather {
  city: string;
  stateId: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;

  constructor(
    city: string,
    stateId: string,
    date: string,
    icon: string,
    iconDescription: string,
    tempF: number,
    windSpeed: number,
    humidity: number,
  ) {
    this.city = city;
    this.stateId = stateId;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

// Complete the WeatherService class
class WeatherService {
  // Define the baseURL, API key, and city name properties
  private baseURL?: string;
  private apiKey?: string;
  private cityName?: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
  }

  // Create fetchLocationData method
  private async fetchLocationData(query: string) {
    try {
      const response = await fetch(query);
      if (!response.ok) {
        throw new Error(`Failed to fetch location data for city: ${this.cityName}`);
      }
      const data = await response.json();
      return { lat: data[0].lat, lon: data[0].lon };
    } catch (err) {
      console.error('Error fetching location data', err);
      throw err;
    }
  }

  // Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    const { lat, lon } = locationData;
    return { lat, lon };
  }

  // Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    return `${this.baseURL}/geo/1.0/direct?q=${encodeURIComponent(this.cityName!)}&limit=1&appid=${this.apiKey}`;
  }

  // Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`;
  }

  // Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    try {
      const geocodeURL = this.buildGeocodeQuery();
      const locationData = await this.fetchLocationData(geocodeURL);
      const coordinates = this.destructureLocationData(locationData);
      return coordinates;
    } catch (err) {
      console.log('Error in fetchAndDestructureLocationData:', err);
      throw err;
    }
  }

  // Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const weatherQuery = this.buildWeatherQuery(coordinates);
      const response = await fetch(weatherQuery);
      if (!response.ok) {
        return `Failed to fetch weatehr data for ${this.cityName}`;
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.log('Error in fetchWeatherData:', err);
      return err;
    }
  }

  // Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    const city = response.city.name;
    const cityId = response.city.id;
    const date = new Date(response.list[0].dt * 1000).toLocaleDateString();
    const icon = response.list[0].weather[0].icon;
    const iconDescription = response.list[0].weather[0].description;
    const tempF = response.list[0].main.temp;
    const windSpeed = response.list[0].wind.speed;
    const humidity = response.list[0].main.humidity;

    return new Weather(city, cityId, date, icon, iconDescription, tempF, windSpeed, humidity);
  }

  // Complete buildForecastArray method
  private buildForecastArray(_currentWeather: Weather, weatherData: any[]) {
    const forecastArray = [];
    const today = new Date().toLocaleDateString();

    for (let i = 0; i < weatherData.length; i += 7) {
      const date = new Date(weatherData[i].dt * 1000).toLocaleDateString();

      if (date === today) continue;

      const icon = weatherData[i].weather[0].icon;
      const iconDescription = weatherData[i].weather[0].description;
      const tempF = weatherData[i].main.temp;
      const windSpeed = weatherData[i].wind.speed;
      const humidity = weatherData[i].main.humidity;

      forecastArray.push({
        date,
        icon,
        iconDescription,
        tempF,
        windSpeed,
        humidity,
      });
    }

    return forecastArray;
  }

  // Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    this.cityName = city;
    try {
      const coordinates = await this.fetchAndDestructureLocationData();
      const weatherData = await this.fetchWeatherData(coordinates);
      const currentWeather = this.parseCurrentWeather(weatherData);
      const forecastWeather = this.buildForecastArray(currentWeather, weatherData.list);
      const completeWeather = [currentWeather, ...forecastWeather];
      return completeWeather;
    } catch (err) {
      console.error(`Error in getWeatherForCity for ${city}:`, err);
      throw err;
    }
  }
}

export default new WeatherService();
