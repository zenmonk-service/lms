import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { LocateFixed, Loader2Icon, MapPin } from "lucide-react";
import { useState } from "react";
import { UseFormSetValue } from "react-hook-form";

type Geolocation = {
  latitude: number;
  longitude: number;
} | null;

interface GeolocationSettingsProps {
  geolocation: Geolocation | undefined;
  setValue: UseFormSetValue<any>;
}

const GeolocationSettings = ({
  geolocation,
  setValue,
}: GeolocationSettingsProps) => {
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [geoError, setGeoError] = useState("");

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setGeoError("");
    setIsFetchingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Number(position.coords.latitude.toFixed(6));
        const longitude = Number(position.coords.longitude.toFixed(6));

        setValue(
          "geolocation",
          {
            latitude,
            longitude,
          },
          { shouldDirty: true, shouldValidate: true }
        );

        setIsFetchingLocation(false);
      },
      (error) => {
        setGeoError(error.message || "Unable to fetch your current location.");
        setIsFetchingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold">Geolocation</h1>
        <p className="text-sm text-muted-foreground">
          Capture your current organization coordinates from the browser.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div>
          <h2 className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
            Latitude
          </h2>
          <InputGroup className="rounded-none border-0 border-b border-border shadow-none">
            <InputGroupAddon align={"inline-start"} className="pl-0">
              <MapPin className="w-3 h-3 text-muted-foreground" strokeWidth={2} />
            </InputGroupAddon>
            <InputGroupInput
              value={geolocation?.latitude ?? ""}
              readOnly
              placeholder="Not set"
            />
          </InputGroup>
        </div>

        <div>
          <h2 className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
            Longitude
          </h2>
          <InputGroup className="rounded-none border-0 border-b border-border shadow-none">
            <InputGroupAddon align={"inline-start"} className="pl-0">
              <MapPin className="w-3 h-3 text-muted-foreground" strokeWidth={2} />
            </InputGroupAddon>
            <InputGroupInput
              value={geolocation?.longitude ?? ""}
              readOnly
              placeholder="Not set"
            />
          </InputGroup>
        </div>

        <Button
          type="button"
          className="sm:w-fit"
          onClick={handleGetCurrentLocation}
          disabled={isFetchingLocation}
        >
          {isFetchingLocation ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <LocateFixed />
          )}
          Get current location
        </Button>
      </div>

      {geoError && <p className="text-xs text-destructive mt-2">{geoError}</p>}
    </div>
  );
};

export default GeolocationSettings;
