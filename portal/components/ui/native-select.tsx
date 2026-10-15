'use client';

import ThemedSelect from '../../app/themed-select';
// Compatibility entry point: native-looking menus are no longer exposed.
export const NativeSelect=ThemedSelect;
export const NativeSelectOption='option' as const;
export const NativeSelectOptGroup='optgroup' as const;
