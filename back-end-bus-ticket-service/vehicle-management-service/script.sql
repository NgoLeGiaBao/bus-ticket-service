-- 1. Tạo Enum cho trạng thái xe
CREATE TYPE VehicleStatus AS ENUM ('Active', 'Inactive', 'Maintenance', 'Broken');

-- 2. Tạo bảng Vehicle
CREATE TABLE Vehicle (
    Id UUID PRIMARY KEY,
    LicensePlate VARCHAR(20) UNIQUE NOT NULL,
    VehicleLabel VARCHAR(100),
    VehicleType VARCHAR(50),
    Brand VARCHAR(50),
    Status VehicleStatus,
    Capacity INT,
    RegistrationDate DATE,
    RegistrationExpiryDate DATE,
    YearOfManufacture INT,
    LastMaintenance DATE,
    NextMaintenanceDue DATE
);