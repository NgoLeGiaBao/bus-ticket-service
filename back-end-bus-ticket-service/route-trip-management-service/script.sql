-- Create table routes
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin VARCHAR NOT NULL,              
    destination VARCHAR NOT NULL,         
    distance FLOAT NOT NULL,              
    duration INT NOT NULL,                
    price FLOAT NOT NULL                  
);

-- Create table trips
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_date Timestamp NOT NULL,         
    available_seats INT NOT NULL,         
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE 
);

ALTER TABLE trips
ADD COLUMN booked_seats TEXT[] DEFAULT '{}';

-- Create enum
CREATE TYPE vehicle_type_enum AS ENUM ('limousine', 'sleeper', 'standard');
-- Add column
ALTER TABLE trips
ADD COLUMN vehicle_type vehicle_type_enum NOT NULL DEFAULT 'standard';


-- Tạo ENUM cho trạng thái chuyến đi
CREATE TYPE trip_status_enums AS ENUM ('scheduled', 'ongoing', 'completed', 'cancelled');

-- Thêm cột trạng thái chuyến đi vào bảng trips
ALTER TABLE trips
ADD COLUMN status trip_status_enums NOT NULL DEFAULT 'scheduled';