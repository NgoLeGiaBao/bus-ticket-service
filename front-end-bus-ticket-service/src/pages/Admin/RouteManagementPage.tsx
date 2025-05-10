import React, { useState, useEffect } from 'react';
import { Route, RouteFormData, Subroute } from '../interfaces/RouteAndTrip';
import { createRoute, getAllRoutes, getRouteById, updateRoute, toggleRouteStatus } from '../../services/apiServices';
import { FiMapPin, FiDollarSign, FiPlus, FiEdit, FiChevronDown, FiChevronUp, FiX, FiTrash2, FiArrowUp, FiArrowDown } from 'react-icons/fi';

const RouteManagement: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [search, setSearch] = useState('');
  const [newRoute, setNewRoute] = useState<RouteFormData>({
    origin: '',
    destination: '',
    distance: 0,
    duration: '0',
    price: 0,
    is_active: true,
    subroutes: [],
  });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [modalMessage, setModalMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const res = await getAllRoutes();
      setRoutes(res.data);
    } catch (error) {
      setModalMessage({ text: 'Không thể tải danh sách tuyến đường', type: 'error' });
      setShowModal(true);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!newRoute.origin.trim()) newErrors.origin = 'Điểm đi là bắt buộc';
    if (!newRoute.destination.trim()) newErrors.destination = 'Điểm đến là bắt buộc';
    if (newRoute.distance <= 0) newErrors.distance = 'Khoảng cách phải lớn hơn 0';
    if (parseFloat(newRoute.duration) <= 0) newErrors.duration = 'Thời gian phải lớn hơn 0';
    if (newRoute.price <= 0) newErrors.price = 'Giá phải lớn hơn 0';

    newRoute.subroutes.forEach((subroute, index) => {
      if (!subroute.relatedrouteid) {
        newErrors[`subroute_${index}_relatedrouteid`] = 'Vui lòng chọn tuyến phụ';
      }
      if (subroute.sortorder <= 0) {
        newErrors[`subroute_${index}_sortorder`] = 'Thứ tự phải lớn hơn 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = async (route: Route) => {
    try {
      const res = await getRouteById(route.id);
      if (!res.data) {
        setModalMessage({ text: 'Không tìm thấy tuyến đường', type: 'error' });
        setShowModal(true);
        return;
      }
      setNewRoute({
        origin: res.data.origin,
        destination: res.data.destination,
        distance: res.data.distance,
        duration: res.data.duration,
        price: res.data.price,
        is_active: res.data.is_active,
        subroutes: res.data.subroutes.map((subroute) => ({
          ...subroute,
          sortorder: subroute.sortorder,
        })),
      });
      setEditingId(route.id);
      setShowModal(true);
    } catch (error) {
      setModalMessage({ text: 'Không thể tải chi tiết tuyến đường', type: 'error' });
      setShowModal(true);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setModalMessage({ text: 'Vui lòng kiểm tra và sửa các lỗi trong biểu mẫu', type: 'error' });
      return;
    }

    try {
      const routeData = {
        ...newRoute,
        subroutes: newRoute.subroutes.map((subroute) => ({
          ...subroute,
          sortorder: subroute.sortorder,
        })),
      };

      if (editingId) {
        await updateRoute(editingId, routeData);
        setModalMessage({ text: 'Cập nhật tuyến đường thành công', type: 'success' });
      } else {
        await createRoute(routeData);
        setModalMessage({ text: 'Thêm tuyến đường thành công', type: 'success' });
      }

      await fetchRoutes();
      setTimeout(resetForm, 1500); // Delay closing modal to show success message
    } catch (error) {
      setModalMessage({ text: 'Đã xảy ra lỗi khi lưu tuyến đường', type: 'error' });
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingId(null);
    setNewRoute({
      origin: '',
      destination: '',
      distance: 0,
      duration: '0',
      price: 0,
      is_active: true,
      subroutes: [],
    });
    setErrors({});
    setModalMessage(null);
  };

  const toggleStatus = async (id: string) => {
    try {
      const route = routes.find((route) => route.id === id);
      if (route) {
        await toggleRouteStatus(id, !route.is_active);
        await fetchRoutes();
        setModalMessage({
          text: `Tuyến đường đã được ${route.is_active ? 'ngừng' : 'kích hoạt'}`,
          type: 'success',
        });
        setShowModal(false);
      }
    } catch (error) {
      setModalMessage({ text: 'Không thể cập nhật trạng thái tuyến đường', type: 'error' });
      setShowModal(false);
    }
  };

  const filteredRoutes = routes.filter(
    (route) =>
      route.origin.toLowerCase().includes(search.toLowerCase()) ||
      route.destination.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSubroute = () => {
    const nextSortOrder =
      newRoute.subroutes.length > 0
        ? Math.max(...newRoute.subroutes.map((s) => s.sortorder)) + 1
        : 1;

    setNewRoute({
      ...newRoute,
      subroutes: [
        ...newRoute.subroutes,
        { relatedrouteid: '', sortorder: nextSortOrder, isactive: true },
      ],
    });
  };

  const handleRemoveSubroute = (index: number) => {
    const updatedSubroutes = newRoute.subroutes.filter((_, i) => i !== index);
    setNewRoute({ ...newRoute, subroutes: updatedSubroutes });
  };

  const handleSubrouteChange = (index: number, field: keyof Subroute, value: any) => {
    const updatedSubroutes = newRoute.subroutes.map((subroute, i) =>
      i === index ? { ...subroute, [field]: value } : subroute
    );
    setNewRoute({ ...newRoute, subroutes: updatedSubroutes });
  };

  const moveSubroute = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newRoute.subroutes.length) return;

    const updatedSubroutes = [...newRoute.subroutes];
    [updatedSubroutes[index], updatedSubroutes[newIndex]] = [
      updatedSubroutes[newIndex],
      updatedSubroutes[index],
    ];

    updatedSubroutes.forEach((subroute, i) => {
      subroute.sortorder = i + 1;
    });

    setNewRoute({ ...newRoute, subroutes: updatedSubroutes });
  };

  const toggleExpandRoute = (id: string) => {
    setExpandedRouteId(expandedRouteId === id ? null : id);
  };

  const getSubrouteDetails = (subroute: Subroute) => {
    const relatedRoute = routes.find((route) => route.id === subroute.relatedrouteid);
    return relatedRoute
      ? `${relatedRoute.origin} → ${relatedRoute.destination} (Thứ tự: ${subroute.sortorder}, ${subroute.isactive ? 'Đang hoạt động' : 'Ngừng hoạt động'})`
      : 'Không tìm thấy tuyến đường';
  };

  return (
    <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-stroke py-6 px-4 md:px-6 xl:px-7.5 dark:border-strokedark">
        <div className="flex items-center space-x-3">
          {/* <FiMapPin className="text-2xl text-primary" /> */}
          <h4 className="text-xl font-semibold text-black dark:text-white">Quản lý tuyến đường</h4>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90 transition-colors"
        >
          <FiPlus className="mr-2" />
          Thêm tuyến đường
        </button>
      </div>

      {/* Filters */}
      <div className="px-4 md:px-6 xl:px-7.5 pb-4 pt-4 space-y-4 bg-gray-50 dark:bg-meta-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tìm kiếm tuyến đường
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FiMapPin className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Nhập điểm đi hoặc điểm đến..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Route List */}
      <div className="p-4 md:p-6 xl:p-7.5">
        {filteredRoutes.length === 0 ? (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">
            <FiMapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium">Không tìm thấy tuyến đường nào</h3>
            <p className="mt-1 text-sm">Thử thay đổi tiêu chí tìm kiếm hoặc thêm tuyến đường mới</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
              <thead className="bg-gray-50 dark:bg-meta-4 text-center">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 text-center">
                    Điểm đi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 text-center">
                    Điểm đến
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 text-center">
                    Khoảng cách (km)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 text-center">
                    Thời gian (giờ)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 text-center">
                    Giá (VND)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 text-center">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 text-center">
                    Hành động
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 text-center">
                    Tuyến phụ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke bg-white dark:bg-boxdark dark:divide-strokedark">
                {filteredRoutes.map((route) => (
                  <React.Fragment key={route.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors text-center">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {route.origin}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {route.destination}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {route.distance.toFixed(1)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {route.duration}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {route.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            route.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {route.is_active ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleEdit(route)}
                            className="flex items-center text-primary hover:text-primary-dark"
                          >
                            <FiEdit className="mr-1" />
                            Sửa
                          </button>
                          <button
                            onClick={() => toggleStatus(route.id)}
                            className="flex items-center text-amber-600 hover:text-amber-900"
                          >
                            {route.is_active ? 'Ngừng' : 'Kích hoạt'}
                          </button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        {route.subroutes?.length ? (
                          <button
                            onClick={() => toggleExpandRoute(route.id)}
                            className="flex items-center text-primary hover:text-primary-dark"
                          >
                            {expandedRouteId === route.id ? (
                              <FiChevronUp className="mr-1" />
                            ) : (
                              <FiChevronDown className="mr-1" />
                            )}
                            {expandedRouteId === route.id ? 'Ẩn' : 'Hiện'} ({route.subroutes.length})
                          </button>
                        ) : (
                          <span className="text-gray-400">Không có</span>
                        )}
                      </td>
                    </tr>
                    {expandedRouteId === route.id && route.subroutes?.length > 0 && (
                      <tr>
                        <td colSpan={8} className="bg-gray-50 px-6 py-4 dark:bg-meta-4">
                          <div className="pl-8">
                            <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              Tuyến phụ:
                            </h4>
                            <ul className="space-y-1">
                              {route.subroutes.map((subroute, idx) => (
                                <li
                                  key={idx}
                                  className="text-sm text-gray-600 dark:text-gray-400"
                                >
                                  {idx + 1}. {getSubrouteDetails(subroute)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
                {editingId ? 'Chỉnh sửa tuyến đường' : 'Thêm tuyến đường mới'}
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
                    Điểm đi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiMapPin className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className={`w-full rounded-lg border bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white ${
                        errors.origin ? 'border-red-500' : 'border-stroke'
                      }`}
                      value={newRoute.origin}
                      onChange={(e) =>
                        setNewRoute({ ...newRoute, origin: e.target.value })
                      }
                    />
                  </div>
                  {errors.origin && (
                    <p className="mt-1 text-sm text-red-600">{errors.origin}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Điểm đến <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiMapPin className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className={`w-full rounded-lg border bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white ${
                        errors.destination ? 'border-red-500' : 'border-stroke'
                      }`}
                      value={newRoute.destination}
                      onChange={(e) =>
                        setNewRoute({ ...newRoute, destination: e.target.value })
                      }
                    />
                  </div>
                  {errors.destination && (
                    <p className="mt-1 text-sm text-red-600">{errors.destination}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Khoảng cách (km) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className={`w-full rounded-lg border bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white ${
                      errors.distance ? 'border-red-500' : 'border-stroke'
                    }`}
                    value={newRoute.distance}
                    onChange={(e) =>
                      setNewRoute({ ...newRoute, distance: Number(e.target.value) })
                    }
                  />
                  {errors.distance && (
                    <p className="mt-1 text-sm text-red-600">{errors.distance}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Thời gian (giờ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className={`w-full rounded-lg border bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white ${
                      errors.duration ? 'border-red-500' : 'border-stroke'
                    }`}
                    value={newRoute.duration}
                    onChange={(e) =>
                      setNewRoute({ ...newRoute, duration: e.target.value })
                    }
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Giá (VND) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      className={`w-full rounded-lg border bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white ${
                        errors.price ? 'border-red-500' : 'border-stroke'
                      }`}
                      value={newRoute.price}
                      onChange={(e) =>
                        setNewRoute({ ...newRoute, price: Number(e.target.value) })
                      }
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-400">{errors.price}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={newRoute.is_active}
                  onChange={(e) =>
                    setNewRoute({ ...newRoute, is_active: e.target.checked })
                  }
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Đang hoạt động
                </label>
              </div>

              {/* Subroutes Section */}
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tuyến phụ
                  </label>
                  <button
                    onClick={handleAddSubroute}
                    className="inline-flex items-center rounded-md border border-transparent bg-primary bg-opacity-10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-opacity-20"
                  >
                    <FiPlus className="mr-1" />
                    Thêm tuyến phụ
                  </button>
                </div>

                <div className="space-y-3">
                  {newRoute.subroutes.length === 0 ? (
                    <p className="text-sm italic text-gray-500 dark:text-gray-400">
                      Chưa có tuyến phụ nào được thêm
                    </p>
                  ) : (
                    newRoute.subroutes.map((subroute, index) => (
                      <div
                        key={index}
                        className="rounded-md border border-stroke bg-gray-50 p-3 dark:border-strokedark dark:bg-meta-4"
                      >
                        <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-12">
                          <div className="md:col-span-5">
                            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                              Tuyến đường
                            </label>
                            <select
                              className={`block w-full rounded-lg border bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white ${
                                errors[`subroute_${index}_relatedrouteid`]
                                  ? 'border-red-500'
                                  : 'border-stroke'
                              }`}
                              value={subroute.relatedrouteid}
                              onChange={(e) =>
                                handleSubrouteChange(index, 'relatedrouteid', e.target.value)
                              }
                            >
                              <option value="">Chọn tuyến đường</option>
                              {routes
                                .filter((route) => route.id !== editingId)
                                .map((route) => (
                                  <option key={route.id} value={route.id}>
                                    {route.origin} → {route.destination}
                                  </option>
                                ))}
                            </select>
                            {errors[`subroute_${index}_relatedrouteid`] && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors[`subroute_${index}_relatedrouteid`]}
                              </p>
                            )}
                          </div>

                          <div className="md:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                              Thứ tự
                            </label>
                            <input
                              type="number"
                              min="1"
                              className={`block w-full rounded-lg border bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white ${
                                errors[`subroute_${index}_sortorder`]
                                  ? 'border-red-500'
                                  : 'border-stroke'
                              }`}
                              value={subroute.sortorder}
                              onChange={(e) =>
                                handleSubrouteChange(
                                  index,
                                  'sortorder',
                                  Number(e.target.value)
                                )
                              }
                            />
                            {errors[`subroute_${index}_sortorder`] && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors[`subroute_${index}_sortorder`]}
                              </p>
                            )}
                          </div>

                          <div className="md:col-span-2 flex items-center">
                            <input
                              type="checkbox"
                              id={`subroute-active-${index}`}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              checked={subroute.isactive}
                              onChange={(e) =>
                                handleSubrouteChange(index, 'isactive', e.target.checked)
                              }
                            />
                            <label
                              htmlFor={`subroute-active-${index}`}
                              className="ml-2 block text-xs text-gray-700 dark:text-gray-300"
                            >
                              Đang hoạt động
                            </label>
                          </div>

                          <div className="md:col-span-3 flex justify-end space-x-2">
                            <button
                              onClick={() => moveSubroute(index, 'up')}
                              disabled={index === 0}
                              className={`rounded-md p-1 ${
                                index === 0
                                  ? 'cursor-not-allowed text-gray-300'
                                  : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-meta-4'
                              }`}
                              title="Di chuyển lên"
                            >
                              <FiArrowUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => moveSubroute(index, 'down')}
                              disabled={index === newRoute.subroutes.length - 1}
                              className={`rounded-md p-1 ${
                                index === newRoute.subroutes.length - 1
                                  ? 'cursor-not-allowed text-gray-300'
                                  : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-meta-4'
                              }`}
                              title="Di chuyển xuống"
                            >
                              <FiArrowDown className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveSubroute(index)}
                              className="rounded-md p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20"
                              title="Xóa"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
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
                  {editingId ? 'Cập nhật tuyến đường' : 'Thêm tuyến đường'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteManagement;