import { LogOut as LogOutIcon } from 'lucide-react';
import LogoutAction from './LogoutAction';

interface PropsType {
  className?: string | undefined;
}

const LogOut: React.FC<PropsType> = props => {
  return (
    <form className={props.className} action={LogoutAction}>
      <button
        type="submit"
        className="rounded-md bg-destructive hover:opacity-90 hover:ring-4 hover:ring-destructive transition duration-200 delay-300 hover:text-opacity-100 text-destructive-foreground px-4 py-2 flex items-center gap-2"
      >
        Logout
        <LogOutIcon size={18} />
      </button>
    </form>
  );
};

export default LogOut;
