-- Tạo ENUM
DO $$ BEGIN
    CREATE TYPE staff_role_enum AS ENUM ('driver', 'attendant');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- staff_routes
DROP TABLE IF EXISTS staff_routes;

CREATE TABLE staff_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL,
    route_id UUID NOT NULL,
    full_name VARCHAR NOT NULL,
    role staff_role_enum NOT NULL,
    UNIQUE (staff_id, route_id, role)
);

-- dispatch_assignments
DROP TABLE IF EXISTS dispatch_assignments;

CREATE TABLE dispatch_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    staff_id UUID NOT NULL,
    trip_id UUID NOT NULL,
    route_id UUID NOT NULL,

    assigned_at TIMESTAMP NOT NULL,
    expected_end_time TIMESTAMP NOT NULL,

    from_location VARCHAR NOT NULL,
    to_location VARCHAR NOT NULL,

    role staff_role_enum NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (trip_id, staff_id, role)
);

-- staff_unavailability
DROP TABLE IF EXISTS staff_unavailability;

CREATE TABLE staff_unavailability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    staff_id UUID NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,

    reason TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);
