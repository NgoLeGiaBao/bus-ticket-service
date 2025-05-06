-- Table: DispatchAssignments
CREATE TABLE DispatchAssignments (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    UserId UUID,
    TripId UUID,
    AssignedAt TIMESTAMP,
    ExpectedEndTime TIMESTAMP,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Role TEXT,
    Status TEXT
);

-- Table: StaffRoutes
CREATE TABLE StaffRoutes (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    UserId UUID,
    RouteId UUID,
    AssignDate TIMESTAMP,
    IsActive BOOLEAN,
    RoleAssignments TEXT[]
);