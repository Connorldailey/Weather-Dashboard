import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  try {
    // Extract cityName from request body
    const { cityName } = req.body;

    // GET weather data from city name
    const weatherData = await WeatherService.getWeatherForCity(cityName);

    // Save city to search history
    await HistoryService.addCity(cityName);

    // Response with weather data
    res.json(weatherData);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// GET search history
router.get('/history', async (_req, res) => {
  try {
    // GET search history data
    const savedCities = await HistoryService.getCities();
    // Response with the data
    res.json(savedCities);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  try {
    // Extract id from request params
    const { id } = req.params;

    // Ensure the id exists
    if (!id) {
      res.status(400).json({ message: 'City id is required' });
    }

    // DELETE the city from the search history
    await HistoryService.removeCity(id);
    // Response with success status
    res.json({ success: 'City successfully removed from search history' });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

export default router;
