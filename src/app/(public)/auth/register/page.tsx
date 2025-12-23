export default function RegisterPage() {
  return (
    <div className="min-h-screen flex justify-center items-center">
      
      <form className="w-100 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl mb-4">Регистрация</h2>
       
        <input type="email" placeholder="Email" className="w-full mb-4 p-2 border" />
        <input type="password" placeholder="Пароль" className="w-full mb-4 p-2 border" />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Зарегистрироваться</button>
      </form>
    </div>
  );
}