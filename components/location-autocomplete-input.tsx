"use client";

import { useId, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LocateFixed, MapPin, Loader2 } from "lucide-react";

const DEFAULT_LOCATION_SUGGESTIONS = [
  "Jakarta, Indonesia",
  "Bandung, Indonesia",
  "Surabaya, Indonesia",
  "Yogyakarta, Indonesia",
  "Semarang, Indonesia",
  "Malang, Indonesia",
  "Denpasar, Indonesia",
  "Bekasi, Indonesia",
  "Depok, Indonesia",
  "Bogor, Indonesia",
  "Tangerang, Indonesia",
  "Karawang, Indonesia",
  "Cikarang, Indonesia",
  "Sidoarjo, Indonesia",
  "Gresik, Indonesia",
  "Bali, Indonesia",
  "Medan, Indonesia",
  "Makassar, Indonesia",
  "Palembang, Indonesia",
  "Pekanbaru, Indonesia",
  "Balikpapan, Indonesia",
  "Samarinda, Indonesia",
  "Banjarmasin, Indonesia",
  "Pontianak, Indonesia",
  "Batam, Indonesia",
  "Manado, Indonesia",
  "Padang, Indonesia",
  "Lampung, Indonesia",
  "Aceh, Indonesia",
  "Mataram, Indonesia",
  "Lombok, Indonesia",
  "Cirebon, Indonesia",
  "Tasikmalaya, Indonesia",
  "Purwokerto, Indonesia",
  "Remote",
  "Work from Home",
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

async function reverseGeocode(latitude: number, longitude: number) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
    {
      headers: {
        "Accept-Language": "id",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Gagal mengambil nama lokasi");
  }

  const data = (await response.json()) as {
    address?: {
      city?: string;
      town?: string;
      village?: string;
      municipality?: string;
      state?: string;
      country?: string;
    };
    display_name?: string;
  };

  const cityOrTown =
    data.address?.city ??
    data.address?.town ??
    data.address?.village ??
    data.address?.municipality ??
    data.address?.state;

  if (cityOrTown && data.address?.country) {
    return `${cityOrTown}, ${data.address.country}`;
  }

  return data.display_name || null;
}

interface LocationAutocompleteInputProps
  extends Omit<React.ComponentProps<typeof Input>, "value" | "defaultValue" | "onChange"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  wrapperClassName?: string;
  suggestions?: string[];
  minimumQueryLength?: number;
  showCurrentLocationButton?: boolean;
}

export default function LocationAutocompleteInput({
  value,
  defaultValue = "",
  onValueChange,
  wrapperClassName,
  suggestions = DEFAULT_LOCATION_SUGGESTIONS,
  minimumQueryLength = 3,
  showCurrentLocationButton = true,
  className,
  id,
  name,
  placeholder = "Lokasi",
  disabled,
  ...props
}: LocationAutocompleteInputProps) {
  const generatedId = useId();
  const inputId = id || `location-${generatedId}`;
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const currentValue = isControlled ? value ?? "" : internalValue;
  const trimmedValue = currentValue.trim();
  const shouldSuggest = trimmedValue.length >= minimumQueryLength && isFocused;

  const filteredSuggestions = useMemo(() => {
    if (!shouldSuggest) return [];

    const query = normalizeText(trimmedValue);
    return suggestions
      .filter((suggestion) => normalizeText(suggestion).includes(query))
      .slice(0, 6);
  }, [shouldSuggest, suggestions, trimmedValue]);


  function updateValue(nextValue: string) {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  }

  function applySuggestion(nextValue: string) {
    updateValue(nextValue);
    setStatusMessage(`Lokasi dipilih: ${nextValue}`);
    setIsFocused(false);
  }

  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      setStatusMessage("Browser tidak mendukung pelacakan lokasi.");
      return;
    }

    setIsLocating(true);
    setStatusMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const resolvedLocation = await reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          );

          const fallbackLocation = `Lokasi saya (${position.coords.latitude.toFixed(
            4
          )}, ${position.coords.longitude.toFixed(4)})`;
          const nextValue = resolvedLocation || fallbackLocation;

          updateValue(nextValue);
          setStatusMessage("Lokasi saat ini berhasil diambil.");
        } catch {
          const fallbackLocation = `Lokasi saya (${position.coords.latitude.toFixed(
            4
          )}, ${position.coords.longitude.toFixed(4)})`;
          updateValue(fallbackLocation);
          setStatusMessage(
            "Izin lokasi diterima, tapi nama lokasi tidak bisa diambil."
          );
        } finally {
          setIsLocating(false);
          setIsFocused(false);
        }
      },
      () => {
        setIsLocating(false);
        setStatusMessage(
          "Izin lokasi ditolak. Aktifkan akses lokasi di browser jika ingin memakai lokasi saat ini."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }

  return (
    <div className={cn("relative", wrapperClassName)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id={inputId}
          name={name}
          value={currentValue}
          onChange={(event) => updateValue(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            window.setTimeout(() => setIsFocused(false), 120);
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={cn("pl-10 h-12", className)}
          {...props}
        />

        {shouldSuggest && filteredSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-brand-border bg-white shadow-lg">
            <div className="px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Rekomendasi lokasi
            </div>
            <div className="max-h-56 overflow-auto pb-1">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    applySuggestion(suggestion);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-navy transition-colors hover:bg-light-bg"
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-navy/50" />
                  <span className="truncate">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showCurrentLocationButton && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={useCurrentLocation}
          disabled={disabled || isLocating}
          className="mt-2 border-brand-border text-navy hover:bg-navy hover:text-white cursor-pointer"
        >
          {isLocating ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : (
            <LocateFixed className="mr-2 h-3.5 w-3.5" />
          )}
          {isLocating ? "Mendeteksi lokasi..." : "Pakai lokasi saya"}
        </Button>
      )}

      {statusMessage && (
        <p className="mt-2 text-xs text-muted-foreground">{statusMessage}</p>
      )}
    </div>
  );
}