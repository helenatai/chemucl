import Image from 'next/image';

const Logo = () => {
  return (
    <Image
      src="/assets/images/auth/ucl-logo-white.png"
      alt="My App Logo"
      width={120}
      height={120}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
};

export default Logo;
