import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

const forecastItemsLength = 5;
const loadingText = "Ennusteita haetaan ja käsitellään...";
const failedText = "Ennusteen haussa virhe :(";
const successText = "Säätilanne ulkona seuraavan parin tunnin ajan";


test('Generates app', () => {
  const { getByText } = render(<App />);
  const errorMessage = getByText(loadingText);
  expect(errorMessage).toBeInTheDocument();
});

// Help from here: https://medium.com/rd-shipit/testing-asynchronous-code-with-jest-and-testing-library-react-cfc185d7bd78
// and also here: https://www.polvara.me/posts/how-to-test-asynchronous-methods/

test('Generates complete list of forecasts', async () => {
  const { container } = render(<App />);
  await waitFor(() => { 
    container.querySelectorAll('[class="weatherStatus"]') 
  }).then(() => {
    const forecastItemContainerClass = container.querySelectorAll('[class="weatherStatus"]');// findByPlaceholderText("weatherStatusData");
    expect(forecastItemContainerClass.length).toEqual(forecastItemsLength);
  }).catch((failure:any) => {
    console.error("Generates complete list of forecasts failed.");
    console.error("Reason: ", failure);
    return false;
  });
  
//   const { container } = render(<App />);
//   const forecastItemContainerClass = container.querySelectorAll('[class="weatherStatus"]');// findByPlaceholderText("weatherStatusData");
//   expect(forecastItemContainerClass.length).toEqual(forecastItemsLength);
});

// test for images to be loaded