import { Timestamp } from "firebase/firestore";

export interface OperatingHours {
  [day: string]: {
    open: string; // '09:00' (24hr format)
    close: string; // '22:00'
    isClosed: boolean;
  };
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  ownerUid: string | null;
  ownershipStatus: "seeded" | "claimed" | "verified";
  claimedBy: string | null;
  claimDate: Timestamp | null;
  verifiedDate: Timestamp | null;
  isPublished: boolean;

  // Contact & Location
  phone: string;
  address: string;
  geoHash: string;
  latitude: number;
  longitude: number;

  // Hours
  hours: OperatingHours;

  // Metadata
  tags: string[];
  bannerImageUrl: string | null;
  logoImageUrl: string | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
