import React, { useState } from 'react';

interface StaffUnavailability {
  id: string;
  staff_id: string;
  start_time: string;
  end_time: string;
  reason?: string;
}

// Dữ liệu mock nhân viên
const staffList = [
  { id: "st1", full_name: "Nguyễn Văn A", role: "driver" },
  { id: "st2", full_name: "Trần Thị B", role: "conductor" },
  { id: "st3", full_name: "Lê Văn C", role: "driver" }
];

// Dữ liệu mock thời gian nghỉ ban đầu
const initialUnavailabilities = [
  {
    id: "su1",
    staff_id: "st1",
    start_time: "2023-06-20T00:00:00Z",
    end_time: "2023-06-22T00:00:00Z",
    reason: "Nghỉ ốm"
  },
  {
    id: "su2",
    staff_id: "st2",
    start_time: "2023-06-15T00:00:00Z",
    end_time: "2023-06-16T00:00:00Z",
    reason: "Nghỉ phép"
  }
];

const StaffUnavailabilityPage = () => {
  const [unavailabilities, setUnavailabilities] = useState<StaffUnavailability[]>(initialUnavailabilities);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUnavailability, setCurrentUnavailability] = useState<Partial<StaffUnavailability>>({
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 3600000).toISOString()
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentUnavailability(prev => ({ ...prev, [name]: value }));
  };

  const handleDateTimeChange = (field: string, value: string) => {
    setCurrentUnavailability(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (new Date(currentUnavailability.end_time!) <= new Date(currentUnavailability.start_time!)) {
      alert('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    if (currentUnavailability.id) {
      // Cập nhật thời gian nghỉ
      setUnavailabilities(unavailabilities.map(unavailability => 
        unavailability.id === currentUnavailability.id ? { ...unavailability, ...currentUnavailability } as StaffUnavailability : unavailability
      ));
    } else {
      // Thêm thời gian nghỉ mới
      const newUnavailability = {
        ...currentUnavailability,
        id: `su${unavailabilities.length + 1}`
      } as StaffUnavailability;
      setUnavailabilities([...unavailabilities, newUnavailability]);
    }
    
    setIsDialogOpen(false);
    setCurrentUnavailability({
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString()
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa thời gian nghỉ này?')) {
      setUnavailabilities(unavailabilities.filter(u => u.id !== id));
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="py-6 px-4 md:px-6 xl:px-7.5 flex justify-between items-center">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Quản lý thời gian không làm việc
        </h4>
        <button
          onClick={() => {
            setCurrentUnavailability({
              start_time: new Date().toISOString(),
              end_time: new Date(Date.now() + 3600000).toISOString()
            });
            setIsDialogOpen(true);
          }}
          className="inline-flex items-center justify-center rounded-md bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90"
        >
          Thêm thời gian nghỉ
        </button>
      </div>

      <div className="grid grid-cols-5 border-t border-stroke py-4.5 px-4 dark:border-strokedark md:px-6 2xl:px-7.5">
        <div className="col-span-1">Nhân viên</div>
        <div className="col-span-1">Bắt đầu</div>
        <div className="col-span-1">Kết thúc</div>
        <div className="col-span-1">Lý do</div>
        <div className="col-span-1">Hành động</div>
      </div>

      {unavailabilities.map((unavailability) => {
        const staff = staffList.find(s => s.id === unavailability.staff_id);
        
        return (
          <div
            key={unavailability.id}
            className="grid grid-cols-5 border-t border-stroke py-4.5 px-4 dark:border-strokedark md:px-6 2xl:px-7.5"
          >
            <div className="col-span-1">{staff?.full_name || unavailability.staff_id}</div>
            <div className="col-span-1">{new Date(unavailability.start_time).toLocaleString()}</div>
            <div className="col-span-1">{new Date(unavailability.end_time).toLocaleString()}</div>
            <div className="col-span-1">{unavailability.reason || '-'}</div>
            <div className="col-span-1 flex space-x-2">
              <button
                onClick={() => {
                  setCurrentUnavailability(unavailability);
                  setIsDialogOpen(true);
                }}
                className="text-primary hover:text-opacity-80"
              >
                Sửa
              </button>
              <button
                onClick={() => handleDelete(unavailability.id)}
                className="text-danger hover:text-opacity-80"
              >
                Xóa
              </button>
            </div>
          </div>
        );
      })}

      {/* Dialog thêm/sửa thời gian nghỉ */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-boxdark rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {currentUnavailability.id ? 'Chỉnh sửa thời gian nghỉ' : 'Thêm thời gian nghỉ mới'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Nhân viên</label>
                  <select
                    name="staff_id"
                    value={currentUnavailability.staff_id || ''}
                    onChange={handleInputChange}
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 dark:border-strokedark dark:bg-meta-4"
                    required
                  >
                    <option value="">Chọn nhân viên</option>
                    {staffList.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2">Thời gian bắt đầu</label>
                  <input
                    type="datetime-local"
                    value={currentUnavailability.start_time ? new Date(currentUnavailability.start_time).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleDateTimeChange('start_time', e.target.value)}
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 dark:border-strokedark dark:bg-meta-4"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">Thời gian kết thúc</label>
                  <input
                    type="datetime-local"
                    value={currentUnavailability.end_time ? new Date(currentUnavailability.end_time).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleDateTimeChange('end_time', e.target.value)}
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 dark:border-strokedark dark:bg-meta-4"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">Lý do</label>
                  <textarea
                    name="reason"
                    value={currentUnavailability.reason || ''}
                    onChange={handleInputChange}
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 dark:border-strokedark dark:bg-meta-4"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffUnavailabilityPage;