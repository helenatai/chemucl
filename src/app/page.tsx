// project import
import GuestGuard from 'utils/route-guard/GuestGuard';
import Login from 'views/authentication/login';

// ==============================|| HOME PAGE ||============================== //

export default function HomePage() {
  return (
    <GuestGuard>
      <Login />
    </GuestGuard>
  );
}
