# Container Configuration Updates

This plan outlines the changes needed to update the available container sizes to **40HC (High cube)** and **40 standard**, both with standard dimensions (12.01m x 2.33m x 2.69m), and to introduce a configurable weight capacity per container ranging from 10TN to 24TN in steps of 2.

> [!WARNING]
> **Data Migration Alert**: The database currently has a `CHECK` constraint for `container_type IN ('20', '40', '40HC')`. Changing this to `('40HC', '40ST')` will require migrating existing rows. The proposed migration will map '20' and '40' -> '40ST'. '40HC' remains as is. Default weight will be 24TN for existing records.

---

## Proposed Changes

### Database
Update the database schema to handle the new fields and constraints.

#### [NEW] `supabase/migrations/009_update_container_types_weight.sql`(file:///c:/Users/rodri/web/logistica/supabase/migrations/009_update_container_types_weight.sql)
- Add column `weight_capacity_tons` (INTEGER) to the `containers` table with a default of 24.
- Update existing container types: `UPDATE containers SET container_type = '40ST' WHERE container_type IN ('20', '40');`
- Drop the existing `containers_container_type_check`.
- Add a new `CHECK` constraint: `container_type IN ('40HC', '40ST')`.
- Add a `CHECK` constraint for `weight_capacity_tons IN (10, 12, 14, 16, 18, 20, 22, 24)`.

---

### Shared Definitions
Update the shared constants to reflect the new dimensions, types, and weights.

#### [MODIFY] `src/lib/constants.js`(file:///c:/Users/rodri/web/logistica/src/lib/constants.js)
- Update `CONTAINER_TYPES` to only include `40HC` and `40ST`.
- Set their properties matching the requested dimensions in cm: `lengthCm: 1201, widthCm: 233, heightCm: 269`. Remove the static `maxWeightKg`.
- Add a new exported array `WEIGHT_CAPACITIES_TN = [10, 12, 14, 16, 18, 20, 22, 24]`.

---

### Backend Logic
Update the server actions and validation schemas.

#### [MODIFY] `src/app/contenedores/actions.js`(file:///c:/Users/rodri/web/logistica/src/app/contenedores/actions.js)
- Update the `zod` schema `container_type` enum to `['40HC', '40ST']`.
- Add `weight_capacity_tons` mapped to `z.coerce.number()` checking against the allowed steps (10 to 24).
- Ensure `weight_capacity_tons` is passed to the Supabase `insert` and `update` queries.

---

### Frontend Components & Views
Update the forms to capture the new weight capacity and fix the volume calculator limit.

#### [MODIFY] `src/app/contenedores/nuevo/page.js`(file:///c:/Users/rodri/web/logistica/src/app/contenedores/nuevo/page.js)
- Add a new `<select>` field for "Capacidad de Peso (Toneladas)" looping over `WEIGHT_CAPACITIES_TN`. Default to 24.

#### [MODIFY] `src/components/contenedores/ContainerEditForm.js`(file:///c:/Users/rodri/web/logistica/src/components/contenedores/ContainerEditForm.js)
- Add the same `<select>` field for "Capacidad de Peso" initializing with `container.weight_capacity_tons`.

#### [MODIFY] `src/components/calculadora/VolumetricCalc.js`(file:///c:/Users/rodri/web/logistica/src/components/calculadora/VolumetricCalc.js)
- Add a React state `[weightCapacityTn, setWeightCapacityTn]` initialized to 24.
- Add toggle buttons for the user to choose the weight capacity in Tons (same style as the container type selector).
- Change the `calculateVolumetric` call to inject `maxWeightKg` dynamically:
  ```js
  const result = calculateVolumetric({ ...container, maxWeightKg: weightCapacityTn * 1000 }, box)
  ```
  `volumetric.js` itself does **not** need to change — the spread override is sufficient.
- Replace the 3 JSX sites that read `container.maxWeightKg` directly with `(weightCapacityTn * 1000)`:
  - Info line below container selector (currently: `Peso máx: {container.maxWeightKg.toLocaleString(...)} kg`)
  - Weight bar sub-label in results (currently: `kg de {container.maxWeightKg.toLocaleString(...)} kg`)
  - Error message text (currently: `excede el máximo permitido ({container.maxWeightKg.toLocaleString(...)} kg)`)

#### [MODIFY] `src/components/contenedores/ContainerCard.js`(file:///c:/Users/rodri/web/logistica/src/components/contenedores/ContainerCard.js)
- Replace the hardcoded `` container.container_type + "'" `` interpolation with `CONTAINER_TYPES[container.container_type]?.label` to display the proper label (e.g. "40' HC") instead of the raw key with a trailing apostrophe (e.g. `40ST'`).
- Import `CONTAINER_TYPES` from `@/lib/constants` if not already imported.

#### [MODIFY] `src/lib/utils/excelExport.js`(file:///c:/Users/rodri/web/logistica/src/lib/utils/excelExport.js)
- Replace both occurrences of `` `${c.container_type}'` `` / `` `${container.container_type}'` `` with `CONTAINER_TYPES[c.container_type]?.label ?? c.container_type` to avoid the trailing apostrophe on exported reports.
- Import `CONTAINER_TYPES` from `@/lib/constants` if not already imported.

---

## Verification Plan

### Automated Verification
- Apply the SQL migration using the Supabase MCP extension `apply_migration`.
- Ensure the Next.js build passes without type or lint errors after the changes via `npm run build`.

### Manual / Browser Verification
1. **Container Management**: Visit `/contenedores/nuevo`, create a new container selecting "40HC" and a weight of "16TN". Verify it saves correctly.
2. **Detail Page & Edit**: Go to the detail page of the created container, open the edit form, and change its capacity to "20TN". Verify the update saves correctly.
3. **Volumetric Calculator**: Visit `/calculadora-volumetrica`, select "40 standard" and "12TN", and input a box. Verify that the max allowable weight correctly reflects 12,000 kg and the limit is properly enforced in the UI result boxes.
