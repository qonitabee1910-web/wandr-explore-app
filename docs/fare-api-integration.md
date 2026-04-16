# Fare Calculation API Integration Guide

This document outlines the API endpoints and data structures for the Shuttle Fare Calculation Module.

## 1. Fare Estimation API

Estimate the total fare for a shuttle journey based on various parameters.

- **Endpoint**: `GET /api/fares/estimate`
- **Access**: Public / Authenticated

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `rayonId` | `string` | ID of the target destination/rayon |
| `distance` | `number` | Total distance in kilometers |
| `serviceTier` | `string` | `Regular`, `Semi Executive`, or `Executive` |
| `vehicleType` | `string` | `Mini Car`, `SUV`, or `Hiace` |
| `passengers` | `Array<PassengerCount>` | List of passenger counts by category |
| `promoCode` | `string` | (Optional) Promo code to apply |
| `isRoundTrip` | `boolean` | (Optional) Whether it's a return journey |

### Example Request

```json
{
  "rayonId": "rayon-1",
  "distance": 125.5,
  "serviceTier": "Executive",
  "vehicleType": "Hiace",
  "passengers": [
    {"category": "adult", "count": 2},
    {"category": "child", "count": 1}
  ],
  "promoCode": "WELCOMEWANDR",
  "isRoundTrip": false
}
```

### Response Format

```json
{
  "baseFare": 50000,
  "distanceFare": 313750,
  "serviceSurcharge": 363750,
  "vehicleSurcharge": 181875,
  "surgeSurcharge": 0,
  "passengerBreakdown": [
    {
      "category": "adult",
      "count": 2,
      "subtotal": 1818750
    },
    {
      "category": "child",
      "count": 1,
      "subtotal": 682031.25
    }
  ],
  "subtotal": 2500781.25,
  "promoDiscount": 50000,
  "totalFare": 2450781.25,
  "surgeApplied": "Weekend Demand",
  "promoApplied": "WELCOMEWANDR",
  "isRoundTrip": false
}
```

## 2. Admin Fare Rules API

Manage pricing rules for different rayong and tiers.

- **Endpoint**: `GET /api/admin/fare-rules`
- **Access**: Admin Only

### Response

Returns an array of `FareRule` objects.

## 3. Audit Logs API

Retrieve calculation history for debugging and auditing.

- **Endpoint**: `GET /api/admin/transaction-logs`
- **Access**: Admin Only

---

## Integration Guidelines (Frontend)

1. **Real-time Updates**: The `ShuttleProvider` context automatically recalculates fares whenever the user changes selections (Rayon, Service, Vehicle, Passengers).
2. **Debouncing**: Ensure that manual input (like distance or promo code) is debounced before calling the estimate API to reduce server load.
3. **Error Handling**: If the API returns a 400 (Invalid Promo) or 500 (Calculation Error), display a user-friendly message but keep the last valid total if possible.
4. **Local State**: Use the `fareBreakdown` object from the context to display a detailed price summary in the checkout UI.
