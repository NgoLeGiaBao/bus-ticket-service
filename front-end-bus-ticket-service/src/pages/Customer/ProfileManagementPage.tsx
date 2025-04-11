import React from 'react';
import ProfileManagementForm from '../../components/ProfileManagementForm';
const ProfileManagementPage: React.FC = () => {
	return (
		<div className="flex flex-col min-h-screen">
			<ProfileManagementForm />
		</div>
	);
};

export default ProfileManagementPage;