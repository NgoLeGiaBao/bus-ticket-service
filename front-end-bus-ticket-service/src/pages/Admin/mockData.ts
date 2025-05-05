// import { DispatchAssignment, StaffRoute, StaffUnavailability } from "../../interfaces/Dispatch";

// export const staffRoutes: StaffRoute[] = [
//     {
//       id: "1",
//       staffId: "123e4567-e89b-12d3-a456-426614174000",
//       routeId: "223e4567-e89b-12d3-a456-426614174000",
//       fullName: "Nguyễn Văn A",
//       role: "Tài xế",
//       routeName: "Tuyến 1 - Bến xe Miền Đông đến Bến xe Miền Tây",
//       vehicle: "Xe 29 chỗ - Biển số 51A-12345"
//     },
//     {
//       id: "2",
//       staffId: "123e4567-e89b-12d3-a456-426614174001",
//       routeId: "223e4567-e89b-12d3-a456-426614174001",
//       fullName: "Trần Thị B",
//       role: "Phụ xe",
//       routeName: "Tuyến 2 - Bến xe Miền Tây đến Bến xe Đà Nẵng",
//       vehicle: "Xe 45 chỗ - Biển số 51B-67890"
//     }
//   ];
  
//   export const dispatchAssignments: DispatchAssignment[] = [
//     {
//       id: "1",
//       staffId: "123e4567-e89b-12d3-a456-426614174000",
//       tripId: "323e4567-e89b-12d3-a456-426614174000",
//       routeId: "223e4567-e89b-12d3-a456-426614174000",
//       assignedAt: "2023-06-15T08:00:00",
//       expectedEndTime: "2023-06-15T10:00:00",
//       fromLocation: "Main Depot",
//       toLocation: "Central Station",
//       role: "driver",
//       status: "completed"
//     },
//     {
//       id: "2",
//       staffId: "123e4567-e89b-12d3-a456-426614174001",
//       tripId: "323e4567-e89b-12d3-a456-426614174001",
//       routeId: "223e4567-e89b-12d3-a456-426614174001",
//       assignedAt: "2023-06-16T09:00:00",
//       expectedEndTime: "2023-06-16T12:00:00",
//       fromLocation: "Central Station",
//       toLocation: "North Terminal",
//       role: "conductor",
//       status: "in-progress"
//     }
//   ];
  
//   export const staffUnavailabilities: StaffUnavailability[] = [
//     {
//       id: "1",
//       staffId: "123e4567-e89b-12d3-a456-426614174000",
//       startTime: "2023-06-17T00:00:00",
//       endTime: "2023-06-18T00:00:00",
//       reason: "Nghỉ phép"
//     },
//     {
//       id: "2",
//       staffId: "123e4567-e89b-12d3-a456-426614174001",
//       startTime: "2023-06-20T00:00:00",
//       endTime: "2023-06-21T00:00:00",
//       reason: "Khám sức khỏe"
//     }
//   ];