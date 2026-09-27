# OFFBEAT — India Geographic Data & Projection Documentation

## 1. Geographic Data Source

- **Primary Source**: Administrative Boundaries of India (28 States and 8 Union Territories), reflecting current post-2020 administrative status (including Ladakh UT and merged Dadra and Nagar Haveli and Daman and Diu UT).
- **Authoritative Reference**: Survey of India Political Map of India (13th Edition / Administrative Series) and Census of India administrative boundaries.
- **Dataset Package**: Curated and topologically verified from `udit-001/india-maps-data` (`topojson/india.json`).
- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0) / Open Data Commons Open Database License (ODbL).

---

## 2. Cartographic Projection

- **Projection Type**: Lambert Conformal Conic (LCC), the official cartographic standard of the Survey of India for subcontinental mapping.
- **D3 Projection**:
  - `d3.geoConicConformal()`
  - **Standard Parallels**: `[12.0°N, 32.0°N]`
  - **Central Meridian (Rotation)**: `[-78.9629°, 0°]`
  - **Target Viewport**: `800 × 920` SVG canvas
- **Properties Preserved**:
  - Conformal (preserves true local angles and state shapes)
  - True geographic scale across northern and southern India without the extreme equatorial/polar distortions of standard Web Mercator.

---

## 3. Data Pipeline

```text
Survey of India / Census Vector TopoJSON
               ↓
    topojson-client (feature conversion)
               ↓
       Validate 28 States + 8 UTs
               ↓
   D3 Lambert Conformal Conic Projection
               ↓
  india-administrative.json (single source of truth)
               ↓
     Composed with regionMetadata.ts
               ↓
      INDIA_REGIONS application model
```

---

## 4. Administrative Entities (36 Total)

### 28 States

1. Andhra Pradesh (`IN-AP`)
2. Arunachal Pradesh (`IN-AR`)
3. Assam (`IN-AS`)
4. Bihar (`IN-BR`)
5. Chhattisgarh (`IN-CT`)
6. Goa (`IN-GA`)
7. Gujarat (`IN-GJ`)
8. Haryana (`IN-HR`)
9. Himachal Pradesh (`IN-HP`)
10. Jharkhand (`IN-JH`)
11. Karnataka (`IN-KA`)
12. Kerala (`IN-KL`)
13. Madhya Pradesh (`IN-MP`)
14. Maharashtra (`IN-MH`)
15. Manipur (`IN-MN`)
16. Meghalaya (`IN-ML`)
17. Mizoram (`IN-MZ`)
18. Nagaland (`IN-NL`)
19. Odisha (`IN-OD`)
20. Punjab (`IN-PB`)
21. Rajasthan (`IN-RJ`)
22. Sikkim (`IN-SK`)
23. Tamil Nadu (`IN-TN`)
24. Telangana (`IN-TG`)
25. Tripura (`IN-TR`)
26. Uttar Pradesh (`IN-UP`)
27. Uttarakhand (`IN-UT`)
28. West Bengal (`IN-WB`)

### 8 Union Territories

1. Andaman and Nicobar Islands (`IN-AN`)
2. Chandigarh (`IN-CH`)
3. Dadra and Nagar Haveli and Daman and Diu (`IN-DH`)
4. Delhi (`IN-DL`)
5. Jammu and Kashmir (`IN-JK`)
6. Ladakh (`IN-LA`)
7. Lakshadweep (`IN-LD`)
8. Puducherry (`IN-PY`)

---

## 5. Small Territory Handling

Extremely small territories (`Chandigarh`, `Delhi`, `Puducherry`, `Lakshadweep`, `Dadra and Nagar Haveli and Daman and Diu`) are highlighted using cartographic pinpoints and interactive locator rings without distorting mainland geographic proportions.
