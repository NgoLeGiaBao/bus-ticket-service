export interface Vehicle {
  id: string;
  licenseplate: string;
  vehiclelabel: string;
  vehicletype: string;
  brand: string;
  status: 'Active' | 'Inactive' | 'Maintenance' | 'Broken';
  capacity: number;
  registrationdate: string;
  registrationexpirydate: string;
  yearofmanufacture: number;
  lastmaintenance: string;
  nextmaintenancedue: string;
}

export interface VehicleFormData {
  licenseplate: string;
  vehiclelabel: string;
  vehicletype: string;
  brand: string;
  status: 'Active' | 'Inactive' | 'Maintenance' | 'Broken';
  capacity: number;
  registrationdate: string;
  registrationexpirydate: string;
  yearofmanufacture: number;
  lastmaintenance: string;
  nextmaintenancedue: string;
}