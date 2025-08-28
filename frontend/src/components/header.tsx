import LoginComponent from './login';

const Header = () => {
  return (
    <header className="flex justify-between items-center py-4 px-6 bg-teal-50">
      <h2 className="text-3xl font-bold text-teal-600">Title</h2>
      <LoginComponent />
    </header>
  );
};

export default Header;