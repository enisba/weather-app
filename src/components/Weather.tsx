import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WindPowerIcon from "@mui/icons-material/WindPower";
import OpacityIcon from "@mui/icons-material/Opacity";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ForecastDay {
  date: string;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    maxwind_kph: number;
    wind_dir: string;
    avghumidity: number;
  };
  hour: Array<{
    time: string;
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_kph: number;
    wind_dir: string;
    humidity: number;
  }>;
}

interface Suggestion {
  id: string;
  name: string;
  country: string;
}

const Weather: React.FC = () => {
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [forecastData, setForecastData] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCity, setSelectedCity] = useState<{ name: string, country: string } | null>(null);
  const [selectedDay, setSelectedDay] = useState<ForecastDay | null>(null);

  useEffect(() => {
    setWeatherBackground();
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const response = await axios.get(
      `https://api.weatherapi.com/v1/search.json?key=${process.env.REACT_APP_WEATHER_API_KEY}&q=${query}`
    );

    setSuggestions(response.data);

  };

  const fetchWeatherForecast = async (cityName: string, countryName: string) => {
    if (!cityName) return;

    setLoading(true);
    setError("");
    setForecastData([]);
    setSelectedCity({ name: cityName, country: countryName });


    const response = await axios.get(
      `https://api.weatherapi.com/v1/forecast.json?key=${process.env.REACT_APP_WEATHER_API_KEY}&q=${cityName}&days=6`
    );

    setForecastData(response.data.forecast.forecastday);
    setCity("");
    setSuggestions([]);
    setWeatherBackground(response.data.forecast.forecastday[0].day.condition.text);
    setLoading(false);
  };

  const setWeatherBackground = (condition: string = "") => {
    let backgroundUrl = "url(https://eg5c9vcv2j9.exactdn.com/wp-content/uploads/2023/07/AdobeStock_440069937-scaled.jpeg?lossy=1&ssl=1)";

    if (condition.includes("Sunny") || condition.includes("Clear")) {
      backgroundUrl = "url(https://cdn2.hubspot.net/hubfs/2936356/maxresdefault.jpg)";
    } else if (condition.includes("Partly Cloudy") || condition.includes("Overcast") || condition.includes("Cloudy")) {
      backgroundUrl = "url(https://www.evrensel.net/upload/dosya/192762.jpg)";
    } else if (condition.includes("Patchy rain nearby") || condition.includes("Light rain") || condition.includes("Moderate rain") || condition.includes("Heavy rain")) {
      backgroundUrl = "url(https://images.pexels.com/photos/125510/pexels-photo-125510.jpeg?cs=srgb&dl=pexels-hikaique-125510.jpg&fm=jpg)";
    } else if (condition.includes("Snow")) {
      backgroundUrl = "url(https://static01.nyt.com/images/2019/11/26/us/26holiday-weather01sub/26holiday-weather01sub-superJumbo.jpg)";
    } else if (condition.includes("Mist")) {
      backgroundUrl = "url(https://cff2.earth.com/uploads/2018/11/13053559/what-is-mist.jpg)";
    }

    document.body.style.backgroundImage = backgroundUrl;
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
  };

  return (
    <Box sx={{ my: 4, bgcolor: "rgba(255, 255, 255, 0.8)", borderRadius: 2, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          WEATHER FORECAST
        </Typography>
      </Box>
      <TextField
        label="City"
        variant="outlined"
        fullWidth
        value={city}
        onChange={(e) => {
          setCity(e.target.value);
          fetchSuggestions(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const selectedSuggestion = suggestions.find(s => s.name.toLowerCase() === city.toLowerCase());
            if (selectedSuggestion) {
              fetchWeatherForecast(selectedSuggestion.name, selectedSuggestion.country);
            }
          }
        }}
        sx={{ mb: 2 }}
      />
      {suggestions.length > 0 && (
        <List>
          {suggestions.map((suggestion) => (
            <ListItem
              button
              key={suggestion.id}
              onClick={() => fetchWeatherForecast(suggestion.name, suggestion.country)}
            >
              <ListItemText primary={`${suggestion.name}, ${suggestion.country}`} />
            </ListItem>
          ))}
        </List>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            const selectedSuggestion = suggestions.find(s => s.name.toLowerCase() === city.toLowerCase());
            if (selectedSuggestion) {
              fetchWeatherForecast(selectedSuggestion.name, selectedSuggestion.country);
            }
          }}
          disabled={loading}
          sx={{ width: '130px', height: '50px', fontSize: '17px' }}
        >
          Get Weather
        </Button>
      </Box>

      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      {forecastData.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            6 Day Weather Forecast
          </Typography>
          {selectedCity && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOnIcon />
              <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                {selectedCity.name}, {selectedCity.country}
              </Typography>
            </Box>
          )}
          <Grid container spacing={2}>
            {forecastData.map((day) => (
              <Grid item xs={12} sm={6} md={4} key={day.date}>
                <Card sx={{ bgcolor: "background.paper", boxShadow: 5 }} onClick={() => setSelectedDay(day)}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        component="img"
                        src={day.day.condition.icon}
                        alt={day.day.condition.text}
                        sx={{ width: 64, height: 64, mr: 2 }}
                      />
                      <Typography variant="h5" component="div">
                        {Math.round(day.day.maxtemp_c)}°C
                      </Typography>
                    </Box>
                    <Typography variant="body1" gutterBottom>
                      {day.day.condition.text}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <WindPowerIcon sx={{ mr: 1, fontSize: '18px' }} />
                      <Typography variant="body2" color="textSecondary">
                        Wind: {day.day.maxwind_kph} kph {day.day.wind_dir}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <OpacityIcon sx={{ mr: 1, fontSize: '18px' }} />
                      <Typography variant="body2" color="textSecondary">
                        Humidity: {day.day.avghumidity}%
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Max Temp: {Math.round(day.day.maxtemp_c)}°C, Min Temp: {Math.round(day.day.mintemp_c)}°C
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      <Dialog
        open={Boolean(selectedDay)}
        onClose={() => setSelectedDay(null)}
        scroll="paper"
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle
          id="scroll-dialog-title"
          sx={{ textAlign: "center", fontWeight: "bold" }}
        >
          Hourly Weather for {selectedDay?.date}
        </DialogTitle>
        <DialogContent dividers>
          {selectedDay && (
            <Box sx={{ width: '105%', height: '300px' }}>
              <Line
                data={{
                  labels: selectedDay.hour.map((hour) =>
                    new Date(hour.time).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  ),
                  datasets: [
                    {
                      label: "Temperature (°C)",
                      data: selectedDay.hour.map((hour) => hour.temp_c),
                      borderColor: "rgba(255, 99, 132, 1)",
                      backgroundColor: "rgba(255, 99, 132, 0.3)",
                      fill: true,
                      tension: 0.4,
                    },
                    {
                      label: "Humidity (%)",
                      data: selectedDay.hour.map((hour) => hour.humidity),
                      borderColor: "rgba(54, 162, 235, 1)",
                      backgroundColor: "rgba(54, 162, 235, 0.3)",
                      fill: true,
                      tension: 0.4,
                    },
                    {
                      label: "Wind Speed (kph)",
                      data: selectedDay.hour.map((hour) => hour.wind_kph),
                      borderColor: "rgba(75, 192, 192, 1)",
                      backgroundColor: "rgba(15, 192, 192, 0.3)",
                      fill: true,
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setSelectedDay(null)}
            variant="contained"
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Weather;
