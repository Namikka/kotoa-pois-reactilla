import React from 'react';
import { getByTitle, render } from '@testing-library/react';
import App from './App';

test('Gets forecasts', () => {
  const { getByText } = render(<App />);
  const errorMessage = getByText(/Ennusteen haussa virhe/i);
  expect(errorMessage).not.toBeInTheDocument();
});

test('Lists forecasts', () => {
  const { renderedApp } = render(<App />);
  const forecastItemContainerClass = "weatherStatusData";
  
  //<img className="weatherIcon" alt={WeatherIconDescriptions[forecast.WeatherSymbol3]} src={weatherIconSrc}></img>
  expect(renderedApp).toContainElement() 
});