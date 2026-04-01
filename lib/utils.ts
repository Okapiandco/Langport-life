export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

const facilityLabels: Record<string, string> = {
  wifi: "WiFi",
  parking: "Parking",
  accessible: "Wheelchair Accessible",
  kitchen: "Kitchen",
  stage: "Stage",
  pa: "PA System",
  outdoor: "Outdoor Space",
  toilets: "Toilets",
};

export function getFacilityLabel(value: string): string {
  return facilityLabels[value] || value;
}
