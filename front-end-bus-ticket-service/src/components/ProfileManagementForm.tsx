import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import FailureNotification from './FailureNotification';
import SuccessNotification from './SuccessNotification';
import CustomerAccountUpdateModal from './CustomerAccountUpdateModal';
import CustomerChangePasswordModal from './CustomerChangePasswordModal';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/userSlice';
import { postLogout } from '../services/apiServices';


const ProfileManagementForm: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	
	
	const user = useSelector((state: any) => state.user.account);
	const isAuthenticated = useSelector((state: any) => state.user.isAuthenticated);

	const [successModal, setSuccessModal] = useState<boolean>(false);
	const [failureModal, setFailureModal] = useState<boolean>(false);
	const [changePasswordModal, setChangePasswordModal] = useState<boolean>(false);
	const [modelUpdate, setUpdateModal] = useState<boolean>(false);
	const [message, setMessage] = useState<string>('');

	useEffect(() => {
		if (!isAuthenticated) {
			navigate('/login');
		}
	}, []);


	const handleLogout = async () => {
		const res = await postLogout();
		if (res.success) {
			dispatch(logout());
			localStorage.removeItem('persist:user');
			localStorage.removeItem('token');
			navigate('/');
		}
	};

	const openChangePasswordModal = () => setChangePasswordModal(true);

	const handleChangeAvatar = async (file: File) => {
		// const url = `avatars/${v4()}`;
		// const imageRef = ref(imageDB, url);
		// await uploadBytes(imageRef, file);

		// const data = { avatar: url };
		// const token = sessionStorage.getItem('token');

		// if (token) {
		// 	axios
		// 		.put(API_URL + 'customer/change-avatar', data, { headers: { Authorization: `Bearer ${token}` } })
		// 		.then(async (res) => {
		// 			setMessage(res.data.message);
		// 			openSuccessModal();
		// 			if (customer.avatar) {
		// 				const oldImageRef = ref(imageDB, customer.avatar);
		// 				await deleteObject(oldImageRef);
		// 			}
		// 			refresh();
		// 		})
		// 		.catch((err) => {
		// 			if (err.response?.status === 401) {
		// 				navigate('/login');
		// 			}
		// 			setMessage(err.response?.data?.message || 'Đã có lỗi xảy ra');
		// 			openFailureModal();
		// 		});
		// } else {
		// 	navigate('/login');
		// }
	};

	const closeUpdateModal = () => setUpdateModal(false);
	const closeChangePasswordModal = () => setChangePasswordModal(false);
	const closeSuccessModal = () => setSuccessModal(false);
	const closeFailureModal = () => setFailureModal(false);
	const openSuccessModal = () => setSuccessModal(true);
	const openFailureModal = () => setFailureModal(true);
	const openUpdateModal = () => setUpdateModal(true);
    return (
		<div className="flex-1">
			<div className="flex flex-col-reverse md:flex-row w-full lg:w-[80%] 2xl:w-[60%] mx-auto p-5 gap-y-8 md:gap-x-8 my-8">
				<div className="flex basis-1/4 border border-slate-300 p-2 flex-col rounded-xl">
					<div className="flex flex-row p-2 mb-2 items-center hover:bg-slate-100 cursor-pointer">
						<div className="basis-1/4">
							<img
								src="https://futabus.vn/images/header/profile/futaPay.svg"
								alt="futapay"
							/>
						</div>
						<div className="basis-3/4 ml-3">FUTAPay</div>
					</div>
					<div className="flex flex-row p-2 mb-2 items-center hover:bg-slate-100 cursor-pointer">
						<div className="basis-1/4">
							<img
								src="https://futabus.vn/images/header/profile/Profile.svg"
								alt="profile"
							/>
						</div>
						<div className="basis-3/4 ml-3">Thông tin tài khoản</div>
					</div>
					<div className="flex flex-row p-2 mb-2 items-center hover:bg-slate-100 cursor-pointer">
						<div className="basis-1/4">
							<img
								src="https://futabus.vn/images/header/profile/History.svg"
								alt="history"
							/>
						</div>
						<div className="basis-3/4 ml-3">Lịch sử mua vé</div>
					</div>
					<div className="flex flex-row p-2 mb-2 items-center hover:bg-slate-100 cursor-pointer">
						<div className="basis-1/4">
							<img
								src="https://futabus.vn/images/header/profile/Address.svg"
								alt="address"
							/>
						</div>
						<div className="basis-3/4 ml-3">Địa chỉ của bạn</div>
					</div>
					<div
						className="flex flex-row p-2 mb-2 items-center hover:bg-slate-100 cursor-pointer"
						onClick={openChangePasswordModal}
					>
						<div className="basis-1/4">
							<img
								src="https://futabus.vn/images/header/profile/Password.svg"
								alt="password"
							/>
						</div>
						<div className="basis-3/4 ml-3">Đặt lại mật khẩu</div>
					</div>
					<div className="flex flex-row p-2 mb-2 items-center hover:bg-slate-100 cursor-pointer">
						<div className="basis-1/4">
							<img
								src="https://futabus.vn/images/header/profile/Logout.svg"
								alt="logout"
							/>
						</div>
						<div
							className="basis-3/4 ml-3"
							onClick={handleLogout}
						>
							Đăng xuất
						</div>
					</div>
				</div>
				<div className="md:basis-3/4 w-full">
					<h3 className="text-2xl font-semibold mb-2">Thông tin tài khoản</h3>
					<p className="text-sm text-slate-500 mb-5">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
					<div className="w-full border border-slate-300 rounded-xl p-3 flex flex-col md:flex-row">
						<div className="basis-1/3 flex flex-col p-2">
							<div className="flex justify-center mx-auto md:mx-0">
								<img
									src={user.avatarUrl}
									alt="avatar"
									className="aspect-square max-w-[200px] rounded-full object-cover"
								/>
							</div>
							<div className="mb-5 mt-8 text-center">
								<label
									htmlFor="image"
									className="cursor-pointer bg-slate-200 px-4 py-2 rounded-full hover:bg-slate-300"
								>
									Chọn ảnh
								</label>
								<input
									type="file"
									accept=".jpg,.png"
									id="image"
									onChange={(e) => handleChangeAvatar(e.target.files[0])}
									className="hidden"
								/>
							</div>
							<div className="text-center text-slate-500">
								Dung lượng file tối đa 1 MB Định dạng:.JPEG, .PNG
							</div>
						</div>
						<div className="basis-2/3 w-full flex flex-col p-3 md:p-5">
							<div className="flex flex-row mb-3 items-center">
								<div className="basis-1/3 text-slate-500">Họ</div>
								<div className="basis-2/3">
									: <span className="ml-3">{user.username?.trim().split(' ').slice(0, -1).join(' ')}</span>
								</div>
							</div>
							<div className="flex flex-row mb-3 items-center">
								<div className="basis-1/3 text-slate-500">Tên</div>
								<div className="basis-2/3">
									: <span className="ml-3">{user.username?.trim().split(' ').slice(-1)}</span>
								</div>
							</div>
							<div className="flex flex-row mb-3 items-center">
								<div className="basis-1/3 text-slate-500">Số điện thoại</div>
								<div className="basis-2/3">
									: <span className="ml-3">{user.phone_number}</span>
								</div>
							</div>
							<div className="flex flex-row mb-3 items-center">
								<div className="basis-1/3 text-slate-500">Giới tính</div>
								<div className="basis-2/3">
									: <span className="ml-3">{user.gender === 0 ? 'Nữ' : 'Nam'}</span>
								</div>
							</div>
							<div className="flex flex-row mb-3 items-center">
								<div className="basis-1/3 text-slate-500">Email</div>
								<div className="basis-2/3">
									: <span className="ml-3">{user.email}</span>
								</div>
							</div>
							<div className="flex flex-row mb-3 items-center">
								<div className="basis-1/3 text-slate-500">Ngày sinh</div>
								<div className="basis-2/3">
									: <span className="ml-3">{user.date_of_birth}</span>
								</div>
							</div>
							<div className="flex flex-row mb-3 items-center">
								<div className="basis-1/3 text-slate-500">Địa chỉ</div>
								<div className="basis-2/3">
									: <span className="ml-3">{user.address}</span>
								</div>
							</div>
							<div
								className="flex justify-center items-center bg-red-500 mx-auto px-8 py-2 rounded-full text-white mt-3 hover:bg-red-600 transition-colors cursor-pointer"
								onClick={openUpdateModal}
							>
								Cập nhật
							</div>
						</div>
					</div>
				</div>
			</div>
			{changePasswordModal && (
				<CustomerChangePasswordModal
					closeModal={closeChangePasswordModal}
					setMessage={setMessage}
					openFailureModal={openFailureModal}
					openSuccessModal={openSuccessModal}
				/>
			)}
			{modelUpdate && (
				<CustomerAccountUpdateModal
					closeModal={closeUpdateModal}
					refresh={refresh}
					setMessage={setMessage}
					openFailureModal={openFailureModal}
					openSuccessModal={openSuccessModal}
				/>
			)}
			{successModal && (
				<SuccessNotification
					func={{ closeModal: closeSuccessModal }}
					message={message}
				/>
			)}
			{failureModal && (
				<FailureNotification
					func={{ closeModal: closeFailureModal }}
					message={message}
				/>
			)}
		</div>
	);
}

export default ProfileManagementForm;