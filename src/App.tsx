import { useEffect, useState } from 'react'
import './App.css'

type User = {
  userId: string
  firstName: string
  lastName: string
  avatarUrl: string
}
function App() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/user/1').then(res => res.json()),
      fetch('/user/2').then(res => res.json()),
      fetch('/user/3').then(res => res.json()),
      fetch('/user/4').then(res => res.json()),
      fetch('/user/5').then(res => res.json()),
    ]).then(data => setUsers(data))
  }, [])

  return (
    <>
      <h1>Users</h1>
      {users.map(user => (
        <div data-testid="user" key={user.userId} className="card">
          <img
            src={user.avatarUrl}
            alt={`${user.firstName} ${user.lastName}`}
          />
          <h2>
            {user.firstName} {user.lastName}
          </h2>
          <p>User ID: {user.userId}</p>
        </div>
      ))}
    </>
  )
}

export default App
