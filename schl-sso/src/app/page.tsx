import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Login from './components/Login';

const HomePage = async () => {
  const session = await auth();

  if (session?.user) {
    redirect('/redirect');
  }

  return <Login />;
};

export default HomePage;
