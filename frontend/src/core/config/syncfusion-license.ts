'use client';
import { registerLicense } from '@syncfusion/ej2-base';

// This file should be imported at the earliest point in your application
// to ensure the license is registered before any Syncfusion components are used

export function initializeSyncfusionLicense() {
  try {
    const licenseKey = process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY || '';
    if (licenseKey) {
      registerLicense(licenseKey);
      return true;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

// Register license immediately when this module is imported
initializeSyncfusionLicense();
