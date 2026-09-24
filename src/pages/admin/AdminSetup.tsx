import { Navigate } from 'react-router-dom';

// Initial administrator provisioning is an authenticated database operation.
export default function AdminSetup() {
  return <Navigate to="/admin/login" replace />;
}
