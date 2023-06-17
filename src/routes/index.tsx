import {
  Show,
  createMemo,
  createSignal,
  type JSX,
  createResource,
  Suspense,
  ErrorBoundary,
} from "solid-js";

const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

type SubmitDataHandler = JSX.EventHandlerUnion<
  HTMLFormElement,
  Event & {
    submitter: HTMLElement;
  }
>;

export default function App() {
  const [cityName, setCityName] = createSignal<string | undefined>();
  const [tempUnit, setTempUnit] = createSignal("Celcius");

  const [temperature] = createResource(cityName, async (city) => {
    const result = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
    );
    const weather = await result.json();
    if (weather.cod !== 200) {
      throw new Error(weather.message);
    }
    return {
      kelvin: weather.main.temp as number,
      celcius: Math.round(weather.main.temp - 273.15),
    };
  });

  const handleSubmit: SubmitDataHandler = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formElements = form.elements as typeof form.elements & {
      cityName: HTMLInputElement;
    };
    const cityName = formElements.cityName.value;
    if (!cityName) return;
    setCityName(cityName);
  };

  return (
    <>
      <h2>Weather</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="City name" name="cityName" />
        <button type="submit">Check Weather</button>
      </form>

      <ErrorBoundary
        fallback={(err, reset) => (
          <div>
            Something Went Wrong: {err.message}
            <button
              onClick={() => {
                setCityName(undefined);
                reset();
              }}
            >
              Retry
            </button>
          </div>
        )}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <Show when={temperature()}>
            <p>
              The current weather in <strong>{cityName()}</strong> is:{" "}
              <Show
                when={tempUnit() === "Celcius"}
                fallback={temperature()?.kelvin}
              >
                {temperature()?.celcius}
              </Show>
            </p>
            <p>
              <button
                onClick={() => {
                  setTempUnit("Celcius");
                }}
              >
                Celcius
              </button>

              <button
                onClick={() => {
                  setTempUnit("Kelvin");
                }}
              >
                Kelvin
              </button>
            </p>
          </Show>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
