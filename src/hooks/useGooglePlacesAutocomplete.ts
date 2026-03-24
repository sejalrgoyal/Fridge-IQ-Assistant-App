/// <reference types="google.maps" />
import { useState, useEffect, useCallback, useRef } from 'react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDcx9ebnX8etmKxTEIZicvsklL5boio-1E';

interface Prediction {
  description: string;
  place_id: string;
}

export interface GoogleStore {
  id: string;
  name: string;
  address: string;
  distance: string;
  lat: number;
  lng: number;
  rating?: number;
  isOpen?: boolean;
}

let scriptLoaded = false;
let scriptLoading = false;
const loadCallbacks: (() => void)[] = [];

function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve) => {
    if (scriptLoaded && (window as any).google?.maps?.places) {
      resolve();
      return;
    }
    if (scriptLoading) {
      loadCallbacks.push(resolve);
      return;
    }
    scriptLoading = true;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      scriptLoading = false;
      resolve();
      loadCallbacks.forEach(cb => cb());
      loadCallbacks.length = 0;
    };
    script.onerror = () => {
      scriptLoading = false;
      console.error('Failed to load Google Maps script');
    };
    document.head.appendChild(script);
  });
}

// Hidden map div for PlacesService
let mapDiv: HTMLDivElement | null = null;
let mapInstance: google.maps.Map | null = null;

function getMap(): google.maps.Map {
  if (mapInstance) return mapInstance;
  mapDiv = document.createElement('div');
  mapDiv.style.display = 'none';
  document.body.appendChild(mapDiv);
  mapInstance = new google.maps.Map(mapDiv, { center: { lat: 0, lng: 0 }, zoom: 1 });
  return mapInstance;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useGooglePlacesAutocomplete() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isReady, setIsReady] = useState(false);
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    loadGoogleMapsScript().then(() => {
      serviceRef.current = new google.maps.places.AutocompleteService();
      geocoderRef.current = new google.maps.Geocoder();
      setIsReady(true);
    });
  }, []);

  const getPlacePredictions = useCallback((input: string) => {
    if (!input.trim() || !serviceRef.current) {
      setPredictions([]);
      return;
    }
    serviceRef.current.getPlacePredictions(
      { input, componentRestrictions: { country: 'us' }, types: ['address'] },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results.slice(0, 5).map(r => ({ description: r.description, place_id: r.place_id })));
        } else {
          setPredictions([]);
        }
      }
    );
  }, []);

  const clearPredictions = useCallback(() => setPredictions([]), []);

  const searchNearbyStores = useCallback((address: string): Promise<GoogleStore[]> => {
    return new Promise((resolve) => {
      if (!geocoderRef.current) { resolve([]); return; }

      geocoderRef.current.geocode({ address }, (results, status) => {
        if (status !== google.maps.GeocoderStatus.OK || !results?.[0]) {
          console.error('Geocoding failed:', status);
          resolve([]);
          return;
        }

        const location = results[0].geometry.location;
        const userLat = location.lat();
        const userLng = location.lng();
        const map = getMap();
        const placesService = new google.maps.places.PlacesService(map);

        placesService.nearbySearch(
          {
            location: { lat: userLat, lng: userLng },
            radius: 8000, // ~5 miles
            type: 'grocery_or_supermarket',
          },
          (places, searchStatus) => {
            if (searchStatus !== google.maps.places.PlacesServiceStatus.OK || !places) {
              console.error('Nearby search failed:', searchStatus);
              resolve([]);
              return;
            }

            const stores: GoogleStore[] = places
              .filter(p => p.name && p.vicinity && p.geometry?.location)
              .map(p => {
                const storeLat = p.geometry!.location!.lat();
                const storeLng = p.geometry!.location!.lng();
                const dist = haversineDistance(userLat, userLng, storeLat, storeLng);
                return {
                  id: p.place_id || `store-${Math.random()}`,
                  name: p.name!,
                  address: p.vicinity!,
                  distance: `${dist.toFixed(1)} mi`,
                  lat: storeLat,
                  lng: storeLng,
                  rating: p.rating,
                  isOpen: p.opening_hours?.isOpen?.(),
                };
              })
              .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
              .slice(0, 8);

            resolve(stores);
          }
        );
      });
    });
  }, []);

  const searchByCurrentLocation = useCallback((): Promise<{ address: string; stores: GoogleStore[] }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('Geolocation not supported')); return; }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const map = getMap();
          const placesService = new google.maps.places.PlacesService(map);

          // Reverse geocode
          geocoderRef.current?.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results, status) => {
              const addr = (status === google.maps.GeocoderStatus.OK && results?.[0])
                ? results[0].formatted_address
                : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

              placesService.nearbySearch(
                { location: { lat: latitude, lng: longitude }, radius: 8000, type: 'grocery_or_supermarket' },
                (places, searchStatus) => {
                  if (searchStatus !== google.maps.places.PlacesServiceStatus.OK || !places) {
                    resolve({ address: addr, stores: [] });
                    return;
                  }
                  const stores: GoogleStore[] = places
                    .filter(p => p.name && p.vicinity && p.geometry?.location)
                    .map(p => {
                      const storeLat = p.geometry!.location!.lat();
                      const storeLng = p.geometry!.location!.lng();
                      const dist = haversineDistance(latitude, longitude, storeLat, storeLng);
                      return {
                        id: p.place_id || `store-${Math.random()}`,
                        name: p.name!,
                        address: p.vicinity!,
                        distance: `${dist.toFixed(1)} mi`,
                        lat: storeLat,
                        lng: storeLng,
                        rating: p.rating,
                        isOpen: p.opening_hours?.isOpen?.(),
                      };
                    })
                    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
                    .slice(0, 8);
                  resolve({ address: addr, stores });
                }
              );
            }
          );
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  const searchStoreByName = useCallback((storeName: string, nearAddress: string): Promise<GoogleStore[]> => {
    return new Promise((resolve) => {
      if (!geocoderRef.current) { resolve([]); return; }

      geocoderRef.current.geocode({ address: nearAddress }, (results, status) => {
        if (status !== google.maps.GeocoderStatus.OK || !results?.[0]) {
          resolve([]);
          return;
        }

        const location = results[0].geometry.location;
        const userLat = location.lat();
        const userLng = location.lng();
        const map = getMap();
        const placesService = new google.maps.places.PlacesService(map);

        placesService.textSearch(
          {
            query: storeName + ' grocery store',
            location: { lat: userLat, lng: userLng },
            radius: 16000,
          },
          (places, searchStatus) => {
            if (searchStatus !== google.maps.places.PlacesServiceStatus.OK || !places) {
              resolve([]);
              return;
            }

            const stores: GoogleStore[] = places
              .filter(p => p.name && p.formatted_address && p.geometry?.location)
              .map(p => {
                const storeLat = p.geometry!.location!.lat();
                const storeLng = p.geometry!.location!.lng();
                const dist = haversineDistance(userLat, userLng, storeLat, storeLng);
                return {
                  id: p.place_id || `store-${Math.random()}`,
                  name: p.name!,
                  address: p.formatted_address!,
                  distance: `${dist.toFixed(1)} mi`,
                  lat: storeLat,
                  lng: storeLng,
                  rating: p.rating,
                  isOpen: p.opening_hours?.isOpen?.(),
                };
              })
              .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
              .slice(0, 6);

            resolve(stores);
          }
        );
      });
    });
  }, []);

  return { predictions, getPlacePredictions, clearPredictions, isReady, searchNearbyStores, searchByCurrentLocation, searchStoreByName };
}
