import React, { useState, useEffect } from 'react';
import { FiTruck, FiPlus, FiEdit, FiSearch, FiX } from 'react-icons/fi';
import { createVehicle, getAllVehicles, updateVehicle } from '../../services/apiServices';
import { Vehicle, VehicleFormData } from '../../interfaces/Vehicles';

// interface Vehicle {
//   id: string;
//   licenseplate: string;
//   vehiclelabel: string;
//   vehicletype: 'Limousine' | 'Standard';
//   brand: string;
//   status: 'Active' | 'Inactive' | 'Maintenance' | 'Broken';
//   capacity: number;
//   registrationdate: string;
//   registrationexpirydate: string;
//   yearofmanufacture: number;
//   lastmaintenance: string;
//   nextmaintenancedue: string;
// }

// interface VehicleFormData {
//   licenseplate: string;
//   vehiclelabel: string;
//   vehicletype: 'Limousine' | 'Standard' | '';
//   brand: string;
//   status: 'Active' | 'Inactive' | 'Maintenance' | 'Broken';
//   capacity: number;
//   registrationdate: string;
//   registrationexpirydate: string;
//   yearofmanufacture: number;
//   lastmaintenance: string;
//   nextmaintenancedue: string;
// }

const VehicleManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');
  const [newVehicle, setNewVehicle] = useState<VehicleFormData>({
    licenseplate: '',
    vehiclelabel: '',
    vehicletype: '',
    brand: '',
    status: 'Active',
    capacity: 0,
    registrationdate: '',
    registrationexpirydate: '',
    yearofmanufacture: new Date().getFullYear(),
    lastmaintenance: '',
    nextmaintenancedue: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [modalMessage, setModalMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      const res = await getAllVehicles();
      setVehicles(res.data);
    } catch (error) {
      setModalMessage({ text: 'Không thể tải danh sách phương tiện', type: 'error' });
      setShowModal(true);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!newVehicle.licenseplate.trim()) newErrors.licenseplate = 'Biển số xe là bắt buộc';
    if (!editingId && vehicles.some(v => v.licenseplate.toLowerCase() === newVehicle.licenseplate.toLowerCase())) {
      newErrors.licenseplate = 'Biển số đã tồn tại';
    }
    if (!newVehicle.vehiclelabel.trim()) newErrors.vehiclelabel = 'Tên phương tiện là bắt buộc';
    if (!newVehicle.vehicletype) newErrors.vehicletype = 'Loại phương tiện là bắt buộc';
    if (!newVehicle.brand.trim()) newErrors.brand = 'Hãng xe là bắt buộc';
    if (!newVehicle.registrationdate) newErrors.registrationdate = 'Ngày đăng ký là bắt buộc';
    if (!newVehicle.registrationexpirydate) newErrors.registrationexpirydate = 'Ngày hết hạn đăng ký là bắt buộc';
    if (newVehicle.yearofmanufacture < 1900 || newVehicle.yearofmanufacture > new Date().getFullYear())
      newErrors.yearofmanufacture = 'Năm sản xuất không hợp lệ';
    if (!newVehicle.lastmaintenance) newErrors.lastmaintenance = 'Ngày bảo trì cuối là bắt buộc';
    if (!newVehicle.nextmaintenancedue) newErrors.nextmaintenancedue = 'Ngày bảo trì tiếp theo là bắt buộc';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = (vehicle: Vehicle) => {
    setNewVehicle({
      licenseplate: vehicle.licenseplate,
      vehiclelabel: vehicle.vehiclelabel,
      vehicletype: vehicle.vehicletype,
      brand: vehicle.brand,
      status: vehicle.status,
      capacity: vehicle.capacity,
      registrationdate: vehicle.registrationdate,
      registrationexpirydate: vehicle.registrationexpirydate,
      yearofmanufacture: vehicle.yearofmanufacture,
      lastmaintenance: vehicle.lastmaintenance,
      nextmaintenancedue: vehicle.nextmaintenancedue,
    });
    setEditingId(vehicle.id);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setModalMessage({
        text: 'Vui lòng kiểm tra và sửa các lỗi trong biểu mẫu.',
        type: 'error',
      });
      return;
    }

    try {
      const vehicleData = {
        ...newVehicle,
        capacity: newVehicle.vehicletype === 'Limousine' ? 34 : 36,
      };

      const action = editingId ? updateVehicle(editingId, vehicleData) : createVehicle(vehicleData);
      const res = await action;

      if (res.success) {
        setModalMessage({
          text: editingId ? 'Cập nhật phương tiện thành công.' : 'Thêm phương tiện thành công.',
          type: 'success',
        });

        await fetchVehicles();
        setTimeout(resetForm, 1500);
      } else {
        throw new Error('Lưu phương tiện thất bại.');
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      setModalMessage({
        text: 'Đã xảy ra lỗi khi lưu phương tiện. Vui lòng thử lại.',
        type: 'error',
      });
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingId(null);
    setNewVehicle({
      licenseplate: '',
      vehiclelabel: '',
      vehicletype: '',
      brand: '',
      status: 'Active',
      capacity: 0,
      registrationdate: '',
      registrationexpirydate: '',
      yearofmanufacture: new Date().getFullYear(),
      lastmaintenance: '',
      nextmaintenancedue: '',
    });
    setErrors({});
    setModalMessage(null);
  };

  const updateStatus = async (id: string, newStatus: 'Active' | 'Inactive' | 'Maintenance' | 'Broken') => {
    try {
      const vehicle = vehicles.find((v) => v.id === id);
      if (vehicle) {
        const res = await updateVehicle(id, { ...vehicle, status: newStatus });
        if (res.success) {
          await fetchVehicles();
          setModalMessage({
            text: `Phương tiện đã được cập nhật trạng thái thành ${
              newStatus === 'Active' ? 'Đang hoạt động' :
              newStatus === 'Inactive' ? 'Ngừng hoạt động' :
              newStatus === 'Maintenance' ? 'Bảo trì' : 'Sự cố'
            }`,
            type: 'success',
          });
        } else {
          throw new Error('Cập nhật trạng thái thất bại.');
        }
      }
    } catch (error) {
      setModalMessage({ text: 'Không thể cập nhật trạng thái phương tiện', type: 'error' });
    }
  };

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.licenseplate.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.vehiclelabel.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-stroke py-6 px-4 md:px-6 xl:px-7.5 dark:border-strokedark">
        <div className="flex items-center space-x-3">
          {/* <FiTruck className="text-2xl text-primary" /> */}
          <h4 className="text-xl font-semibold text-black dark:text-white">Quản lý phương tiện</h4>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90 transition-colors"
        >
          <FiPlus className="mr-2" />
          Thêm phương tiện
        </button>
      </div>

      {/* Filters */}
      <div className="px-4 md:px-6 xl:px-7.5 pb-4 pt-4 space-y-4 bg-gray-50 dark:bg-meta-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tìm kiếm phương tiện
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Nhập biển số hoặc tên phương tiện..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="p-4 md:p-6 xl:p-7.5">
        {filteredVehicles.length === 0 ? (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">
            <FiTruck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium">Không tìm thấy phương tiện nào</h3>
            <p className="mt-1 text-sm">Thử thay đổi tiêu chí tìm kiếm hoặc thêm phương tiện mới</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
              <thead className="bg-gray-50 dark:bg-meta-4 text-center">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 text-center">
                    Biển số
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 text-center">
                    Tên phương tiện
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 text-center">
                    Loại phương tiện
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 text-center">
                    Hãng xe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 text-center">
                    Sức chứa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 text-center">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 text-center">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke bg-white dark:bg-boxdark dark:divide-strokedark">
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors text-center">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {vehicle.licenseplate}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {vehicle.vehiclelabel}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {vehicle.vehicletype}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {vehicle.brand}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {vehicle.capacity}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          vehicle.status === 'Active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : vehicle.status === 'Inactive'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : vehicle.status === 'Maintenance'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}
                      >
                        {vehicle.status === 'Active' ? 'Đang hoạt động' : 
                         vehicle.status === 'Inactive' ? 'Ngừng hoạt động' : 
                         vehicle.status === 'Maintenance' ? 'Bảo trì' : 'Sự cố'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-4 justify-center">
                        <button
                          onClick={() => handleEdit(vehicle)}
                          className="flex items-center text-primary hover:text-primary-dark"
                        >
                          <FiEdit className="mr-1" />
                          Sửa
                        </button>
                        <select
                          value={vehicle.status}
                          onChange={(e) => updateStatus(vehicle.id, e.target.value as 'Active' | 'Inactive' | 'Maintenance' | 'Broken')}
                          className="rounded-md border border-gray-300 bg-white py-1 px-2 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                        >
                          <option value="Active">Đang hoạt động</option>
                          <option value="Inactive">Ngừng hoạt động</option>
                          <option value="Maintenance">Bảo trì</option>
                          <option value="Broken">Sự cố</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 dark:bg-boxdark">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingId ? 'Chỉnh sửa phương tiện' : 'Thêm phương tiện mới'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {modalMessage && (
              <div
                className={`mb-4 rounded p-3 text-sm ${
                  modalMessage.type === 'error'
                    ? 'bg-red-50 text-red-600 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-300'
                    : 'bg-green-50 text-green-600 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-300'
                }`}
              >
                {modalMessage.text}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Biển số <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full rounded-lg border bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white ${
                      errors.licenseplate ? 'border-red-500' : 'border-stroke'
                    }`}
                    value={newVehicle.licenseplate}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, licenseplate: e.target.value })
                    }
                    disabled={!!editingId}
                  />
                  {errors.licenseplate && (
                    <p className="mt-1 text-sm text-red-600">{errors.licenseplate}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tên điều khiển <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full rounded-lg border bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white ${
                      errors.vehiclelabel ? 'border-red-500' : 'border-stroke'
                    }`}
                    value={newVehicle.vehiclelabel}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, vehiclelabel: e.target.value })
                    }
                  />
                  {errors.vehiclelabel && (
                    <p className="mt-1 text-sm text-red-600">{errors.vehiclelabel}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Loại phương tiện <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full rounded-lg border bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white ${
                      errors.vehicletype ? 'border-red-500' : 'border-stroke'
                    }`}
                    value={newVehicle.vehicletype}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, vehicletype: e.target.value as 'Limousine' | 'Standard' | '' })
                    }
                  >
                    <option value="">Chọn loại phương tiện</option>
                    <option value="Limousine">Limousine (34 chỗ)</option>
                    <option value="Standard">Standard (36 chỗ)</option>
                  </select>
                  {errors.vehicletype && (
                    <p className="mt-1 text-sm text-red-600">{errors.vehicletype}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hãng xe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full rounded-lg border bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white ${
                      errors.brand ? 'border-red-500' : 'border-stroke'
                    }`}
                    value={newVehicle.brand}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, brand: e.target.value })
                    }
                  />
                  {errors.brand && (
                    <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sức chứa
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-stroke bg-white py-2 px-3 text-sm dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    value={newVehicle.vehicletype === 'Limousine' ? 34 : newVehicle.vehicletype === 'Standard' ? 36 : 0}
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ngày đăng ký <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full rounded-lg border bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white ${
                      errors.registrationdate ? 'border-red-500' : 'border-stroke'
                    }`}
                    value={newVehicle.registrationdate}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, registrationdate: e.target.value })
                    }
                  />
                  {errors.registrationdate && (
                    <p className="mt-1 text-sm text-red-600">{errors.registrationdate}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ngày hết hạn đăng ký <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full rounded-lg border bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white ${
                      errors.registrationexpirydate ? 'border-red-500' : 'border-stroke'
                    }`}
                    value={newVehicle.registrationexpirydate}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, registrationexpirydate: e.target.value })
                    }
                  />
                  {errors.registrationexpirydate && (
                    <p className="mt-1 text-sm text-red-600">{errors.registrationexpirydate}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Năm sản xuất <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    className={`w-full rounded-lg border bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white ${
                      errors.yearofmanufacture ? 'border-red-500' : 'border-stroke'
                    }`}
                    value={newVehicle.yearofmanufacture}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, yearofmanufacture: Number(e.target.value) })
                    }
                  />
                  {errors.yearofmanufacture && (
                    <p className="mt-1 text-sm text-red-600">{errors.yearofmanufacture}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bảo trì cuối <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full rounded-lg border bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white ${
                      errors.lastmaintenance ? 'border-red-500' : 'border-stroke'
                    }`}
                    value={newVehicle.lastmaintenance}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, lastmaintenance: e.target.value })
                    }
                  />
                  {errors.lastmaintenance && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastmaintenance}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bảo trì tiếp theo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full rounded-lg border bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white ${
                      errors.nextmaintenancedue ? 'border-red-500' : 'border-stroke'
                    }`}
                    value={newVehicle.nextmaintenancedue}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, nextmaintenancedue: e.target.value })
                    }
                  />
                  {errors.nextmaintenancedue && (
                    <p className="mt-1 text-sm text-red-600">{errors.nextmaintenancedue}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full rounded-lg border bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white ${
                    errors.status ? 'border-red-500' : 'border-stroke'
                  }`}
                  value={newVehicle.status}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, status: e.target.value as 'Active' | 'Inactive' | 'Maintenance' | 'Broken' })
                  }
                >
                  <option value="Active">Đang hoạt động</option>
                  <option value="Inactive">Ngừng hoạt động</option>
                  <option value="Maintenance">Bảo trì</option>
                  <option value="Broken">Sự cố</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={resetForm}
                  type="button"
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-strokedark dark:text-gray-300 dark:hover:bg-meta-4"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  type="button"
                  className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                >
                  {editingId ? 'Cập nhật phương tiện' : 'Thêm phương tiện'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;