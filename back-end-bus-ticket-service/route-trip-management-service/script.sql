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
