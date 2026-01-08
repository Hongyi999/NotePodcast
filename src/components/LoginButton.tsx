import './LoginButton.css';

interface LoginButtonProps {
  onClick?: () => void;
}

export function LoginButton({ onClick }: LoginButtonProps) {
  return (
    <button className="login-button" onClick={onClick}>
      Sign In
    </button>
  );
}

