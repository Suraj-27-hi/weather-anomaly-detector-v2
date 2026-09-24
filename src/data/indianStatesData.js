export const INDIAN_STATES = [
  { name: 'Karnataka', capital: 'Bengaluru', lat: 12.9716, lon: 77.5946, region: 'South' },
  { name: 'Maharashtra', capital: 'Mumbai', lat: 19.0760, lon: 72.8777, region: 'West' },
  { name: 'Delhi', capital: 'New Delhi', lat: 28.6139, lon: 77.2090, region: 'North' },
  { name: 'Tamil Nadu', capital: 'Chennai', lat: 13.0827, lon: 80.2707, region: 'South' },
  { name: 'West Bengal', capital: 'Kolkata', lat: 22.5726, lon: 88.3639, region: 'East' },
  { name: 'Gujarat', capital: 'Gandhinagar', lat: 23.2156, lon: 72.6369, region: 'West' },
  { name: 'Rajasthan', capital: 'Jaipur', lat: 26.9124, lon: 75.7873, region: 'North' },
  { name: 'Uttar Pradesh', capital: 'Lucknow', lat: 26.8467, lon: 80.9462, region: 'North' },
  { name: 'Kerala', capital: 'Thiruvananthapuram', lat: 8.5241, lon: 76.9366, region: 'South' },
  { name: 'Telangana', capital: 'Hyderabad', lat: 17.3850, lon: 78.4867, region: 'South' },
  { name: 'Andhra Pradesh', capital: 'Amaravati', lat: 16.5417, lon: 80.5158, region: 'South' },
  { name: 'Madhya Pradesh', capital: 'Bhopal', lat: 23.2599, lon: 77.4126, region: 'Central' },
  { name: 'Punjab', capital: 'Chandigarh', lat: 30.7333, lon: 76.7794, region: 'North' },
  { name: 'Haryana', capital: 'Chandigarh', lat: 30.7333, lon: 76.7794, region: 'North' },
  { name: 'Bihar', capital: 'Patna', lat: 25.5941, lon: 85.1376, region: 'East' },
  { name: 'Odisha', capital: 'Bhubaneswar', lat: 20.2961, lon: 85.8245, region: 'East', altNames: ['Orissa'] },
  { name: 'Assam', capital: 'Dispur', lat: 26.1445, lon: 91.7362, region: 'Northeast' },
  { name: 'Jharkhand', capital: 'Ranchi', lat: 23.3441, lon: 85.3096, region: 'East' },
  { name: 'Chhattisgarh', capital: 'Raipur', lat: 21.2514, lon: 81.6296, region: 'Central' },
  { name: 'Uttarakhand', capital: 'Dehradun', lat: 30.3165, lon: 78.0322, region: 'North', altNames: ['Uttaranchal'] },
  { name: 'Himachal Pradesh', capital: 'Shimla', lat: 31.1048, lon: 77.1734, region: 'North' },
  { name: 'Jammu and Kashmir', capital: 'Srinagar', lat: 34.0837, lon: 74.7973, region: 'North' },
  { name: 'Goa', capital: 'Panaji', lat: 15.4909, lon: 73.8278, region: 'West' },
  { name: 'Tripura', capital: 'Agartala', lat: 23.8315, lon: 91.2868, region: 'Northeast' },
  { name: 'Manipur', capital: 'Imphal', lat: 24.8170, lon: 93.9368, region: 'Northeast' },
  { name: 'Meghalaya', capital: 'Shillong', lat: 25.5788, lon: 91.8933, region: 'Northeast' },
  { name: 'Nagaland', capital: 'Kohima', lat: 25.6751, lon: 94.1086, region: 'Northeast' },
  { name: 'Mizoram', capital: 'Aizawl', lat: 23.7271, lon: 92.7176, region: 'Northeast' },
  { name: 'Sikkim', capital: 'Gangtok', lat: 27.3389, lon: 88.6065, region: 'Northeast' },
  { name: 'Arunachal Pradesh', capital: 'Itanagar', lat: 27.0844, lon: 93.6053, region: 'Northeast' },
  { name: 'Ladakh', capital: 'Leh', lat: 34.1526, lon: 77.5771, region: 'North' },
  { name: 'Puducherry', capital: 'Puducherry', lat: 11.9416, lon: 79.8083, region: 'South' },
  { name: 'Chandigarh', capital: 'Chandigarh', lat: 30.7333, lon: 76.7794, region: 'North' },
  { name: 'Andaman and Nicobar', capital: 'Port Blair', lat: 11.6234, lon: 92.7265, region: 'Islands' }
];

export const POPULAR_WORLD_CITIES = [
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
  { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060 },
  { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  { name: 'Reykjavik', country: 'Iceland', lat: 64.1466, lon: -21.9426 }
];

export function findMatchingState(stateName) {
  if (!stateName) return null;
  const normalized = stateName.toLowerCase().trim();
  return INDIAN_STATES.find(s => {
    if (s.name.toLowerCase() === normalized) return true;
    if (s.capital.toLowerCase() === normalized) return true;
    if (s.altNames && s.altNames.some(alt => alt.toLowerCase() === normalized)) return true;
    return false;
  }) || null;
}
