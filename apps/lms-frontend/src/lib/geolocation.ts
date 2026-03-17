import haversine from "haversine-distance";

type GeolocationSample = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

export type StableGeolocationOptions = {
  maxAccuracyMeters?: number;
  sampleCount?: number;
  timeoutMs?: number;
  minimumSampleCount?: number;
};

export type StableGeolocationResult = {
  latitude: number;
  longitude: number;
  accuracy: number;
  sampleCount: number;
};

const DEFAULT_OPTIONS: Required<StableGeolocationOptions> = {
  maxAccuracyMeters: 1500,
  sampleCount: 5,
  timeoutMs: 12000,
  minimumSampleCount: 3,
};

const roundCoordinate = (value: number) => Number(value.toFixed(6));

const average = (values: number[]) =>
  values.reduce((total, value) => total + value, 0) / values.length;

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middleIndex = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middleIndex - 1] + sorted[middleIndex]) / 2;
  }

  return sorted[middleIndex];
};

const distanceInMeters = (
  first: Pick<GeolocationSample, "latitude" | "longitude">,
  second: Pick<GeolocationSample, "latitude" | "longitude">,
) =>
  haversine(
    { lat: first.latitude, lon: first.longitude },
    { lat: second.latitude, lon: second.longitude },
  );

const toSample = (position: GeolocationPosition): GeolocationSample | null => {
  const { latitude, longitude, accuracy } = position.coords;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    latitude,
    longitude,
    accuracy:
      Number.isFinite(accuracy) && accuracy > 0 ? accuracy : Number.MAX_SAFE_INTEGER,
  };
};

const finalizeSamples = (
  samples: GeolocationSample[],
  options: Required<StableGeolocationOptions>,
): StableGeolocationResult => {
  if (samples.length === 0) {
    throw new Error("Unable to fetch current location.");
  }

  const rankedSamples = [...samples].sort((first, second) => first.accuracy - second.accuracy);
  const shortlistedSamples = rankedSamples.slice(
    0,
    Math.min(rankedSamples.length, Math.max(options.minimumSampleCount, 1)),
  );

  const center = {
    latitude: median(shortlistedSamples.map((sample) => sample.latitude)),
    longitude: median(shortlistedSamples.map((sample) => sample.longitude)),
  };

  const clusteredSamples = shortlistedSamples.filter(
    (sample) =>
      distanceInMeters(sample, center) <= Math.max(sample.accuracy * 1.5, 250),
  );

  const stableSamples = clusteredSamples.length > 0 ? clusteredSamples : [rankedSamples[0]];
  const bestAccuracy = Math.min(...stableSamples.map((sample) => sample.accuracy));

  if (bestAccuracy > options.maxAccuracyMeters) {
    throw new Error(
      `Location accuracy is too low on this device (best result ±${Math.round(bestAccuracy)} m). Please use a phone GPS or enter the coordinates manually.`,
    );
  }

  return {
    latitude: roundCoordinate(average(stableSamples.map((sample) => sample.latitude))),
    longitude: roundCoordinate(average(stableSamples.map((sample) => sample.longitude))),
    accuracy: Math.round(bestAccuracy),
    sampleCount: stableSamples.length,
  };
};

export const getStableGeolocation = (
  options: StableGeolocationOptions = {},
): Promise<StableGeolocationResult> => {
  if (globalThis.window === undefined || !navigator.geolocation) {
    return Promise.reject(
      new Error("Geolocation is not supported by your browser."),
    );
  }

  const config = { ...DEFAULT_OPTIONS, ...options };

  return new Promise<StableGeolocationResult>((resolve, reject) => {
    let isSettled = false;
    const samples: GeolocationSample[] = [];
    let timeoutId: NodeJS.Timeout | undefined;

    const cleanup = (watchId: number) => {
      navigator.geolocation.clearWatch(watchId);

      if (timeoutId) {
        globalThis.clearTimeout(timeoutId);
      }
    };

    const finish = (watchId: number) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      cleanup(watchId);

      try {
        resolve(finalizeSamples(samples, config));
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error("Unable to fetch current location."),
        );
      }
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const sample = toSample(position);

        if (!sample) {
          return;
        }

        samples.push(sample);

        const sufficientlyAccurateSamples = samples.filter(
          (currentSample) => currentSample.accuracy <= config.maxAccuracyMeters,
        );

        if (
          samples.length >= config.sampleCount ||
          sufficientlyAccurateSamples.length >= config.minimumSampleCount
        ) {
          finish(watchId);
        }
      },
      (error) => {
        if (samples.length > 0) {
          finish(watchId);
          return;
        }

        if (isSettled) {
          return;
        }

        isSettled = true;
        cleanup(watchId);
        reject(new Error(error.message || "Unable to fetch current location."));
      },
      {
        enableHighAccuracy: true,
        timeout: config.timeoutMs,
        maximumAge: 0,
      },
    );

    timeoutId = globalThis.setTimeout(() => finish(watchId), config.timeoutMs);
  });
};