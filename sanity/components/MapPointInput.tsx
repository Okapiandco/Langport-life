import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Box, Button, Card, Flex, Spinner, Stack, Text, useToast } from "@sanity/ui";
import { PinIcon, SearchIcon, TrashIcon } from "@sanity/icons";
import { set, unset, useFormValue, type ObjectInputProps } from "sanity";

// Leaflet only runs in the browser, so it is pulled in after mount
const LocationPickerMap = lazy(() => import("@/components/LocationPickerMap"));

/** Langport town centre — where a new pin starts */
const DEFAULT_CENTRE = { lat: 51.0374, lng: -2.8287 };

type GeoPoint = { _type: "geopoint"; lat: number; lng: number; alt?: number };

/**
 * Map for a `geopoint` field.
 *
 * The plain geopoint input is two number boxes, which left editors ticking
 * "coordinates verified" for a pin they could not see. This shows the pin on
 * the same OpenStreetMap tiles the public site uses, lets them drag it, and
 * can place it from the address fields on the same document.
 */
export function MapPointInput(props: ObjectInputProps) {
  const { value, onChange, readOnly } = props;
  const point = value as GeoPoint | undefined;
  const toast = useToast();

  const [mounted, setMounted] = useState(false);
  const [locating, setLocating] = useState(false);
  useEffect(() => setMounted(true), []);

  // Address fields live alongside this one on venues and business listings
  const street = useFormValue(["street"]) as string | undefined;
  const town = useFormValue(["town"]) as string | undefined;
  const postcode = useFormValue(["postcode"]) as string | undefined;
  const address = [street, town, postcode].filter(Boolean).join(", ");

  const move = useCallback(
    (lat: number, lng: number) => {
      onChange(set({ _type: "geopoint", lat, lng }));
    },
    [onChange]
  );

  const findFromAddress = useCallback(async () => {
    if (!address) {
      toast.push({ status: "warning", title: "Fill in the address first" });
      return;
    }
    setLocating(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          `${address}, UK`
        )}&format=json&limit=1&countrycodes=gb`
      );
      const results = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (results.length) {
        move(parseFloat(results[0].lat), parseFloat(results[0].lon));
        toast.push({
          status: "success",
          title: "Pin placed from the address",
          description: "Check it looks right, then drag it if it needs nudging.",
        });
      } else {
        toast.push({
          status: "warning",
          title: "Could not find that address",
          description: "Place the pin by hand instead.",
        });
        if (!point) move(DEFAULT_CENTRE.lat, DEFAULT_CENTRE.lng);
      }
    } catch {
      toast.push({ status: "error", title: "Address lookup failed" });
    } finally {
      setLocating(false);
    }
  }, [address, move, point, toast]);

  const hasPoint = typeof point?.lat === "number" && typeof point?.lng === "number";

  return (
    <Stack space={3}>
      {hasPoint && mounted ? (
        <Card radius={2} overflow="hidden" border>
          <Suspense
            fallback={
              <Flex align="center" justify="center" padding={5}>
                <Spinner muted />
              </Flex>
            }
          >
            <LocationPickerMap lat={point!.lat} lng={point!.lng} onMove={move} />
          </Suspense>
        </Card>
      ) : (
        <Card padding={4} radius={2} tone="transparent" border>
          <Text size={1} muted align="center">
            No pin yet. Use the address, or drop one in the middle of Langport and drag it.
          </Text>
        </Card>
      )}

      <Flex gap={2} wrap="wrap">
        <Button
          icon={SearchIcon}
          mode="ghost"
          text={locating ? "Looking…" : "Place pin from address"}
          disabled={readOnly || locating}
          onClick={findFromAddress}
        />
        {!hasPoint && (
          <Button
            icon={PinIcon}
            mode="ghost"
            text="Drop a pin in Langport"
            disabled={readOnly}
            onClick={() => move(DEFAULT_CENTRE.lat, DEFAULT_CENTRE.lng)}
          />
        )}
        {hasPoint && (
          <Button
            icon={TrashIcon}
            mode="ghost"
            tone="critical"
            text="Remove pin"
            disabled={readOnly}
            onClick={() => onChange(unset())}
          />
        )}
      </Flex>

      {hasPoint && (
        <Text size={1} muted>
          Drag the marker, or click the map, to move the pin. {address ? `Address on file: ${address}. ` : ""}
          Once it sits in the right place, tick &ldquo;Coordinates Verified&rdquo; below.
        </Text>
      )}

      {/* Keep the plain latitude/longitude boxes available underneath */}
      <Box>{props.renderDefault(props)}</Box>
    </Stack>
  );
}
