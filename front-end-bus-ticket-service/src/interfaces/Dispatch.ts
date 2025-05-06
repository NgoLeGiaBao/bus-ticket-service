// export type StaffRoute = {
//     id: string;
//     staffId: string;
//     routeId: string;
//     fullName: string;
//     role: string;
//     routeName: string;
//     vehicle: string;
//   };
  
//   export type DispatchAssignment = {
//     id: string;
//     staffId: string;
//     tripId: string;
//     routeId: string;
//     assignedAt: string;
//     expectedEndTime: string;
//     fromLocation: string;
//     toLocation: string;
//     role: string;
//     status: 'pending' | 'in-progress' | 'completed';
//   };
  
//   export type StaffUnavailability = {
//     id: string;
//     staffId: string;
//     startTime: string;
//     endTime: string;
//     reason?: string;
//   };

export interface RouteAssignmentPayload {
  userid: string;
  routeid: string;
  assigndate: string;
  isactive: boolean;
  roleassignments: string[];
}