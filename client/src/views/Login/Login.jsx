import "@root/main.css"; // Tawilwind stylesheet

export default function Login( props ) {
  return (
    <div>
      <form>
        <p>
          <label>Username: <input type="text" /></label>
        </p>
        <p>
          <label>Password: <input type="password" /></label>
        </p>
        <p>
          <button type="submit">submit</button>
        </p>
      </form>
    </div>
  )
}